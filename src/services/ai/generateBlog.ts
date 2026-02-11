import OpenAI from 'openai';
import { BlogRequest, BlogResult } from '@/models/dto/blog';
import { buildSystemPrompt, buildUserPrompt } from '@/services/prompt/templates';
import { blogResultSchema } from '@/lib/validation';

function getClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function generateBlogDraft(payload: BlogRequest): Promise<BlogResult> {
  const openai = getClient();
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: buildSystemPrompt(payload.style) },
      {
        role: 'user',
        content: buildUserPrompt(payload.topic, payload.keywords, {
          language: payload.language,
          tone: payload.tone,
          length: payload.length,
          includeCode: payload.includeCode,
        }),
      },
    ],
    max_tokens: 2000,
    temperature: 0.7,
  });

  if (completion.usage) {
    console.info('[openai usage]', {
      prompt_tokens: completion.usage.prompt_tokens,
      completion_tokens: completion.usage.completion_tokens,
      total_tokens: completion.usage.total_tokens,
    });
  }

  const content = completion.choices[0]?.message?.content ?? '';
  const parsed = parseModelJson(content);
  const obj =
    parsed && typeof parsed === 'object'
      ? (parsed as Record<string, unknown>)
      : {};
  const normalized = {
    ...obj,
    hashtags: Array.isArray(obj.hashtags)
      ? obj.hashtags.map((tag) => String(tag).replace(/^#/, ''))
      : obj.hashtags,
  };

  return blogResultSchema.parse(normalized);
}

function parseModelJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    const fenced = raw.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
    return JSON.parse(fenced);
  }
}
