// @ts-nocheck
'use client'

import { App } from './App'
import { LanguageProvider } from './src/i18n/LanguageContext'

export function CreativeSpaceApp() {
  return (
    <LanguageProvider>
      <App />
    </LanguageProvider>
  )
}
