"use client";

import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Copy,
  Download,
  RotateCcw,
  Check,
  Eye,
  Code2,
  FileText,
  List,
  Share2,
} from "lucide-react";
import type { BlogResult } from "@/models/dto/blog";

interface ResultScreenProps {
  onNavigate: (page: string) => void;
  result: BlogResult | null;
  requestMeta: {
    topic: string;
    keywords: string[];
    style: string;
    language: string;
    tone: string;
    length: string;
    includeCode: boolean;
  } | null;
}

type Tab = "preview" | "editor" | "raw";

export function ResultScreen({
  onNavigate,
  result,
  requestMeta,
}: ResultScreenProps) {
  const [activeTab, setActiveTab] = useState<Tab>("preview");
  const [copied, setCopied] = useState(false);
  const [editedContent, setEditedContent] = useState(result?.content ?? "");

  const handleCopy = async () => {
    if (!editedContent) return;
    await navigator.clipboard.writeText(editedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toc = useMemo(() => {
    if (!editedContent) return [];
    return editedContent
      .split("\n")
      .filter((line) => line.startsWith("#"))
      .map((line, index) => {
        const level = line.match(/^#+/)?.[0].length ?? 1;
        const label = line.replace(/^#+\s*/, "").trim();
        return { id: `h-${index}`, label, level };
      });
  }, [editedContent]);

  if (!result) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground">
          아직 생성된 글이 없습니다
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          주제와 옵션을 입력하고 글 생성을 진행해 주세요.
        </p>
        <button
          type="button"
          onClick={() => onNavigate("generate")}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
        >
          글 생성하러 가기
        </button>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof Eye }[] = [
    { id: "preview", label: "미리보기", icon: Eye },
    { id: "editor", label: "편집", icon: Code2 },
    { id: "raw", label: "Raw MD", icon: FileText },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">생성 결과</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {result.title} {requestMeta ? `- ${requestMeta.style}` : ""}
          </p>
          {result.hashtags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {result.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-3 py-2 text-sm font-medium text-card-foreground transition-colors hover:bg-muted"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? "복사됨" : "복사"}
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-3 py-2 text-sm font-medium text-card-foreground transition-colors hover:bg-muted"
          >
            <Download className="h-4 w-4" />
            내보내기
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-3 py-2 text-sm font-medium text-card-foreground transition-colors hover:bg-muted"
          >
            <Share2 className="h-4 w-4" />
            공유
          </button>
          <button
            type="button"
            onClick={() => onNavigate("generate")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <RotateCcw className="h-4 w-4" />
            다시 생성
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <aside className="hidden lg:block">
          <div className="sticky top-20 rounded-xl border bg-card p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-card-foreground">
              <List className="h-4 w-4" />
              목차
            </div>
            <nav className="flex flex-col gap-1">
              {toc.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="rounded-md px-3 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="mt-6 border-t pt-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                문서 정보
              </p>
              <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                <span>템플릿: {requestMeta?.style || "-"}</span>
                <span>글자수: 약 {editedContent.length}자</span>
                <span>
                  코드 블록: {" "}
                  {editedContent.split("```").length > 1
                    ? Math.floor((editedContent.split("```").length - 1) / 2)
                    : 0}
                  개
                </span>
              </div>
            </div>
          </div>
        </aside>

        <div className="lg:col-span-3">
          <div className="mb-4 flex gap-1 rounded-xl border bg-card p-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="min-h-[600px] rounded-xl border bg-card p-8">
            {activeTab === "preview" && (
              <article className="prose prose-sm max-w-none text-card-foreground">
                <h1 className="text-2xl font-bold text-card-foreground">
                  {result.title}
                </h1>
                {result.metaDescription && (
                  <blockquote className="mb-6 border-l-4 border-primary/40 bg-muted/40 px-4 py-2 text-sm text-muted-foreground">
                    {result.metaDescription}
                  </blockquote>
                )}
                <ReactMarkdown>{editedContent}</ReactMarkdown>
              </article>
            )}
            {activeTab === "editor" && (
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="h-[560px] w-full resize-none rounded-lg border bg-background p-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            )}
            {activeTab === "raw" && (
              <pre className="whitespace-pre-wrap text-sm text-foreground">
                {editedContent}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
