# CodeLog 테스트 케이스 (MVP)

## 1) 테스트 범위
- 대상: `src/app/api/generate/route.ts`, `src/services/ai/generateBlog.ts`, 생성/결과 화면
- 목표: 템플릿 구조 준수, 데이터 유효성, 에러 UX, SEO 메타 생성 검증

## 2) 상태 플로우 기준
- `idle`: 입력 대기, 생성 버튼 활성
- `loading`: 생성 중 인디케이터 표시, 중복 클릭 방지
- `success`: 제목/본문/해시태그/메타설명 렌더링
- `error`: 토스트 메시지 노출, 재시도 가능

## 3) API 요청/응답 기준
### 요청 JSON
```json
{
  "topic": "React useEffect 사용법",
  "keywords": ["의존성 배열", "cleanup"],
  "style": "tutorial",
  "language": "ko",
  "tone": "professional",
  "length": "medium",
  "includeCode": true
}
```

### 응답 JSON
```json
{
  "title": "string",
  "content": "markdown string",
  "hashtags": ["string"],
  "metaDescription": "string"
}
```

## 4) 테스트 케이스
| ID | 시나리오 | 입력/조건 | 기대 결과 |
| --- | --- | --- | --- |
| TC-01 | 튜토리얼 정상 생성 | `style=tutorial` | 200, `## 개요/사전 준비/Step1/Step2/Step3/마무리` 순서 고정 |
| TC-02 | TIL 정상 생성 | `style=til` | 200, `## 오늘 배운 것/상세 내용/어려웠던 점/느낀 점` 고정 |
| TC-03 | 트러블슈팅 정상 생성 | `style=troubleshooting` | 200, `## 문제 상황/원인 분석/해결 방법/결론` 고정 |
| TC-04 | 필수값 누락 | `topic=""` | API 호출 차단, 토스트로 입력 오류 노출 |
| TC-05 | 주제 길이 초과 | topic 121자 이상 | API 호출 차단, 길이 오류 토스트 |
| TC-06 | 키워드 개수 0개 | `keywords=[]` | API 호출 차단, 키워드 오류 토스트 |
| TC-07 | 키워드 길이 초과 | 한 키워드 41자 이상 | API 호출 차단, 키워드 길이 오류 토스트 |
| TC-08 | 특수문자/공백 입력 | `"   "`, `"@@@###"` | 트림/검증 후 실패 처리, 에러 토스트 |
| TC-09 | 주제-키워드 불일치 | topic: React / keywords: Spring, JPA | 200 가능, 결과 품질 저하 여부 확인(개선 backlog 등록) |
| TC-10 | 템플릿 이탈 보정 | 모델이 섹션 순서 어김 | 서버 보정 후 최종 `content`는 템플릿 순서 준수 |
| TC-11 | API 키 누락 | `OPENAI_API_KEY` 없음 | 500, 사용자 친화 메시지 + 토스트 |
| TC-12 | OpenAI 429 | quota 초과 계정 | 적절한 오류 메시지, 토스트, 화면 멈춤 없음 |
| TC-13 | OpenAI 타임아웃/지연 | 응답 지연 강제 | 로딩 유지 후 오류 처리, 재시도 가능 |
| TC-14 | SEO 메타 생성 | 정상 생성 | `metaDescription` 20~200자, 주제 키워드 포함 |
| TC-15 | 결과 화면 내비게이션 | Step TOC 클릭 | 해당 섹션으로 스크롤 이동, 헤더 가림 없음 |

## 5) 실행 체크리스트
- [ ] `loading` 중 생성 버튼이 중복 동작하지 않는다.
- [ ] 모든 에러는 인라인 텍스트 대신 토스트로 안내된다.
- [ ] `hashtags`는 `#` 제거 후 일관된 배열로 렌더링된다.
- [ ] 코드 블록이 있을 때 Prism 하이라이팅이 적용된다.
- [ ] 결과 페이지 새로고침/뒤로가기 후 앱이 깨지지 않는다.

## 6) 우선순위
- P0: TC-01~TC-07, TC-11~TC-13
- P1: TC-10, TC-14, TC-15
- P2: TC-08, TC-09
