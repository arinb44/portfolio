import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One Markdown file per project (spec 3.3). A missing or blank alt text fails the build.
const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: ({ image }) => {
    const layer = <N extends string>(name: N) =>
      z.object({
        name: z.literal(name),
        status: z.enum(['finished', 'in-progress']),
        text: z.string().trim().min(1),
        images: z
          .array(z.object({ src: image(), alt: z.string().trim().min(1), caption: z.string() }))
          .min(1),
      });

    return z.object({
      draft: z.boolean().default(false), // true until the facts are checked
      title: z.string(),
      oneLine: z.string().max(90),
      role: z.string(),
      stack: z.array(z.string()).min(1),
      year: z.number().int(),
      order: z.number().int(),
      featured: z.boolean().default(false),
      series: z.literal('prediction').optional(),
      demo: z.object({
        url: z.url().optional(),
        kind: z.enum(['live', 'video', 'none']),
        coldStartSeconds: z.number().optional(),
      }),
      repo: z.url(),
      video: z.string().optional(),
      metric: z
        .object({ value: z.string(), label: z.string(), baseline: z.string().optional(), context: z.string() })
        .optional(),
      predella: z.object({ image: image(), alt: z.string() }),
      // Exactly four layers, in this order.
      layers: z.tuple([layer('varnish'), layer('paint'), layer('underpainting'), layer('underdrawing')]),
    });
  },
});

export const collections = { projects };
