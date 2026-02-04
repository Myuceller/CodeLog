import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { BlogRequest } from '@/models/dto/blog';
import { buildSystemPrompt, buildUserPrompt } from '@/services/prompt/templates';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function streamBlogDraft(payload: BlogRequest) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    stream: true,
    messages: [
      { role: 'system', content: buildSystemPrompt(payload.style) },
      { role: 'user', content: buildUserPrompt(payload.topic, payload.keywords) },
    ],
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
