"use client";

import { useRef, useState } from "react";
import {
  Sparkles,
  BookOpen,
  Lightbulb,
  Bug,
  X,
  Plus,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GenerateScreenProps {
  onNavigate: (page: string) => void;
  onGenerated: (
    result: {
      title: string;
      content: string;
      hashtags: string[];
      metaDescription: string;
    },
    request: {
      topic: string;
      keywords: string[];
      style: string;
      language: string;
      tone: string;
      length: string;
      includeCode: boolean;
    }
  ) => void;
  selectedTemplate: string;
  onTemplateChange: (template: string) => void;
}

const templates = [
  { id: "tutorial", label: "튜토리얼", icon: BookOpen, color: "border-blue-500 bg-blue-500/10 text-blue-600" },
  { id: "til", label: "TIL", icon: Lightbulb, color: "border-amber-500 bg-amber-500/10 text-amber-600" },
  { id: "troubleshooting", label: "트러블슈팅", icon: Bug, color: "border-red-500 bg-red-500/10 text-red-500" },
];

const sampleKeywords = ["React", "useState", "컴포넌트", "상태관리"];

export function GenerateScreen({
  onNavigate,
  onGenerated,
  selectedTemplate,
  onTemplateChange,
}: GenerateScreenProps) {
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState<string[]>(sampleKeywords);
  const [keywordInput, setKeywordInput] = useState("");
  const [language, setLanguage] = useState("ko");
  const [tone, setTone] = useState("professional");
  const [length, setLength] = useState("medium");
  const [includeCode, setIncludeCode] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const isComposingKeyword = useRef(false);
  const { toast } = useToast();

  const addKeyword = () => {
    const nextKeyword = keywordInput.trim();
    if (!nextKeyword) return;

    setKeywords((prev) =>
      prev.includes(nextKeyword) ? prev : [...prev, nextKeyword]
    );
    setKeywordInput("");
  };

  const removeKeyword = (kw: string) => {
    setKeywords(keywords.filter((k) => k !== kw));
  };

  const handleGenerate = async () => {
    const normalizedTopic = topic.trim();
    const normalizedKeywords = keywords
      .map((keyword) => keyword.trim())
      .filter(Boolean);

    if (!normalizedTopic) {
      toast({
        title: "입력 확인",
        description: "주제를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (normalizedTopic.length < 2 || normalizedTopic.length > 120) {
      toast({
        title: "입력 확인",
        description: "주제는 2자 이상 120자 이하로 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (!/[A-Za-z0-9가-힣]/.test(normalizedTopic)) {
      toast({
        title: "입력 확인",
        description: "주제에 글자/숫자를 포함해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (normalizedKeywords.length === 0 || normalizedKeywords.length > 15) {
      toast({
        title: "입력 확인",
        description: "키워드는 1개 이상 15개 이하로 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (normalizedKeywords.some((keyword) => keyword.length > 40)) {
      toast({
        title: "입력 확인",
        description: "각 키워드는 40자 이하로 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    let timeoutId: number | undefined;
    try {
      const controller = new AbortController();
      timeoutId = window.setTimeout(() => controller.abort(), 30000);
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          topic: normalizedTopic,
          keywords: normalizedKeywords,
          style: selectedTemplate,
          language,
          tone,
          length,
          includeCode,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "생성 실패");
      }

      const result = await response.json();
      onGenerated(result, {
        topic: normalizedTopic,
        keywords: normalizedKeywords,
        style: selectedTemplate,
        language,
        tone,
        length,
        includeCode,
      });
      onNavigate("result");
    } catch (err) {
      const isTimeout =
        err instanceof DOMException && err.name === "AbortError";
      toast({
        title: "글 생성 실패",
        description:
          isTimeout
            ? "요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요."
            : err instanceof Error
              ? err.message
              : "글 생성에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      setIsGenerating(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">새 글 생성</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          주제와 옵션을 설정한 후 AI가 기술 블로그 글을 생성합니다
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Left: Form */}
        <div className="flex flex-col gap-6 lg:col-span-3">
          {/* Template Selection */}
          <div className="rounded-xl border bg-card p-6">
            <label className="mb-3 block text-sm font-semibold text-card-foreground">
              템플릿 선택
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {templates.map((t) => {
                const Icon = t.icon;
                const isSelected = selectedTemplate === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onTemplateChange(t.id)}
                    className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-sm font-medium transition-all ${
                      isSelected
                        ? t.color
                        : "border-transparent bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Topic */}
          <div className="rounded-xl border bg-card p-6">
            <label
              htmlFor="topic"
              className="mb-3 block text-sm font-semibold text-card-foreground"
            >
              주제
            </label>
            <input
              id="topic"
              type="text"
              placeholder="예: React useState 훅 사용법"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full rounded-lg border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Keywords */}
          <div className="rounded-xl border bg-card p-6">
            <label className="mb-3 block text-sm font-semibold text-card-foreground">
              키워드
            </label>
            <div className="mb-3 flex flex-wrap gap-2">
              {keywords.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground"
                >
                  {kw}
                  <button
                    type="button"
                    onClick={() => removeKeyword(kw)}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">{kw} 삭제</span>
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="키워드 입력 후 추가"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onCompositionStart={() => {
                  isComposingKeyword.current = true;
                }}
                onCompositionEnd={() => {
                  isComposingKeyword.current = false;
                }}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  if (isComposingKeyword.current || e.nativeEvent.isComposing) {
                    return;
                  }
                  e.preventDefault();
                  addKeyword();
                }}
                className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                type="button"
                onClick={addKeyword}
                className="flex items-center gap-1 rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
              >
                <Plus className="h-3.5 w-3.5" />
                추가
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="rounded-xl border bg-card p-6">
            <label className="mb-4 block text-sm font-semibold text-card-foreground">
              상세 옵션
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Language */}
              <div>
                <label htmlFor="language" className="mb-1.5 block text-xs text-muted-foreground">
                  작성 언어
                </label>
                <div className="relative">
                  <select
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full appearance-none rounded-lg border bg-background px-3 py-2.5 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="ko">한국어</option>
                    <option value="en">영어</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
              {/* Tone */}
              <div>
                <label htmlFor="tone" className="mb-1.5 block text-xs text-muted-foreground">
                  어조
                </label>
                <div className="relative">
                  <select
                    id="tone"
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full appearance-none rounded-lg border bg-background px-3 py-2.5 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="professional">전문적</option>
                    <option value="casual">캐주얼</option>
                    <option value="friendly">친근한</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
              {/* Length */}
              <div>
                <label htmlFor="length" className="mb-1.5 block text-xs text-muted-foreground">
                  글 길이
                </label>
                <div className="relative">
                  <select
                    id="length"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    className="w-full appearance-none rounded-lg border bg-background px-3 py-2.5 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="short">짧게 (~500자)</option>
                    <option value="medium">보통 (~1500자)</option>
                    <option value="long">길게 (~3000자)</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
              {/* Code toggle */}
              <div className="flex items-center justify-between rounded-lg border bg-background px-3 py-2.5">
                <label htmlFor="include-code" className="text-sm text-foreground">
                  코드 예시 포함
                </label>
                <button
                  id="include-code"
                  type="button"
                  role="switch"
                  aria-checked={includeCode}
                  onClick={() => setIncludeCode(!includeCode)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    includeCode ? "bg-primary" : "bg-muted-foreground/30"
                  }`}
                >
                  <span
                    className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-primary-foreground shadow transition-transform ${
                      includeCode ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-70"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                AI가 글을 생성하고 있습니다...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                글 생성하기
              </>
            )}
          </button>
          {isGenerating && (
            <div className="mt-2 flex items-center justify-center gap-1.5 text-muted-foreground">
              <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.2s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.1s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
            </div>
          )}
        </div>

        {/* Right: Preview */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Structure Preview */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="mb-4 text-sm font-semibold text-card-foreground">
              출력 구조 미리보기
            </h3>
            <div className="flex flex-col gap-2">
              {[
                { section: "서론", desc: "주제 소개 및 학습 동기" },
                { section: "본문", desc: "핵심 개념 설명 + 코드 예시" },
                { section: "실전 예제", desc: "실제 활용 시나리오" },
                { section: "주의사항", desc: "자주 하는 실수, 팁" },
                { section: "결론", desc: "요약 및 다음 학습 추천" },
              ].map((item, i) => (
                <div
                  key={item.section}
                  className="flex items-start gap-3 rounded-lg bg-muted/50 px-4 py-3"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      {item.section}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prompt Preview */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="mb-4 text-sm font-semibold text-card-foreground">
              AI 프롬프트 미리보기
            </h3>
            <div className="rounded-lg bg-muted/50 p-4 font-mono text-xs leading-relaxed text-muted-foreground">
              <p className="text-foreground">
                {"# 역할: 기술 블로그 작성 전문가"}
              </p>
              <p className="mt-2">
                {"## 템플릿: "}
                <span className="text-primary">
                  {templates.find((t) => t.id === selectedTemplate)?.label}
                </span>
              </p>
              <p>
                {"## 주제: "}
                <span className="text-primary">
                  {topic || "(주제를 입력하세요)"}
                </span>
              </p>
              <p>
                {"## 키워드: "}
                <span className="text-primary">{keywords.join(", ")}</span>
              </p>
              <p>
                {"## 언어: "}
                {language === "ko" ? "한국어" : "영어"}
                {" / 어조: "}
                {tone === "professional"
                  ? "전문적"
                  : tone === "casual"
                    ? "캐주얼"
                    : "친근한"}
              </p>
              <p>
                {"## 코드 예시: "}
                {includeCode ? "포함" : "미포함"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
