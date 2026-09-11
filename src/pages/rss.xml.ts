import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context: import('astro').APIContext) {
  const blog = await getCollection('blog');
  const sortedPosts = blog.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  return rss({
    title: 'PEJDO.COM Blog',
    description: 'Articles, tutorials, and updates from Nikola Pejdo',
    site: context.site ?? 'https://astrodeck.dev',
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      author: post.data.author ?? 'Nikola Pejdo',
      link: `/blog/${post.id}/`,
    })),
    customData: `<language>en-us</language>
<managingEditor>nikola@pejdo.com (Nikola Pejdo)</managingEditor>
<webMaster>nikola@pejdo.com (Nikola Pejdo)</webMaster>`,
  });
}
