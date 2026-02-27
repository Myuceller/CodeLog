# CodeLog

AI 기반 기술 블로그 초안 생성 서비스입니다.  
주제/키워드/템플릿을 입력하면 제목, 본문(마크다운), 해시태그, SEO 메타 설명을 생성합니다.

## Stack
- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS
- OpenAI API
- Vercel

## 주요 기능
- 템플릿 기반 생성: `tutorial`, `til`, `troubleshooting`
- 생성 결과: `title`, `content`, `hashtags`, `metaDescription`
- 템플릿 목차 강제 및 서버 측 보정 로직
- 생성 실패/검증 오류 토스트 UX
- 결과 화면:
  - Prism.js 코드 하이라이팅
  - 코드 블록별 복사 버튼
  - 목차 클릭 스크롤 이동
  - Step 섹션 강조 스타일
  - 코드 블록 가독성 강화
- 내보내기: Markdown(.md), HTML(.html)
- 생성 이력 로컬 저장(`localStorage`)

## 최근 구현 사항
- 홈/생성/결과/이력 화면 통합 및 네비게이션 정리
- 한글 IME 입력 시 키워드 중복 추가 버그 수정
- 결과 화면 반응형 레이아웃 재정렬
  - 데스크탑: 좌측 목차 + 우측 본문
  - 모바일: 버튼/컨텐츠 줄바꿈 최적화
- 상단 헤더 고정 및 뷰포트 너비 대응 개선
- 토스트 위치 개선(상단 중앙), 에러 메시지 일관화
- 불필요한 UI 컴포넌트/미사용 파일 정리

## 프로젝트 문서
- 기획/보완 문서: `docs/planning-v2.md`
- 테스트 케이스: `docs/test-cases.md`

## 로컬 실행
1. `codelog/.env.local` 생성
2. 아래 값 설정
```bash
OPENAI_API_KEY=your_openai_api_key
```
3. 실행
```bash
npm install
npm run dev
```
4. 브라우저에서 `http://localhost:3000`

## API
### `POST /api/generate`
요청 예시:
```json
{
  "topic": "React useEffect 사용법",
  "keywords": ["의존성 배열", "cleanup", "무한 루프"],
  "style": "tutorial",
  "language": "ko",
  "tone": "professional",
  "length": "medium",
  "includeCode": true
}
```

응답 예시:
```json
{
  "title": "string",
  "content": "markdown string",
  "hashtags": ["string"],
  "metaDescription": "string"
}
```

## 검증
```bash
npm run lint
```
