import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateBlogDraft } from '@/services/ai/generateBlog';
import { blogRequestSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY가 설정되지 않았습니다. .env.local을 확인해주세요.' },
        { status: 500 }
      );
    }

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

    const apiStatus =
      typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      typeof (error as { status?: unknown }).status === 'number'
        ? (error as { status: number }).status
        : undefined;

    if (apiStatus === 429) {
      return NextResponse.json(
        { error: '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.' },
        { status: 429 }
      );
    }

    if (apiStatus === 401) {
      return NextResponse.json(
        { error: 'API 키가 올바르지 않거나 설정되지 않았습니다.' },
        { status: 401 }
      );
    }

    console.error('generate error', error);
    return NextResponse.json(
      { error: '글 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}
