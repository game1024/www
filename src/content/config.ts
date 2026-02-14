import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    cover: image().optional(),
    description: z.string().optional(),
    createdAt: z.coerce.date().transform(v => new Date(v)),
    updatedAt: z.coerce.date().optional().transform(v => v ? new Date(v) : undefined),
    tags: z.array(z.string()).optional(),
    category: z.string().optional(),
    draft: z.boolean().optional(),
  }),
});

const book = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    createdAt: z.coerce.date().transform(v => new Date(v)),
    updatedAt: z.coerce.date().optional().transform(v => v ? new Date(v) : undefined),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = {
  posts,
  book,
};
