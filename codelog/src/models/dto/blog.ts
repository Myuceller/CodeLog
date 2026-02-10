export type BlogStyle = 'tutorial' | 'til' | 'troubleshooting' | 'deepdive';
export type BlogTone = 'professional' | 'casual' | 'friendly';
export type BlogLength = 'short' | 'medium' | 'long';
export type BlogLanguage = 'ko' | 'en';

export interface BlogRequest {
  topic: string;
  keywords: string[];
  style: BlogStyle;
  language?: BlogLanguage;
  tone?: BlogTone;
  length?: BlogLength;
  includeCode?: boolean;
}

export interface BlogResult {
  title: string;
  content: string;
  hashtags: string[];
  metaDescription: string;
}
