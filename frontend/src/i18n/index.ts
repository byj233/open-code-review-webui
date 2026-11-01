// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

import { computed, type WritableComputedRef } from 'vue'
import { createI18n } from 'vue-i18n'
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

// vue-i18n picks a form index with a generic two/three-form rule; Russian needs
// the one/few/many split, and a fractional count takes the genitive singular.
function russianPlural(choice: number): number {
  const value = Math.abs(choice)
  if (!Number.isInteger(value)) return 1
  const mod10 = value % 10
  const mod100 = value % 100
  if (mod10 === 1 && mod100 !== 11) return 0
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 1
  return 2
}

// flatJson keeps the message keys flat ("nav.overview") instead of nesting them.
const i18n = createI18n({
  legacy: false,
  locale: detectLocale(),
  fallbackLocale: 'en',
  flatJson: true,
  // The composition API option is singular, while the legacy option is
  // `pluralizationRules`; only the former is read when legacy is false.
  pluralRules: { ru: russianPlural },
  messages: { en, zh, ja, ko, ru },
})

export const locale = i18n.global.locale as unknown as WritableComputedRef<LocaleCode>

const activeOption = computed(
  () => LOCALES.find((option) => option.code === locale.value) ?? LOCALES[0],
)

export const elementLocale = computed(() => elementLocales[locale.value])

export const htmlLang = computed(() => activeOption.value.htmlLang)

export const intlTag = computed(() => activeOption.value.intlTag)

export function t(key: MessageKey, params?: Record<string, string | number>): string {
  return params ? i18n.global.t(key, params) : i18n.global.t(key)
}

// vue-i18n 的 t() 重载对「复数 + 命名参数」的组合推断不出来，这里收窄一次签名。
const translatePlural = i18n.global.t as unknown as (
  key: string,
  plural: number,
  named?: Record<string, unknown>,
) => string

/** 复数：文案写成 "one | many"，形式选择交给 vue-i18n。 */
export function tn(base: MessageKey, count: number, params?: Record<string, string | number>): string {
  return translatePlural(base, count, { ...params })
}

function applyDocumentLang(): void {
  if (typeof document !== 'undefined') document.documentElement.lang = htmlLang.value
}

export function setLocale(next: LocaleCode): void {
  i18n.global.locale.value = next
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