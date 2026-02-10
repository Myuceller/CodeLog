"use client";

import {
  Sparkles,
  BookOpen,
  Lightbulb,
  Bug,
  Layers,
  ArrowRight,
  FileText,
  Clock,
  TrendingUp,
} from "lucide-react";

interface HomeScreenProps {
  onNavigate: (page: string) => void;
  recent: {
    id: string;
    createdAt: string;
    result: {
      title: string;
      content: string;
      hashtags: string[];
      metaDescription: string;
    };
    request: {
      topic: string;
      keywords: string[];
      style: string;
      language: string;
      tone: string;
      length: string;
      includeCode: boolean;
    };
  }[];
  onSelect: (item: HomeScreenProps["recent"][number]) => void;
  selectedTemplate: string;
  onSelectTemplate: (template: string) => void;
}

const templates = [
  {
    id: "tutorial",
    title: "튜토리얼",
    desc: "코드 예시와 함께 단계별로 설명하는 가이드 형식",
    icon: BookOpen,
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    id: "til",
    title: "TIL",
    desc: "오늘 배운 내용을 간결하게 정리하는 형식",
    icon: Lightbulb,
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    id: "troubleshooting",
    title: "트러블슈팅",
    desc: "문제 발생부터 해결까지의 과정을 기록하는 형식",
    icon: Bug,
    color: "bg-red-500/10 text-red-500",
  },
  {
    id: "deepdive",
    title: "딥다이브",
    desc: "특정 기술의 동작 원리를 깊이 분석하는 형식",
    icon: Layers,
    color: "bg-emerald-500/10 text-emerald-600",
  },
];

const styleLabel: Record<string, string> = {
  tutorial: "튜토리얼",
  til: "TIL",
  troubleshooting: "트러블슈팅",
  deepdive: "딥다이브",
};
const NOW_MS = Date.now();

function formatDate(date: string) {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

export function HomeScreen({
  onNavigate,
  recent,
  onSelect,
  selectedTemplate,
  onSelectTemplate,
}: HomeScreenProps) {
  const totalCount = recent.length;
  const weekCount = recent.filter((item) => {
    const created = new Date(item.createdAt).getTime();
    const diffDays = (NOW_MS - created) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  }).length;

  const mostUsedTemplate = (() => {
    if (recent.length === 0) return "-";
    const counts = recent.reduce<Record<string, number>>((acc, item) => {
      const key = item.request.style;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return styleLabel[top[0]] || top[0];
  })();

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      {/* Hero */}
      <section className="mb-16 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          AI 기반 기술 블로그 자동 생성
        </div>
        <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
          주제만 입력하면
          <br />
          <span className="text-primary">기술 블로그 글</span>이 완성됩니다
        </h1>
        <p className="mx-auto mb-8 max-w-xl text-pretty text-lg text-muted-foreground">
          주제와 키워드를 입력하면 AI가 서론-본문-결론 구조의 기술 글을
          작성합니다. 코드 예시 포함, 다양한 템플릿을 지원합니다.
        </p>
        <button
          type="button"
          onClick={() => onNavigate("generate")}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          글 생성 시작하기
          <ArrowRight className="h-4 w-4" />
        </button>
      </section>

      {/* Templates */}
      <section className="mb-16">
        <h2 className="mb-2 text-xl font-bold text-foreground">
          글 템플릿 선택
        </h2>
        <p className="mb-6 text-sm text-muted-foreground">
          작성하려는 글의 형식을 선택하세요
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {templates.map((t) => {
            const Icon = t.icon;
            return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onSelectTemplate(t.id)}
                  className={`group flex flex-col items-start gap-3 rounded-xl border bg-card p-5 text-left transition-all hover:border-primary/30 hover:shadow-md ${
                    selectedTemplate === t.id ? "border-primary/60" : ""
                  }`}
                >
                <div className={`rounded-lg p-2.5 ${t.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground group-hover:text-primary">
                    {t.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    {t.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Recent & Stats */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-bold text-foreground">
            최근 생성한 글
          </h2>
          <div className="flex flex-col gap-3">
            {recent.length === 0 ? (
              <div className="rounded-xl border bg-card px-5 py-8 text-sm text-muted-foreground">
                아직 생성한 글이 없습니다.
              </div>
            ) : (
              recent.map((post) => (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => onSelect(post)}
                  className="flex items-center justify-between rounded-xl border bg-card px-5 py-4 text-left transition-all hover:border-primary/30 hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-card-foreground">
                        {post.result.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {styleLabel[post.request.style] || post.request.style}
                      </p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDate(post.createdAt)}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-bold text-foreground">통계</h2>
          <div className="flex flex-col gap-3">
            {[
              { label: "총 생성 글", value: String(totalCount), icon: FileText },
              { label: "이번 주", value: String(weekCount), icon: TrendingUp },
              {
                label: "가장 많이 사용한 템플릿",
                value: mostUsedTemplate,
                icon: BookOpen,
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="flex items-center gap-3 rounded-xl border bg-card px-5 py-4"
                >
                  <div className="rounded-lg bg-accent p-2">
                    <Icon className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-lg font-bold text-card-foreground">
                      {stat.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
