import { NextRequest } from 'next/server';
import { streamBlogDraft } from '@/services/ai/streamBlog';
import { blogRequestSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const payload = blogRequestSchema.parse(body);
  return streamBlogDraft(payload);
}
