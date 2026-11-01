<!-- SPDX-License-Identifier: Apache-2.0 -->
<template>
  <header class="topbar">
    <div class="topbar__left">
      <button class="icon-button menu-button" type="button" :aria-label="t('topbar.openNavigation')" @click="$emit('open-menu')">
        <el-icon><Menu /></el-icon>
      </button>
      <div class="crumbs">
        <span class="crumbs__root">{{ t('topbar.console') }}</span>
        <span class="crumbs__slash">/</span>
        <span class="crumbs__page">{{ title }}</span>
      </div>
    </div>

    <div class="topbar__right">
      <router-link class="repo-chip" to="/" :title="repo?.path">
        <el-icon><Files /></el-icon>
        <span class="repo-chip__name">{{ repo?.name || t('repo.none') }}</span>
        <span class="sep" />
        <span class="repo-chip__branch">{{ branchLabel }}</span>
      </router-link>

      <button class="palette-trigger" type="button" :aria-label="t('topbar.openPalette')" @click="$emit('open-palette')">
        <el-icon><Search /></el-icon>
        <span class="palette-trigger__label">{{ t('topbar.search') }}</span>
        <span class="kbd">Ctrl</span><span class="kbd">K</span>
      </button>

      <LocaleSwitcher />

      <button class="icon-button" type="button" :aria-label="isDark ? t('topbar.themeLight') : t('topbar.themeDark')" @click="toggleTheme">
        <el-icon><Moon v-if="!isDark" /><Sunny v-else /></el-icon>
      </button>

      <el-button v-if="!isReviewRoute" type="primary" class="new-review" @click="startReview">
        <el-icon class="new-review__icon"><Plus /></el-icon>
        {{ t('topbar.newReview') }}
      </el-button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Files, Menu, Moon, Plus, Search, Sunny } from '@element-plus/icons-vue';
import LocaleSwitcher from '@/components/LocaleSwitcher.vue';
import { useMetaStore } from '@/stores/meta';
import { useTheme } from '@/composables/useTheme';
import { useI18n, type MessageKey } from '@/i18n';

defineEmits<{ 'open-menu': []; 'open-palette': [] }>();

const route = useRoute();
const router = useRouter();
const { meta } = useMetaStore();
const { isDark, toggleTheme } = useTheme();
const { t } = useI18n();

const title = computed(() => {
  const key = route.meta.title as MessageKey | undefined;
  return key ? t(key) : t('nav.overview');
});
const repo = computed(() => meta.value?.repo);
const branchLabel = computed(() => {
  const info = repo.value;
  if (!info?.is_git) return t('repo.notGitShort');
  if (info.detached) return info.head || t('repo.detachedShort');
  return info.branch || t('repo.noCommitsShort');
});
const isReviewRoute = computed(() => Boolean(route.meta.hideNewReview));

function startReview(): void {
  void router.push('/reviews');
}
</script>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  height: var(--topbar-height);
  padding: 0 30px;
  border-bottom: 1px solid var(--line);
  background: color-mix(in srgb, var(--bg) 86%, transparent);
  backdrop-filter: blur(14px) saturate(1.2);
}

.topbar__left,
.topbar__right {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.topbar__right {
  gap: 8px;
}

.crumbs {
  display: flex;
  align-items: baseline;
  gap: 7px;
  min-width: 0;
  font-size: 12px;
  white-space: nowrap;
}

.crumbs__root {
  color: var(--ink-faint);
}

.crumbs__slash {
  color: var(--line-strong);
}

.crumbs__page {
  color: var(--ink-strong);
  font-weight: 600;
}

.repo-chip {
  display: flex;
  align-items: center;
  gap: 7px;
  max-width: 300px;
  height: 30px;
  padding: 0 10px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: color-mix(in srgb, var(--surface) 60%, transparent);
  color: var(--ink-muted);
  font-size: 11px;
  transition: border-color 0.16s ease, background-color 0.16s ease;
}

.repo-chip:hover {
  border-color: var(--line-strong);
  background: var(--surface);
  color: var(--ink);
}

.repo-chip__name {
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 600;
}

.repo-chip .sep {
  width: 1px;
  height: 11px;
  background: var(--line);
}

.repo-chip__branch {
  max-width: 110px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--ink-faint);
}

.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid transparent;
  border-radius: 9px;
  background: transparent;
  color: var(--ink-faint);
  font-size: 15px;
  cursor: pointer;
  transition: background-color 0.16s ease, color 0.16s ease, border-color 0.16s ease;
}

.icon-button:hover {
  border-color: var(--line);
  background: var(--surface);
  color: var(--ink);
}

.menu-button {
  display: none;
}

.palette-trigger {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 30px;
  padding: 0 7px 0 9px;
  border: 1px solid var(--line);
  border-radius: 9px;
  background: color-mix(in srgb, var(--surface) 55%, transparent);
  color: var(--ink-faint);
  font-size: 11.5px;
  cursor: pointer;
  transition: border-color 0.16s ease, background-color 0.16s ease, color 0.16s ease;
}

.palette-trigger:hover {
  border-color: var(--line-strong);
  background: var(--surface);
  color: var(--ink-muted);
}

.palette-trigger__label {
  margin-right: 3px;
}

.new-review {
  margin-left: 4px;
}

.new-review__icon {
  margin-right: 5px;
}

@media (max-width: 1180px) {
  .repo-chip {
    display: none;
  }
}

@media (max-width: 960px) {
  .topbar {
    padding: 0 16px;
  }

  .menu-button {
    display: inline-flex;
  }

  .palette-trigger__label {
    display: none;
  }
}

@media (max-width: 620px) {
  .palette-trigger .kbd {
    display: none;
  }

  .crumbs__root,
  .crumbs__slash {
    display: none;
  }

  .new-review {
    padding: 0 11px;
  }
}
</style>
