// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

import { computed, ref } from 'vue'
import enLocale from 'element-plus/es/locale/lang/en'
import zhCnLocale from 'element-plus/es/locale/lang/zh-cn'
import { en } from './messages/en'
import { zh } from './messages/zh'

export type MessageKey = keyof typeof en

export type LocaleCode = 'en' | 'zh'

export interface LocaleOption {
  code: LocaleCode
  label: string
  short: string
}

export const LOCALES: LocaleOption[] = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'zh', label: '简体中文', short: '中' },
]

const STORAGE_KEY = 'ocr-locale'

const catalogue: Record<LocaleCode, Record<MessageKey, string>> = { en, zh }

function readStored(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

function isLocale(value: string): value is LocaleCode {
  return value === 'en' || value === 'zh'
}

function detectLocale(): LocaleCode {
  const stored = readStored()
  if (isLocale(stored)) return stored
  const languages = typeof navigator === 'undefined' ? [] : navigator.languages ?? [navigator.language]
  for (const language of languages) {
    const tag = language.toLowerCase()
    if (tag.startsWith('zh')) return 'zh'
    if (tag.startsWith('en')) return 'en'
  }
  return 'en'
}

export const locale = ref<LocaleCode>(detectLocale())

export const elementLocale = computed(() => (locale.value === 'zh' ? zhCnLocale : enLocale))

export const htmlLang = computed(() => (locale.value === 'zh' ? 'zh-CN' : 'en'))

export function t(key: MessageKey, params?: Record<string, string | number>): string {
  const template = catalogue[locale.value][key] ?? en[key] ?? key
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  )
}

export function tn(base: string, count: number, params?: Record<string, string | number>): string {
  const key = `${base}.${count === 1 ? 'one' : 'other'}` as MessageKey
  return t(key, { count, ...params })
}

function applyDocumentLang(): void {
  if (typeof document !== 'undefined') document.documentElement.lang = htmlLang.value
}

export function setLocale(next: LocaleCode): void {
  locale.value = next
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {
    // Private browsing rejects storage; the in-memory choice still applies.
  }
  applyDocumentLang()
}

export function initLocale(): void {
  applyDocumentLang()
}

export function useI18n() {
  return { t, tn, locale, setLocale, locales: LOCALES, htmlLang }
}
