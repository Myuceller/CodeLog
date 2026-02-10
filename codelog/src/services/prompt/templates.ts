import { BlogStyle } from '@/models/dto/blog';

const basePrompt = `당신은 기술 블로그 전문 작가입니다.
사용자가 제공한 주제와 키워드를 바탕으로 기술 블로그 글을 작성합니다.

아래 규칙을 반드시 지키세요:
1) content는 마크다운이며, 지정된 섹션 제목을 정확히 사용합니다.
2) 섹션 순서를 절대 바꾸지 마세요.
3) 추가 섹션을 만들지 마세요.
4) includeCode가 "미포함"이면 코드 블록을 넣지 마세요.
5) includeCode가 "포함"이면 최소 1개의 코드 블록을 넣고, 언어 태그를 붙입니다.

응답은 반드시 아래 JSON 형식으로만 해주세요:
{
  "title": "SEO에 최적화된 제목",
  "content": "마크다운 형식의 본문",
  "hashtags": ["태그1", "태그2", "태그3"],
  "metaDescription": "SEO 메타 설명 (160자 이내)"
}`;

const styleGuides: Record<BlogStyle, string> = {
  tutorial: `
다음 제목을 정확히 사용하고, 순서대로 작성하세요:
1) ## 개요
2) ## 사전 준비
3) ## Step 1
4) ## Step 2
5) ## Step 3
6) ## 마무리`,
  til: `
다음 제목을 정확히 사용하고, 순서대로 작성하세요:
1) ## 오늘 배운 것
2) ## 상세 내용
3) ## 어려웠던 점
4) ## 느낀 점`,
  troubleshooting: `
다음 제목을 정확히 사용하고, 순서대로 작성하세요:
1) ## 문제 상황
2) ## 원인 분석
3) ## 해결 방법
4) ## 결론`,
  deepdive: `
다음 제목을 정확히 사용하고, 순서대로 작성하세요:
1) ## 개요
2) ## 원리/배경
3) ## 상세 분석
4) ## 예시
5) ## 결론`,
};

export function buildSystemPrompt(style: BlogStyle): string {
  return basePrompt + (styleGuides[style] || styleGuides.tutorial);
}

export function buildUserPrompt(
  topic: string,
  keywords: string[],
  options?: {
    language?: string;
    tone?: string;
    length?: string;
    includeCode?: boolean;
  }
): string {
  const language = options?.language ?? 'ko';
  const tone = options?.tone ?? 'professional';
  const length = options?.length ?? 'medium';
  const includeCode = options?.includeCode ?? true;

  return `주제: ${topic}
키워드: ${keywords.join(', ')}
언어: ${language === 'ko' ? '한국어' : '영어'}
어조: ${tone}
길이: ${length}
코드 예시: ${includeCode ? '포함' : '미포함'}

위 주제와 키워드를 바탕으로 기술 블로그 글을 작성해주세요.
섹션 제목은 반드시 템플릿 가이드의 제목을 그대로 사용하세요.`;
}
