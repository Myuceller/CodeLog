"use client";

import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { HomeScreen } from "@/components/screens/home-screen";
import { GenerateScreen } from "@/components/screens/generate-screen";
import { ResultScreen } from "@/components/screens/result-screen";
import { HistoryScreen } from "@/components/screens/history-screen";
import type { BlogResult } from "@/models/dto/blog";

export default function Page() {
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedTemplate, setSelectedTemplate] = useState("tutorial");
  const [generated, setGenerated] = useState<{
    id: string;
    result: BlogResult;
    request: {
      topic: string;
      keywords: string[];
      style: string;
      language: string;
      tone: string;
      length: string;
      includeCode: boolean;
    };
  } | null>(null);
  const [history, setHistory] = useState<
    {
      id: string;
      createdAt: string;
      result: BlogResult;
      request: {
        topic: string;
        keywords: string[];
        style: string;
        language: string;
        tone: string;
        length: string;
        includeCode: boolean;
      };
    }[]
  >(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem("codelog.history");
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("codelog.history", JSON.stringify(history));
  }, [history]);

  const sortedHistory = useMemo(() => {
    return [...history].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [history]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader currentPage={currentPage} onNavigate={setCurrentPage} />

      <main>
        {currentPage === "home" && (
          <HomeScreen
            onNavigate={setCurrentPage}
            recent={sortedHistory.slice(0, 3)}
            onSelect={(item) => {
              setGenerated({
                id: item.id,
                result: item.result,
                request: item.request,
              });
              setCurrentPage("result");
            }}
            selectedTemplate={selectedTemplate}
            onSelectTemplate={(template) => {
              setSelectedTemplate(template);
              setCurrentPage("generate");
            }}
          />
        )}
        {currentPage === "generate" && (
          <GenerateScreen
            onNavigate={setCurrentPage}
            onGenerated={(result, request) => {
              const item = {
                id: `${Date.now()}`,
                createdAt: new Date().toISOString(),
                result,
                request,
              };
              setGenerated({ id: item.id, result, request });
              setHistory((prev) => [item, ...prev]);
            }}
            selectedTemplate={selectedTemplate}
            onTemplateChange={setSelectedTemplate}
          />
        )}
        {currentPage === "result" && (
          <ResultScreen
            key={generated?.id ?? "empty"}
            onNavigate={setCurrentPage}
            result={generated?.result || null}
            requestMeta={generated?.request || null}
          />
        )}
        {currentPage === "history" && (
          <HistoryScreen
            history={sortedHistory}
            onSelect={(item) => {
              setGenerated({
                id: item.id,
                result: item.result,
                request: item.request,
              });
              setCurrentPage("result");
            }}
          />
        )}
      </main>
    </div>
  );
}
