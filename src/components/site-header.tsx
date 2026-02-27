"use client";

import { FileText, PenTool, Clock, Sparkles } from "lucide-react";

interface SiteHeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: "home", label: "홈", icon: FileText },
  { id: "generate", label: "글 생성", icon: PenTool },
  { id: "result", label: "결과", icon: Sparkles },
  { id: "history", label: "생성 이력", icon: Clock },
];

export function SiteHeader({ currentPage, onNavigate }: SiteHeaderProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 w-full min-w-full border-b bg-card/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 min-h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="flex shrink-0 items-center gap-2"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="whitespace-nowrap text-lg font-bold text-foreground">
            CodeLog
          </span>
        </button>

        <nav className="flex min-w-0 items-center gap-1 overflow-x-auto whitespace-nowrap">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors sm:px-3 ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
