import OpenAI from 'openai';
import { BlogRequest, BlogResult } from '@/models/dto/blog';
import { buildSystemPrompt, buildUserPrompt } from '@/services/prompt/templates';
import { blogResultSchema } from '@/lib/validation';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateBlogDraft(payload: BlogRequest): Promise<BlogResult> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: buildSystemPrompt(payload.style) },
      { role: 'user', content: buildUserPrompt(payload.topic, payload.keywords) },
    ],
    max_tokens: 2000,
    temperature: 0.7,
  });

  const content = completion.choices[0]?.message?.content ?? '';
  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch {
    parsed = {
      title: '생성 실패',
      content,
      hashtags: [],
      metaDescription: '',
    };
  }

  return blogResultSchema.parse(parsed);
}
