export type BlogStyle = 'tutorial' | 'til' | 'troubleshooting';

export interface BlogRequest {
  topic: string;
  keywords: string[];
  style: BlogStyle;
}

export interface BlogResult {
  title: string;
  content: string;
  hashtags: string[];
  metaDescription: string;
}
