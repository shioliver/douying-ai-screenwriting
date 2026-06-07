/**
 * AIYOU 统一 API 响应格式
 */
export interface AIYOUApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export function successResponse<T>(data: T): AIYOUApiResponse<T> {
  return { success: true, data };
}

export function errorResponse(error: string, status = 500): { status: number; body: AIYOUApiResponse } {
  return { status, body: { success: false, error } };
}
