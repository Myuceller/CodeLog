import { NextRequest } from 'next/server';
import { streamBlogDraft } from '@/services/ai/streamBlog';
import { blogRequestSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      { error: 'OPENAI_API_KEY가 설정되지 않았습니다. .env.local을 확인해주세요.' },
      { status: 500 }
    );
  }

  const body = await request.json();
  const payload = blogRequestSchema.parse(body);
  return streamBlogDraft(payload);
}
