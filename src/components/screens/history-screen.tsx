"use client";

import { useState } from "react";
import {
  Search,
  BookOpen,
  Lightbulb,
  Bug,
  Layers,
  Clock,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface HistoryScreenProps {
  history: {
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
  onSelect: (item: HistoryScreenProps["history"][number]) => void;
}

const filterOptions = ["전체", "튜토리얼", "TIL", "트러블슈팅", "딥다이브"];

const styleMeta: Record<
  string,
  { label: string; icon: typeof BookOpen }
> = {
  tutorial: { label: "튜토리얼", icon: BookOpen },
  til: { label: "TIL", icon: Lightbulb },
  troubleshooting: { label: "트러블슈팅", icon: Bug },
  deepdive: { label: "딥다이브", icon: Layers },
};

function formatDate(date: string) {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

export function HistoryScreen({
  history,
  onSelect,
}: HistoryScreenProps) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("전체");

  const filtered = history.filter((p) => {
    const matchSearch =
      p.result.title.toLowerCase().includes(search.toLowerCase()) ||
      p.request.keywords.some((k) =>
        k.toLowerCase().includes(search.toLowerCase())
      );
    const matchFilter =
      activeFilter === "전체" ||
      styleMeta[p.request.style]?.label === activeFilter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">생성 이력</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          이전에 생성한 기술 블로그 글을 확인하고 관리합니다
        </p>
      </div>

      {/* Search & Filter */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="제목 또는 키워드로 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="flex gap-1.5">
          {filterOptions.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setActiveFilter(opt)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeFilter === opt
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground border hover:bg-muted hover:text-foreground"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-16">
            <FileText className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              검색 결과가 없습니다
            </p>
          </div>
        ) : (
          filtered.map((post) => {
            const meta = styleMeta[post.request.style];
            const Icon = meta?.icon || FileText;
            return (
              <button
                key={post.id}
                type="button"
                onClick={() => onSelect(post)}
                className="flex items-center gap-4 rounded-xl border bg-card px-6 py-5 text-left transition-all hover:border-primary/30 hover:shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent">
                  <Icon className="h-5 w-5 text-accent-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-card-foreground">
                    {post.result.title}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {meta?.label || post.request.style}
                    </span>
                    {post.request.keywords.map((kw) => (
                      <span
                        key={kw}
                        className="text-xs text-muted-foreground"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDate(post.createdAt)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {post.result.content.length.toLocaleString()}자
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg border bg-card text-muted-foreground transition-colors hover:bg-muted"
            aria-label="이전 페이지"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              type="button"
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                n === 1
                  ? "bg-primary text-primary-foreground"
                  : "border bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg border bg-card text-muted-foreground transition-colors hover:bg-muted"
            aria-label="다음 페이지"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
