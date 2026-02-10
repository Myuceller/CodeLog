import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateBlogDraft } from '@/services/ai/generateBlog';
import { blogRequestSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = blogRequestSchema.parse(body);

    const result = await generateBlogDraft(payload);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '입력값이 올바르지 않습니다.' },
        { status: 400 }
      );
    }

    console.error('generate error', error);
    return NextResponse.json(
      { error: '글 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}
