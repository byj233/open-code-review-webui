// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

import { computed, ref } from 'vue'
import enLocale from 'element-plus/es/locale/lang/en'
import jaLocale from 'element-plus/es/locale/lang/ja'
import koLocale from 'element-plus/es/locale/lang/ko'
import ruLocale from 'element-plus/es/locale/lang/ru'
import zhCnLocale from 'element-plus/es/locale/lang/zh-cn'
import { en } from './messages/en'
import { ja } from './messages/ja'
import { ko } from './messages/ko'
import { ru } from './messages/ru'
import { zh } from './messages/zh'

export type MessageKey = keyof typeof en

export type LocaleCode = 'en' | 'zh' | 'ja' | 'ko' | 'ru'

export interface LocaleOption {
  code: LocaleCode
  label: string
  short: string
  htmlLang: string
  intlTag: string
}

export const LOCALES: LocaleOption[] = [
  { code: 'en', label: 'English', short: 'EN', htmlLang: 'en', intlTag: 'en-US' },
  { code: 'zh', label: '简体中文', short: '中', htmlLang: 'zh-CN', intlTag: 'zh-CN' },
  { code: 'ja', label: '日本語', short: '日', htmlLang: 'ja-JP', intlTag: 'ja-JP' },
  { code: 'ko', label: '한국어', short: '한', htmlLang: 'ko-KR', intlTag: 'ko-KR' },
  { code: 'ru', label: 'Русский', short: 'RU', htmlLang: 'ru-RU', intlTag: 'ru-RU' },
]

const STORAGE_KEY = 'ocr-locale'

const catalogue: Record<LocaleCode, Record<MessageKey, string>> = { en, zh, ja, ko, ru }

const elementLocales: Record<LocaleCode, typeof enLocale> = {
  en: enLocale,
  zh: zhCnLocale,
  ja: jaLocale,
  ko: koLocale,
  ru: ruLocale,
}

function readStored(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

function isLocale(value: string): value is LocaleCode {
  return LOCALES.some((option) => option.code === value)
}

function detectLocale(): LocaleCode {
  const stored = readStored()
  if (isLocale(stored)) return stored
  const languages = typeof navigator === 'undefined' ? [] : navigator.languages ?? [navigator.language]
  for (const language of languages) {
    const tag = language.toLowerCase()
    if (tag.startsWith('zh')) return 'zh'
    if (tag.startsWith('ja')) return 'ja'
    if (tag.startsWith('ko')) return 'ko'
    if (tag.startsWith('ru')) return 'ru'
    if (tag.startsWith('en')) return 'en'
  }
  return 'en'
}

export const locale = ref<LocaleCode>(detectLocale())

const activeOption = computed(
  () => LOCALES.find((option) => option.code === locale.value) ?? LOCALES[0],
)

export const elementLocale = computed(() => elementLocales[locale.value])

export const htmlLang = computed(() => activeOption.value.htmlLang)

export const intlTag = computed(() => activeOption.value.intlTag)

export function t(key: MessageKey, params?: Record<string, string | number>): string {
  const template = catalogue[locale.value][key] ?? en[key] ?? key
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  )
}

const pluralRules = new Map<string, Intl.PluralRules>()

// Russian needs the few/many forms that English and Chinese do not, so ask
// Intl.PluralRules which form the active locale wants and fall back to the two
// forms every slice defines.
function pluralKey(base: string, count: number): MessageKey {
  let rules = pluralRules.get(intlTag.value)
  if (!rules) {
    rules = new Intl.PluralRules(intlTag.value)
    pluralRules.set(intlTag.value, rules)
  }
  for (const form of [rules.select(count), 'other', 'one']) {
    const key = `${base}.${form}` as MessageKey
    if (Object.prototype.hasOwnProperty.call(catalogue[locale.value], key)) return key
  }
  return `${base}.other` as MessageKey
}

export function tn(base: string, count: number, params?: Record<string, string | number>): string {
  return t(pluralKey(base, count), { count, ...params })
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
