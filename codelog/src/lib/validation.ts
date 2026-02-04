import { z } from 'zod';

export const blogRequestSchema = z.object({
  topic: z.string().min(2).max(120),
  keywords: z.array(z.string().min(1).max(24)).max(10),
  style: z.enum(['tutorial', 'til', 'troubleshooting']),
});

export const blogResultSchema = z.object({
  title: z.string().min(4),
  content: z.string().min(20),
  hashtags: z.array(z.string().min(1)).max(10),
  metaDescription: z.string().min(20).max(200),
});
