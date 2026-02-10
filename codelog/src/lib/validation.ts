import { z } from 'zod';

export const blogRequestSchema = z.object({
  topic: z.string().min(2).max(120),
  keywords: z.array(z.string().min(1).max(40)).max(15),
  style: z.enum(['tutorial', 'til', 'troubleshooting', 'deepdive']),
  language: z.enum(['ko', 'en']).optional().default('ko'),
  tone: z.enum(['professional', 'casual', 'friendly']).optional().default('professional'),
  length: z.enum(['short', 'medium', 'long']).optional().default('medium'),
  includeCode: z.boolean().optional().default(true),
});

export const blogResultSchema = z.object({
  title: z.string().min(4),
  content: z.string().min(20),
  hashtags: z.array(z.string().min(1)).max(10),
  metaDescription: z.string().min(20).max(200),
});

export type BlogRequestInput = z.infer<typeof blogRequestSchema>;
export type BlogResultOutput = z.infer<typeof blogResultSchema>;
