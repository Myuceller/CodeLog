import OpenAI from 'openai';
import { BlogRequest, BlogResult } from '@/models/dto/blog';
import { buildSystemPrompt, buildUserPrompt, TEMPLATE_SECTIONS } from '@/services/prompt/templates';
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
    temperature: 0.5,
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

  const result = blogResultSchema.parse(normalized);

  if (isTemplateAligned(result.content, payload.style)) {
    return result;
  }

  const repairedContent = await repairContentToTemplate(result.content, payload);
  return {
    ...result,
    content: repairedContent ?? result.content,
  };
}

function parseModelJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    const fenced = raw.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
    return JSON.parse(fenced);
  }
}

function isTemplateAligned(content: string, style: BlogRequest['style']): boolean {
  const required = TEMPLATE_SECTIONS[style];
  const extracted = extractTopLevelSections(content);
  if (extracted.length !== required.length) {
    return false;
  }
  return required.every((section, idx) => extracted[idx] === section);
}

function extractTopLevelSections(content: string): string[] {
  const matches = content.match(/^##\s+(.+)$/gm);
  if (!matches) return [];
  return matches.map((line) => line.replace(/^##\s+/, '').trim());
}

async function repairContentToTemplate(
  content: string,
  payload: BlogRequest,
): Promise<string | null> {
  const openai = getClient();
  const requiredSections = TEMPLATE_SECTIONS[payload.style]
    .map((name, index) => `${index + 1}) ## ${name}`)
    .join('\n');

  const repair = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          '당신은 기술 블로그 편집자입니다. 본문의 정보 밀도를 유지한 채, 지정된 섹션 제목/순서로 재구성하세요.',
      },
      {
        role: 'user',
        content: `아래 본문을 템플릿에 맞춰 재작성하세요.

요구사항:
- 섹션 제목은 아래 목록을 정확히 사용
- 순서 고정, 추가 섹션 금지
- 각 섹션 최소 2문단
- includeCode가 true면 코드 블록 최소 2개 유지/추가
- 출력은 마크다운 본문만 출력

템플릿 섹션:
${requiredSections}

includeCode: ${payload.includeCode ? 'true' : 'false'}

원본 본문:
${content}`,
      },
    ],
    temperature: 0.2,
    max_tokens: 2200,
  });

  const repaired = repair.choices[0]?.message?.content?.trim() ?? '';
  if (!repaired) return null;
  return isTemplateAligned(repaired, payload.style) ? repaired : null;
}
