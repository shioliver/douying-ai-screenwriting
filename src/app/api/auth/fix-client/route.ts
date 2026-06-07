import { NextResponse } from 'next/server'
import {
  CognitoIdentityProviderClient,
  UpdateUserPoolClientCommand,
  DescribeUserPoolClientCommand,
} from '@aws-sdk/client-cognito-identity-provider'

const client = new CognitoIdentityProviderClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'ap-northeast-2',
})

const USER_POOL_ID = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || ''
const CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || ''

export async function POST() {
  try {
    // 1. 读取当前配置
    const describe = await client.send(
      new DescribeUserPoolClientCommand({
        UserPoolId: USER_POOL_ID,
        ClientId: CLIENT_ID,
      })
    )
    const current = describe.UserPoolClient
    const flows = current?.ExplicitAuthFlows || []

    console.log('[auth/fix-client] 当前 flows:', flows)

    // 2. 合并需要启用的 flows
    type AuthFlow = 'ALLOW_USER_PASSWORD_AUTH' | 'ALLOW_REFRESH_TOKEN_AUTH' | 'ALLOW_USER_SRP_AUTH'
    const required: AuthFlow[] = [
      'ALLOW_USER_PASSWORD_AUTH',
      'ALLOW_REFRESH_TOKEN_AUTH',
      'ALLOW_USER_SRP_AUTH',
    ]
    const newFlows: AuthFlow[] = Array.from(new Set([...flows, ...required])) as AuthFlow[]

    // 3. 更新
    await client.send(
      new UpdateUserPoolClientCommand({
        UserPoolId: USER_POOL_ID,
        ClientId: CLIENT_ID,
        ExplicitAuthFlows: newFlows,
      })
    )

    return NextResponse.json({
      success: true,
      before: flows,
      after: newFlows,
    })
  } catch (error: any) {
    console.error('[auth/fix-client] 错误:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
