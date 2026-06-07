import { NextResponse } from 'next/server'
import { CognitoIdentityProviderClient, InitiateAuthCommand, SignUpCommand, ConfirmSignUpCommand } from '@aws-sdk/client-cognito-identity-provider'

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
})

const CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || ''

export async function POST(request: Request) {
  const { action, email, password, name, code } = await request.json()

  try {
    if (action === 'signup') {
      const command = new SignUpCommand({
        ClientId: CLIENT_ID,
        Username: name,
        Password: password,
        UserAttributes: [
          { Name: 'email', Value: email },
        ],
      })
      const response = await cognitoClient.send(command)
      return NextResponse.json({ success: true, userSub: response.UserSub })
    }

    if (action === 'login') {
      const command = new InitiateAuthCommand({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: CLIENT_ID,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      })
      const response = await cognitoClient.send(command)
      return NextResponse.json({
        success: true,
        accessToken: response.AuthenticationResult?.AccessToken,
        idToken: response.AuthenticationResult?.IdToken,
      })
    }

    if (action === 'confirm') {
      const command = new ConfirmSignUpCommand({
        ClientId: CLIENT_ID,
        Username: name,
        ConfirmationCode: code,
      })
      await cognitoClient.send(command)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, error: '未知操作' }, { status: 400 })
  } catch (error: any) {
    console.error('[cognito] Error:', error.name, error.message, error.$metadata)
    return NextResponse.json({ success: false, error: error.message || '请求失败' }, { status: 500 })
  }
}
