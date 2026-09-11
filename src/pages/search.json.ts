import { getCollection } from 'astro:content';
import { pjesme } from '@/data/pjesme';
import { sententiae } from '@/data/sententiae';

/**
 * Search index for the whole site, built at build time and served as static JSON.
 *
 * The header search box fetches this once, on first use, and filters it in the
 * browser. That keeps search entirely static - no server, no third-party service,
 * no API key - which suits a site of this size: the index is a few tens of
 * kilobytes, far less than a single photo.
 *
 * Fetched lazily rather than inlined into every page, so the cost is paid only by
 * visitors who actually search.
 */

/** One searchable thing on the site. */
interface SearchDoc {
  /** Path to the page, with any anchor */
  url: string;
  /** Heading shown in the results list */
  title: string;
  /** Second line: poet, source, description */
  meta: string;
  /** Which part of the site this came from, shown as a label */
  kind: 'Zapis' | 'Pjesma' | 'Sentencija' | 'Stranica';
  /** Lowercased, diacritic-free text that is actually matched against */
  haystack: string;
}

/** Lowercases and strips diacritics, so c matches č and d matches đ. */
function fold(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
}

/**
 * Strips Markdown to plain prose for indexing.
 *
 * Only what the syntax in these posts actually needs: headings, emphasis, links,
 * images, inline code, blockquotes and list bullets.
 */
function stripMarkdown(body: string): string {
  return body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/[*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Static pages worth reaching by name, with the words someone might search for. */
const staticPages: { url: string; title: string; meta: string; keywords: string }[] = [
  {
    url: '/',
    title: 'Početna',
    meta: 'Obitelj Pejdo — rod iz Blizanaca na hercegovačkom Brotnju',
    keywords: 'pejdo obitelj rod blizanci čitluk brotnjo hercegovina naslovnica',
  },
  {
    url: '/pjesme',
    title: 'Pjesme',
    meta: 'Pjesme hrvatskih pjesnika',
    keywords: 'poezija stihovi pjesnici mažuranić preradović matoš ujević cesarić',
  },
  {
    url: '/latinski',
    title: 'Latinski',
    meta: 'Latinske sentencije s prijevodima',
    keywords: 'latinski sentencije izreke',
  },
  {
    url: '/fotos',
    title: 'Fotografije',
    meta: 'Galerija fotografija',
    keywords: 'fotografije slike galerija fotos logo znak',
  },
  { url: '/video', title: 'Video', meta: 'Videozapisi', keywords: 'video snimke film vimeo' },
  {
    url: '/blog',
    title: 'Zapisi',
    meta: 'Svi zapisi',
    keywords: 'blog zapisi članci arhiva',
  },
  {
    url: '/contact',
    title: 'Kontakt',
    meta: 'Javite se',
    keywords: 'kontakt e-pošta poruka javite se',
  },
];

export async function GET() {
  const docs: SearchDoc[] = [];

  const posts = await getCollection('blog');
  for (const post of posts) {
    docs.push({
      url: `/blog/${post.id}/`,
      title: post.data.title,
      meta: post.data.description,
      kind: 'Zapis',
      haystack: fold(
        [
          post.data.title,
          post.data.description,
          post.data.tags.join(' '),
          stripMarkdown(post.body ?? ''),
        ].join(' ')
      ),
    });
  }

  for (const pjesma of pjesme) {
    docs.push({
      url: '/pjesme',
      title: pjesma.title,
      meta: `${pjesma.poet}, ${pjesma.year}`,
      kind: 'Pjesma',
      haystack: fold(
        [pjesma.title, pjesma.poet, pjesma.year, pjesma.collection ?? '', pjesma.text ?? ''].join(
          ' '
        )
      ),
    });
  }

  for (const sententia of sententiae) {
    docs.push({
      url: '/latinski',
      title: sententia.latin,
      meta: sententia.translation,
      kind: 'Sentencija',
      haystack: fold([sententia.latin, sententia.translation, sententia.source].join(' ')),
    });
  }

  for (const page of staticPages) {
    docs.push({
      url: page.url,
      title: page.title,
      meta: page.meta,
      kind: 'Stranica',
      haystack: fold([page.title, page.meta, page.keywords].join(' ')),
    });
  }

  return new Response(JSON.stringify(docs), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
