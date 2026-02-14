import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('posts');
  const filtered = posts
    .filter(p => !p.data.draft)
    .sort((a, b) => b.data.createdAt.getTime() - a.data.createdAt.getTime());

  return rss({
    title: 'Game1024の博客',
    description: '看到的越多，知道的越少',
    site: context.site!,
    items: filtered.map(post => ({
      title: post.data.title,
      pubDate: post.data.createdAt,
      description: post.data.description ?? '',
      link: `/posts/${post.slug}/`,
    })),
  });
}
