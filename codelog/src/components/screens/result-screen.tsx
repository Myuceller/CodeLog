"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import {
  Copy,
  Download,
  RotateCcw,
  Check,
  Eye,
  Code2,
  FileText,
  List,
} from "lucide-react";
import type { BlogResult } from "@/models/dto/blog";
import { useToast } from "@/hooks/use-toast";

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

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9가-힣\s-]/gi, "")
    .replace(/\s+/g, "-");
}

function getNodeText(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map((child) => getNodeText(child)).join("");
  }
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return getNodeText(node.props.children);
  }
  return "";
}

function CodeBlock({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const codeWrapRef = useRef<HTMLDivElement | null>(null);
  const codeText = String(children).replace(/\n$/, "");

  useEffect(() => {
    if (!codeWrapRef.current) return;
    Prism.highlightAllUnder(codeWrapRef.current);
  }, [className, children, copied]);

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(codeText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div ref={codeWrapRef} className="not-prose my-5">
      <div className="mb-1 flex justify-end">
        <button
          type="button"
          onClick={handleCopyCode}
          className="inline-flex items-center gap-1 rounded-md border bg-card px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "복사됨" : "코드 복사"}
        </button>
      </div>
      <pre className="overflow-x-auto rounded-xl border border-slate-700/60 bg-slate-950 p-4 text-[15px] leading-7 text-slate-100">
        <code className={`${className ?? ""} font-mono text-[15px] leading-7`}>{children}</code>
      </pre>
    </div>
  );
}

export function ResultScreen({
  onNavigate,
  result,
  requestMeta,
}: ResultScreenProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("preview");
  const [copied, setCopied] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [editedContent, setEditedContent] = useState(result?.content ?? "");
  const previewRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (activeTab !== "preview") return;
    if (!previewRef.current) return;
    Prism.highlightAllUnder(previewRef.current);
  }, [activeTab, editedContent]);

  const handleCopy = async () => {
    if (!editedContent) return;
    await navigator.clipboard.writeText(editedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSafeFilename = (title: string) =>
    title
      .trim()
      .replace(/[\\/:*?"<>|]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 60) || "codelog-post";

  const handleExportMarkdown = () => {
    if (!editedContent) return;
    const filename = getSafeFilename(result.title);
    const blob = new Blob([editedContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${filename}.md`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    toast({
      title: "내보내기 완료",
      description: `${filename}.md 파일을 다운로드했습니다.`,
    });
    setIsExportMenuOpen(false);
  };

  const handleExportHtml = () => {
    if (!editedContent) return;
    const filename = getSafeFilename(result.title);
    const renderedHtml = previewRef.current?.innerHTML;
    const fallbackMarkdown = editedContent
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    const htmlDoc = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${result.title}</title>
  <style>
    body { max-width: 860px; margin: 0 auto; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; line-height: 1.7; }
    pre { overflow-x: auto; padding: 16px; border-radius: 12px; background: #0f172a; color: #e2e8f0; }
    code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
    blockquote { margin: 16px 0; padding-left: 12px; border-left: 4px solid #94a3b8; color: #475569; }
  </style>
</head>
<body>
  <article>${renderedHtml ?? `<pre>${fallbackMarkdown}</pre>`}</article>
</body>
</html>`;

    const blob = new Blob([htmlDoc], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${filename}.html`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    toast({
      title: "내보내기 완료",
      description: `${filename}.html 파일을 다운로드했습니다.`,
    });
    setIsExportMenuOpen(false);
  };


  const toc = useMemo(() => {
    if (!editedContent) return [];
    return editedContent
      .split("\n")
      .filter((line) => line.startsWith("## "))
      .map((line, index) => {
        const level = line.match(/^#+/)?.[0].length ?? 1;
        const label = line.replace(/^#+\s*/, "").trim();
        const id = slugifyHeading(label) || `section-${index}`;
        return { id, label, level };
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
                  onClick={() => {
                    const target = document.getElementById(item.id);
                    if (target) {
                      target.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }}
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
          <div className="mb-6 flex flex-col gap-4">
            <div className="min-w-0">
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
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex min-w-[96px] shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border bg-card px-3 py-2 text-sm font-medium text-card-foreground transition-colors hover:bg-muted"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? "복사됨" : "복사"}
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsExportMenuOpen((prev) => !prev)}
                  className="inline-flex min-w-[96px] shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border bg-card px-3 py-2 text-sm font-medium text-card-foreground transition-colors hover:bg-muted"
                >
                  <Download className="h-4 w-4" />
                  내보내기
                </button>
                {isExportMenuOpen && (
                  <div className="absolute left-0 top-full z-20 mt-2 w-40 rounded-lg border bg-card p-1 shadow-lg">
                    <button
                      type="button"
                      onClick={handleExportMarkdown}
                      className="block w-full rounded-md px-3 py-2 text-left text-sm text-card-foreground hover:bg-muted"
                    >
                      Markdown (.md)
                    </button>
                    <button
                      type="button"
                      onClick={handleExportHtml}
                      className="block w-full rounded-md px-3 py-2 text-left text-sm text-card-foreground hover:bg-muted"
                    >
                      HTML (.html)
                    </button>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => onNavigate("generate")}
                className="inline-flex min-w-[112px] shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <RotateCcw className="h-4 w-4" />
                다시 생성
              </button>
            </div>
          </div>

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
              <article
                ref={previewRef}
                className="prose prose-sm max-w-none text-card-foreground"
              >
                <h1 className="text-2xl font-bold text-card-foreground">
                  {result.title}
                </h1>
                {result.metaDescription && (
                  <blockquote className="mb-6 border-l-4 border-primary/40 bg-muted/40 px-4 py-2 text-sm text-muted-foreground">
                    {result.metaDescription}
                  </blockquote>
                )}
                <ReactMarkdown
                  components={{
                    h2({ children }) {
                      const headingText = getNodeText(children);
                      const id = slugifyHeading(headingText);
                      const isStepHeading = /^step\s*\d+/i.test(headingText);
                      return (
                        <h2
                          id={id}
                          className={
                            isStepHeading
                              ? "mt-8 scroll-mt-24 rounded-lg border-l-4 border-primary bg-primary/10 px-4 py-3 text-2xl font-extrabold tracking-tight text-foreground"
                              : "mt-8 scroll-mt-24 text-2xl font-bold text-foreground"
                          }
                        >
                          {children}
                        </h2>
                      );
                    },
                    code({ className, children, ...props }) {
                      const isBlock = typeof className === "string" && className.includes("language-");
                      if (isBlock) {
                        return <CodeBlock className={className}>{children}</CodeBlock>;
                      }
                      return (
                        <code
                          className="rounded bg-muted px-1 py-0.5 font-mono text-[0.9em] text-foreground"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {editedContent}
                </ReactMarkdown>
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
