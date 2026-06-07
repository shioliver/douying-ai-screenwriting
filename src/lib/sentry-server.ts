import * as Sentry from '@sentry/nextjs'

export function initServerSentry() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.1,
      debug: false,
    })
  }
}

/** 捕获 API 路由错误并上报 */
export function captureApiError(error: unknown, context?: Record<string, unknown>) {
  console.error('[API Error]', error)
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureException(error, { extra: context })
  }
}
