// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

import { ref } from 'vue'

const isDark = ref(false)
let initialized = false

function applyTheme(): void {
  document.documentElement.classList.toggle('dark', isDark.value)
  document.documentElement.style.colorScheme = isDark.value ? 'dark' : 'light'
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  if (meta) meta.content = isDark.value ? '#1c1b19' : '#faf9f5'
  try {
    localStorage.setItem('ocr-theme', isDark.value ? 'dark' : 'light')
  } catch {
    // Private browsing can reject storage; the in-memory choice still applies.
  }
}

export function initTheme(): void {
  if (initialized) return
  initialized = true
  let stored = ''
  try {
    stored = localStorage.getItem('ocr-theme') ?? ''
  } catch {
    stored = ''
  }
  if (stored === 'dark' || stored === 'light') {
    isDark.value = stored === 'dark'
  } else {
    isDark.value = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  }
  applyTheme()
}

export function useTheme() {
  function toggleTheme(): void {
    isDark.value = !isDark.value
    applyTheme()
  }
  function setTheme(dark: boolean): void {
    isDark.value = dark
    applyTheme()
  }
  return { isDark, toggleTheme, setTheme }
}
