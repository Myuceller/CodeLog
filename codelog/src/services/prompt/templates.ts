import { BlogStyle } from '@/models/dto/blog';

export const TEMPLATE_SECTIONS: Record<BlogStyle, string[]> = {
  tutorial: ['개요', '사전 준비', 'Step 1', 'Step 2', 'Step 3', '마무리'],
  til: ['오늘 배운 것', '상세 내용', '어려웠던 점', '느낀 점'],
  troubleshooting: ['문제 상황', '원인 분석', '해결 방법', '결론'],
};

const basePrompt = `당신은 기술 블로그 전문 작가입니다.
사용자가 제공한 주제와 키워드를 바탕으로 기술 블로그 글을 작성합니다.

아래 규칙을 반드시 지키세요:
1) content는 마크다운이며, 지정된 섹션 제목을 정확히 사용합니다.
2) 섹션 순서를 절대 바꾸지 마세요.
3) 추가 섹션을 만들지 마세요.
4) includeCode가 "미포함"이면 코드 블록을 넣지 마세요.
5) includeCode가 "포함"이면 최소 2개의 코드 블록을 넣고, 언어 태그를 붙입니다.
6) 각 섹션은 최소 2개 문단 이상으로 상세히 작성합니다.
7) 핵심 키워드를 자연스럽게 본문 전체에 반영합니다.
8) 원리 설명 + 실무 관점(주의점/실수/검증 포인트)을 반드시 포함합니다.
9) JSON 이외 텍스트(설명/코드펜스)를 응답에 포함하지 마세요.

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
6) ## 마무리

튜토리얼 추가 규칙:
- 각 Step은 "무엇을 하는지", "왜 필요한지", "실행 방법", "확인 방법"을 포함하세요.
- Step 1~3 중 최소 2개는 코드 예시를 포함하세요.`,
  til: `
다음 제목을 정확히 사용하고, 순서대로 작성하세요:
1) ## 오늘 배운 것
2) ## 상세 내용
3) ## 어려웠던 점
4) ## 느낀 점

TIL 추가 규칙:
- 상세 내용에는 개념 설명과 짧은 코드 예시를 함께 넣으세요.
- 어려웠던 점에는 실제 막혔던 지점과 해결 근거를 구체적으로 쓰세요.`,
  troubleshooting: `
다음 제목을 정확히 사용하고, 순서대로 작성하세요:
1) ## 문제 상황
2) ## 원인 분석
3) ## 해결 방법
4) ## 결론

트러블슈팅 추가 규칙:
- 문제 상황에 재현 조건을 명확히 적으세요.
- 원인 분석은 가설 2개 이상 검토 후 최종 원인을 제시하세요.
- 해결 방법은 단계별 체크리스트 형식으로 작성하세요.`,
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
  const lengthRule =
    length === 'short'
      ? '총 700자 이상, 각 섹션 2문단 이상'
      : length === 'long'
        ? '총 2200자 이상, 각 섹션 3문단 이상'
        : '총 1300자 이상, 각 섹션 2~3문단';

  return `주제: ${topic}
키워드: ${keywords.join(', ')}
언어: ${language === 'ko' ? '한국어' : '영어'}
어조: ${tone}
길이: ${length}
길이 규칙: ${lengthRule}
코드 예시: ${includeCode ? '포함' : '미포함'}

위 주제와 키워드를 바탕으로 기술 블로그 글을 작성해주세요.
섹션 제목은 반드시 템플릿 가이드의 제목을 그대로 사용하세요.
키워드는 제목/본문에 고르게 녹여서 검색 의도를 충족하세요.`;
}
