/**
 * AIYOU API 认证中间件
 * 从请求头中提取 Cognito token 并验证用户身份
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/auth';

export async function withAuth(
  req: NextRequest,
  handler: (req: NextRequest, userId: string) => Promise<NextResponse>
): Promise<NextResponse> {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: '未授权' }, { status: 401 });
  }
  return handler(req, userId);
}
