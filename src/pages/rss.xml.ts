import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context: import('astro').APIContext) {
  const blog = await getCollection('blog');
  const sortedPosts = blog.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  return rss({
    title: 'PEJDO.COM Blog',
    description: 'Zapisi o rodu Pejdo, hercegovačkom Brotnju, vjeri, duhanu i lozi.',
    site: context.site ?? 'https://pejdo.com',
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      author: post.data.author ?? 'Nikola Pejdo',
      link: `/blog/${post.id}/`,
    })),
    customData: `<language>hr</language>
<managingEditor>nikola@pejdo.com (Nikola Pejdo)</managingEditor>
<webMaster>nikola@pejdo.com (Nikola Pejdo)</webMaster>`,
  });
}
