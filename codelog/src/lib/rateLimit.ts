export interface RateLimitResult {
  success: boolean;
  remaining: number;
}

export async function rateLimit(): Promise<RateLimitResult> {
  return { success: true, remaining: 1 };
}
