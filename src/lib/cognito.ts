export async function cognitoSignUp(email: string, password: string, name: string) {
  try {
    const response = await fetch('/api/auth/cognito', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'signup', email, password, name }),
    })
    const data = await response.json()
    return data
  } catch {
    return { success: false, error: '网络请求失败' }
  }
}

export async function cognitoLogin(email: string, password: string) {
  try {
    const response = await fetch('/api/auth/cognito', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', email, password }),
    })
    const data = await response.json()
    return data
  } catch {
    return { success: false, error: '网络请求失败' }
  }
}

export async function cognitoConfirmSignUp(email: string, name: string, code: string) {
  try {
    const response = await fetch('/api/auth/cognito', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'confirm', email, name, code }),
    })
    const data = await response.json()
    return data
  } catch {
    return { success: false, error: '网络请求失败' }
  }
}
