import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider'

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
})

const USE_MOCK = !process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID

/**
 * 本地解码 JWT payload（不验证签名，仅提取信息）
 * 生产环境应配合 Cognito JWT 签名验证
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = parts[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

/**
 * 从请求中验证用户身份，返回真实的用户 ID
 * 优先使用 Cognito Access Token 验证，回退到 x-user-id（mock 模式）
 */
export async function getAuthenticatedUserId(request: Request): Promise<string | null> {
  const authHeader = request.headers.get('Authorization')

  // Bearer Token 模式（Cognito）
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)

    // Mock 模式：token 格式为 mock-{userId}
    if (USE_MOCK || token.startsWith('mock-')) {
      return token.replace('mock-', '')
    }

    // JWT 本地解码：从 token 中提取 username（Cognito Access Token 的 username 字段）
    const payload = decodeJwtPayload(token)
    if (payload) {
      // Cognito Access Token 中用户名在 username 字段
      const username = payload['username'] as string | undefined
      if (username) {
        // 检查 token 是否过期
        const exp = payload['exp'] as number | undefined
        if (exp && exp * 1000 > Date.now()) {
          return username
        }
        // Token 过期，返回 null 触发 401
        return null
      }
    }

    // JWT 解码失败，回退到 Cognito API 验证
    try {
      const command = new GetUserCommand({ AccessToken: token })
      const response = await cognitoClient.send(command)
      return response.Username || null
    } catch {
      return null
    }
  }

  // 回退：x-user-id header（仅 mock 模式允许）
  if (USE_MOCK) {
    const userId = request.headers.get('x-user-id')
    return userId
  }

  return null
}
