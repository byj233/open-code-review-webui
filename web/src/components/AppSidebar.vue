<!-- SPDX-License-Identifier: Apache-2.0 -->
<template>
  <aside class="sidebar" :class="{ 'is-open': open }">
    <div class="brand">
      <div class="brand__mark">
        <BrandMark :size="21" />
      </div>
      <div class="brand__text">
        <span class="brand__name">Open Code Review</span>
        <span class="brand__sub">{{ t('app.console') }}</span>
      </div>
    </div>

    <router-link class="repo" to="/" @click="$emit('navigate')">
      <el-icon class="repo__icon"><Files /></el-icon>
      <span class="repo__body">
        <span class="repo__name">{{ repoName }}</span>
        <span class="repo__branch">
          <span class="dot" :class="repo?.is_git ? 'dot--green' : ''" />
          {{ repoBranch }}
        </span>
      </span>
      <el-icon class="repo__chevron"><ArrowRight /></el-icon>
    </router-link>

    <nav class="nav" :aria-label="t('nav.primary')">
      <template v-for="group in groups" :key="group.label">
        <p class="nav__label">{{ group.label }}</p>
        <router-link
          v-for="item in group.items"
          :key="item.to"
          :to="item.to"
          class="nav__item"
          :class="{ 'is-active': isActive(item) }"
          @click="$emit('navigate')"
        >
          <el-icon class="nav__icon"><component :is="item.icon" /></el-icon>
          <span class="nav__text">{{ item.label }}</span>
          <span v-if="item.badge" class="nav__badge">{{ item.badge }}</span>
        </router-link>
      </template>
    </nav>

    <div class="sidebar__foot">
      <router-link class="provider" :class="{ 'provider--off': !provider.configured }" to="/providers" @click="$emit('navigate')">
        <span class="provider__top">
          <span class="dot" :class="provider.configured ? 'dot--green' : 'dot--amber'" />
          <span class="provider__label">{{ provider.configured ? t('provider.connected') : t('provider.notConfigured') }}</span>
        </span>
        <span class="provider__name">{{ providerName }}</span>
        <span class="provider__meta">{{ providerMeta }}</span>
      </router-link>

      <div class="foot-row">
        <button class="theme-button" type="button" :aria-label="isDark ? t('topbar.themeLight') : t('topbar.themeDark')" @click="toggleTheme">
          <el-icon><Moon v-if="!isDark" /><Sunny v-else /></el-icon>
        </button>
        <span class="version">{{ meta?.version || 'dev' }}</span>
        <button class="palette-button" type="button" :aria-label="t('topbar.openPalette')" @click="$emit('palette')">
          <el-icon><Search /></el-icon>
          <span class="kbd">K</span>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  ArrowRight,
  Collection,
  Connection,
  EditPen,
  Files,
  Grid,
  Moon,
  Reading,
  Search,
  Setting,
  Sunny,
} from '@element-plus/icons-vue'
import BrandMark from '@/components/BrandMark.vue'
import { useMetaStore } from '@/stores/meta'
import { useTheme } from '@/composables/useTheme'
import { useI18n } from '@/i18n'
import { authLabel } from '@/utils/status'
import type { ActiveConfig } from '@/types'
import type { Component } from 'vue'

defineProps<{ open?: boolean }>()
defineEmits<{ navigate: []; palette: [] }>()

interface NavItem {
  label: string
  to: string
  icon: Component
  match?: string
  badge?: string
}

const route = useRoute()
const { meta } = useMetaStore()
const { isDark, toggleTheme } = useTheme()
const { t } = useI18n()

const groups = computed<Array<{ label: string; items: NavItem[] }>>(() => [
  {
    label: t('nav.group.workspace'),
    items: [
      { label: t('nav.overview'), to: '/', icon: Grid },
      { label: t('nav.review'), to: '/review', icon: EditPen },
      { label: t('nav.scan'), to: '/scan', icon: Search },
    ],
  },
  {
    label: t('nav.group.history'),
    items: [{ label: t('nav.sessions'), to: '/sessions', icon: Collection }],
  },
  {
    label: t('nav.group.setup'),
    items: [
      { label: t('nav.providers'), to: '/providers', icon: Connection },
      { label: t('nav.settings'), to: '/settings', icon: Setting },
      { label: t('nav.rules'), to: '/rules', icon: Reading },
    ],
  },
])

const repo = computed(() => meta.value?.repo)
const repoName = computed(() => repo.value?.name || t('repo.none'))
const repoBranch = computed(() => {
  const info = repo.value
  if (!info?.is_git) return t('repo.notGit')
  if (info.detached) return t('repo.detached', { head: info.head || '--' })
  return info.branch || t('repo.noCommits')
})

const provider = computed<ActiveConfig>(
  () =>
    meta.value?.config.active ?? {
      source: 'none',
      auth_mode: 'none',
      key_set: false,
      env_set: false,
      configured: false,
    },
)
const providerName = computed(() => {
  const active = provider.value
  if (!active.provider_label) return t('provider.connect')
  return active.provider_label
})
const providerMeta = computed(() => {
  const active = provider.value
  if (!active.configured) return t('provider.addKey')
  const model = active.model || t('provider.modelNotSelected')
  return `${model} · ${authLabel(active.auth_mode)}`
})

function isActive(item: NavItem): boolean {
  if (item.to === '/') return route.path === '/'
  if (route.path.startsWith(item.to)) return true
  if (item.to === '/review' && route.path.startsWith('/runs/')) return false
  return false
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 40;
  display: flex;
  flex-direction: column;
  width: var(--sidebar-width);
  padding: 20px 14px 14px;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--line);
  overflow-y: auto;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 8px 18px;
}

.brand__mark {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--surface);
  border: 1px solid var(--line);
  box-shadow: var(--shadow-xs);
}

.brand__text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.brand__name {
  font-family: var(--font-display);
  font-size: 15.5px;
  font-weight: 600;
  letter-spacing: -0.015em;
  color: var(--ink-strong);
  white-space: nowrap;
}

.brand__sub {
  margin-top: 1px;
  color: var(--ink-faint);
  font-size: 9.5px;
  font-weight: 650;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.repo {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 20px;
  padding: 9px 10px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: color-mix(in srgb, var(--surface) 55%, transparent);
  color: var(--ink);
  transition: border-color 0.16s ease, background-color 0.16s ease;
}

.repo:hover {
  border-color: var(--line-strong);
  background: var(--surface);
  color: var(--ink);
}

.repo__icon {
  color: var(--ink-faint);
  font-size: 15px;
}

.repo__body {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.repo__name {
  font-size: 12px;
  font-weight: 650;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.repo__branch {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 2px;
  color: var(--ink-faint);
  font-family: var(--font-mono);
  font-size: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.repo__chevron {
  color: var(--ink-faint);
  font-size: 12px;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav__label {
  margin: 16px 10px 7px;
  color: var(--ink-faint);
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.nav__label:first-child {
  margin-top: 0;
}

.nav__item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 38px;
  padding: 0 10px;
  border-radius: 9px;
  color: var(--ink-muted);
  font-size: 13px;
  font-weight: 550;
  transition: background-color 0.16s ease, color 0.16s ease, box-shadow 0.16s ease;
}

.nav__item:hover {
  background: color-mix(in srgb, var(--surface) 62%, transparent);
  color: var(--ink-strong);
}

.nav__item.is-active {
  background: var(--surface);
  color: var(--ink-strong);
  box-shadow: var(--shadow-xs);
}

.nav__item.is-active::after {
  content: "";
  position: absolute;
  right: 11px;
  width: 5px;
  height: 5px;
  border-radius: 999px;
  background: var(--accent);
}

.nav__icon {
  font-size: 16px;
  color: var(--ink-faint);
  transition: color 0.16s ease;
}

.nav__item.is-active .nav__icon {
  color: var(--accent);
}

.nav__text {
  flex: 1;
}

.nav__badge {
  padding: 1px 6px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent-ink);
  font-size: 10px;
  font-weight: 650;
}

.sidebar__foot {
  margin-top: auto;
  padding-top: 22px;
}

.provider {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 11px 12px;
  border: 1px solid var(--line);
  border-radius: 11px;
  background: color-mix(in srgb, var(--surface) 52%, transparent);
  color: var(--ink);
  transition: border-color 0.16s ease, background-color 0.16s ease;
}

.provider:hover {
  border-color: var(--line-strong);
  background: var(--surface);
  color: var(--ink);
}

.provider__top {
  display: flex;
  align-items: center;
  gap: 6px;
}

.provider__label {
  color: var(--ink-faint);
  font-size: 10px;
  font-weight: 650;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.provider__name {
  color: var(--ink-strong);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.provider__meta {
  color: var(--ink-faint);
  font-size: 10.5px;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.foot-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  padding: 0 4px;
}

.theme-button,
.palette-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 28px;
  padding: 0 7px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--ink-faint);
  cursor: pointer;
  transition: background-color 0.16s ease, color 0.16s ease;
}

.theme-button:hover,
.palette-button:hover {
  background: var(--surface);
  color: var(--ink);
}

.theme-button {
  width: 30px;
  padding: 0;
  font-size: 14px;
}

.palette-button {
  margin-left: auto;
  font-size: 13px;
}

.version {
  color: var(--ink-faint);
  font-family: var(--font-mono);
  font-size: 10px;
}

@media (max-width: 960px) {
  .sidebar {
    width: min(84vw, 288px);
    transform: translateX(-102%);
    transition: transform 0.26s cubic-bezier(0.22, 0.8, 0.3, 1);
    box-shadow: var(--shadow-pop);
  }

  .sidebar.is-open {
    transform: translateX(0);
  }
}
</style>
