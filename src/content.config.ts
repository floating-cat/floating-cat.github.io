import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  loader: glob({ base: "./src/content", pattern: "**/[^_]*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()),
    category: z.string(),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = { blog };
