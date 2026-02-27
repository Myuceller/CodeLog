import OpenAI from 'openai';
import { BlogRequest } from '@/models/dto/blog';
import { buildSystemPrompt, buildUserPrompt } from '@/services/prompt/templates';

function getClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function streamBlogDraft(payload: BlogRequest) {
  const openai = getClient();
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    stream: true,
    messages: [
      { role: 'system', content: buildSystemPrompt(payload.style) },
      {
        role: 'user',
        content: buildUserPrompt(payload.topic, payload.keywords, {
          language: payload.language,
          tone: payload.tone,
          length: payload.length,
          includeCode: payload.includeCode,
        }),
      },
    ],
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of response) {
        const delta = chunk.choices?.[0]?.delta?.content;
        if (delta) {
          controller.enqueue(encoder.encode(delta));
        }
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
