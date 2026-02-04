'use client';

import { useState } from 'react';
import { BlogResult } from '@/models/dto/blog';
import MarkdownViewer from '@/components/viewer/MarkdownViewer';
import { downloadHTML, downloadMarkdown, copyToClipboard } from '@/lib/export';

type StyleType = 'tutorial' | 'til' | 'troubleshooting';

export default function HomePage() {
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [style, setStyle] = useState<StyleType>('tutorial');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BlogResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('주제를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          keywords: keywords
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean),
          style,
        }),
      });

      if (!response.ok) throw new Error('generate failed');
      const data: BlogResult = await response.json();
      setResult(data);
    } catch {
      setError('글 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">AI 기술 블로그 생성기</h1>
        <p className="text-sm text-gray-600">
          주제와 키워드를 입력하면 기술 글 초안을 생성합니다.
        </p>
      </header>

      <section className="space-y-4 rounded-lg border p-6">
        <input
          type="text"
          placeholder="주제를 입력하세요"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
        <input
          type="text"
          placeholder="키워드 (쉼표로 구분)"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          className="w-full rounded border px-3 py-2"
        />

        <div className="flex gap-2">
          {(['tutorial', 'til', 'troubleshooting'] as StyleType[]).map((s) => (
            <button
              key={s}
              onClick={() => setStyle(s)}
              className={`rounded px-3 py-2 text-sm ${
                style === s ? 'bg-black text-white' : 'bg-gray-100'
              }`}
              type="button"
            >
              {s === 'tutorial' ? '튜토리얼' : s === 'til' ? 'TIL' : '트러블슈팅'}
            </button>
          ))}
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full rounded bg-black py-3 text-white disabled:bg-gray-400"
          type="button"
        >
          {isLoading ? '생성 중...' : '글 생성하기'}
        </button>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </section>

      {result && (
        <section className="mt-8 rounded-lg border p-6">
          <h2 className="text-2xl font-bold">{result.title}</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {result.hashtags.map((tag) => (
              <span key={tag} className="rounded bg-gray-100 px-2 py-1 text-xs">
                #{tag}
              </span>
            ))}
          </div>

          <div className="mt-6">
            <MarkdownViewer content={result.content} />
          </div>

          <div className="mt-6 flex gap-2">
            <button
              className="rounded border px-3 py-2 text-sm"
              type="button"
              onClick={() => copyToClipboard(result.content)}
            >
              복사
            </button>
            <button
              className="rounded border px-3 py-2 text-sm"
              type="button"
              onClick={() => downloadMarkdown(result.content, result.title)}
            >
              MD 다운로드
            </button>
            <button
              className="rounded border px-3 py-2 text-sm"
              type="button"
              onClick={() => downloadHTML(result.content, result.title)}
            >
              HTML 다운로드
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
