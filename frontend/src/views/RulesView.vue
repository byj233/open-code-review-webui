<!-- SPDX-License-Identifier: Apache-2.0 -->
<template>
  <div class="page">
    <PageHeader
      :eyebrow="t('rules.header.eyebrow')"
      :title="t('nav.rules')"
      :description="t('rules.header.description')"
    >
      <template #actions>
        <el-button text :loading="loading" @click="load">
          <el-icon class="btn-icon"><Refresh /></el-icon>
          {{ t('rules.header.reload') }}
        </el-button>
      </template>
    </PageHeader>

    <div v-if="error" class="callout callout--error">
      <el-icon class="callout__icon"><WarningFilled /></el-icon>
      <div>{{ error }}</div>
    </div>

    <div class="rules-grid">
      <section class="card rules-list">
        <header class="rules-list__head">
          <div>
            <h2 class="card-title">{{ t('rules.list.title') }}</h2>
            <p class="card-subtitle">{{ t('rules.list.subtitle', { count: patternCount }) }}</p>
          </div>
        </header>
        <div class="rules-list__search">
          <el-input v-model="query" clearable :placeholder="t('rules.list.searchPlaceholder')">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </div>

        <div v-if="loading" class="rules-list__body">
          <div v-for="n in 8" :key="n" class="rule-skeleton">
            <span class="skeleton skeleton--text" style="width: 62%" />
          </div>
        </div>

        <div v-else class="rules-list__body">
          <button
            v-if="defaultVisible"
            class="rule-row"
            :class="{ 'is-active': selected === -1 }"
            type="button"
            @click="selected = -1"
          >
            <span class="rule-row__icon"><el-icon><Document /></el-icon></span>
            <span class="rule-row__body">
              <span class="rule-row__pattern">{{ t('rules.list.defaultTitle') }}</span>
              <span class="rule-row__meta">{{ t('rules.list.defaultHint') }}</span>
            </span>
            <el-icon class="rule-row__arrow"><ArrowRight /></el-icon>
          </button>

          <button
            v-for="entry in filteredPatterns"
            :key="entry.index"
            class="rule-row"
            :class="{ 'is-active': selected === entry.index }"
            type="button"
            @click="selected = entry.index"
          >
            <span class="rule-row__icon"><el-icon><Reading /></el-icon></span>
            <span class="rule-row__body">
              <span class="rule-row__pattern mono">{{ entry.pattern }}</span>
              <span class="rule-row__meta">{{ ruleHint(entry.pattern) }}</span>
            </span>
            <el-icon class="rule-row__arrow"><ArrowRight /></el-icon>
          </button>

          <EmptyState
            v-if="!filteredPatterns.length && !defaultVisible"
            :title="t('rules.list.emptyTitle')"
            :description="t('rules.list.emptyDescription')"
          />
        </div>

        <footer class="rules-list__foot">
          <span>{{ t('rules.list.footer', { count: patternCount }) }}</span>
          <span class="mono">~/.opencodereview/rule.json</span>
        </footer>
      </section>

      <div class="stack rules-detail">
        <SurfaceCard
          :title="t('rules.lookup.title')"
          :subtitle="t('rules.lookup.subtitle')"
        >
          <form class="lookup" @submit.prevent="checkPathRule">
            <el-input
              v-model="checkPath"
              :placeholder="t('rules.lookup.placeholder')"
              maxlength="500"
            >
              <template #prefix><el-icon><Aim /></el-icon></template>
            </el-input>
            <el-button
              type="primary"
              native-type="submit"
              :loading="checking"
              :disabled="!checkPath.trim()"
            >
              {{ t('rules.lookup.submit') }}
            </el-button>
          </form>
          <p class="lookup__hint">{{ t('rules.lookup.hint') }}</p>

          <div v-if="checkResult" class="lookup-result">
            <div class="lookup-result__meta">
              <span class="chip chip--accent">{{ sourceName(checkResult.source) }}</span>
              <span class="chip chip--mono">{{ checkResult.pattern }}</span>
              <span v-if="checkResult.sniffed_as" class="chip">{{ t('rules.lookup.contentSniff', { value: checkResult.sniffed_as }) }}</span>
            </div>
            <div class="lookup-result__rule">
              <MarkdownView :text="checkResult.rule" />
            </div>
          </div>
          <p v-else-if="checkError" class="lookup__error">{{ checkError }}</p>
          <div v-else class="lookup-empty">
            <el-icon><InfoFilled /></el-icon>
            {{ t('rules.lookup.empty') }}
          </div>
        </SurfaceCard>

        <SurfaceCard :title="selectedTitle" :subtitle="selectedSubtitle">
          <template #actions>
            <el-button size="small" text @click="copyRule">
              <el-icon class="btn-icon"><CopyDocument /></el-icon>
              {{ t('rules.detail.copy') }}
            </el-button>
          </template>
          <div v-if="selectedRule" class="rule-content">
            <MarkdownView :text="selectedRule" />
          </div>
          <EmptyState
            v-else
            :title="t('rules.detail.emptyTitle')"
            :description="t('rules.detail.emptyDescription')"
          />
        </SurfaceCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Aim,
  ArrowRight,
  CopyDocument,
  Document,
  InfoFilled,
  Reading,
  Refresh,
  Search,
  WarningFilled,
} from '@element-plus/icons-vue';
import EmptyState from '@/components/EmptyState.vue';
import MarkdownView from '@/components/MarkdownView.vue';
import PageHeader from '@/components/PageHeader.vue';
import SurfaceCard from '@/components/SurfaceCard.vue';
import { api } from '@/api/client';
import { describeError } from '@/utils/format';
import { useI18n } from '@/i18n';
import { copyText } from '@/utils/clipboard';
import type { RuleCheckResponse, RulesResponse } from '@/types';

const { t, tn } = useI18n();

const rules = ref<RulesResponse | null>(null);
const loading = ref(true);
const error = ref('');
const query = ref('');
const selected = ref(-1);
const checkPath = ref('');
const checking = ref(false);
const checkResult = ref<RuleCheckResponse | null>(null);
const checkError = ref('');

const patternCount = computed(() => rules.value?.patterns.length ?? 0);
const filteredPatterns = computed(() => {
  if (!rules.value) return [];
  const term = query.value.trim().toLowerCase();
  return rules.value.patterns
    .map((entry, index) => ({ ...entry, index }))
    .filter((entry) => {
      if (!term) return true;
      return `${entry.pattern} ${entry.rule}`.toLowerCase().includes(term);
    });
});
const defaultVisible = computed(() => {
  if (!rules.value) return false;
  const term = query.value.trim().toLowerCase();
  if (!term) return true;
  return rules.value.default_rule.toLowerCase().includes(term);
});
const selectedPattern = computed(() => {
  if (!rules.value || selected.value < 0) return null;
  return rules.value.patterns[selected.value] ?? null;
});
const selectedRule = computed(() =>
  selected.value < 0 ? rules.value?.default_rule ?? '' : selectedPattern.value?.rule ?? '',
);
const selectedTitle = computed(() =>
  selected.value < 0
    ? t('rules.detail.defaultTitle')
    : selectedPattern.value?.pattern || t('rules.detail.genericTitle'),
);
const selectedSubtitle = computed(() =>
  selected.value < 0
    ? t('rules.detail.defaultSubtitle')
    : t('rules.detail.patternSubtitle', { pattern: selectedPattern.value?.pattern ?? '' }),
);

function ruleHint(pattern: string): string {
  if (pattern.includes('{')) return t('rules.hint.braceExpanded');
  if (pattern.includes('pom.xml') || pattern.includes('Cargo.toml')) return t('rules.hint.projectManifest');
  if (pattern.includes('*.xml')) return t('rules.hint.xmlMapping');
  return t('rules.hint.firstMatch');
}

function sourceName(source: string): string {
  switch (source) {
    case 'custom':
      return t('rules.source.custom');
    case 'project':
      return t('rules.source.project');
    case 'global':
      return t('rules.source.global');
    case 'system':
      return t('rules.source.system');
    default:
      return source || t('rules.source.fallback');
  }
}

async function checkPathRule(): Promise<void> {
  const path = checkPath.value.trim();
  if (!path) return;
  checking.value = true;
  checkError.value = '';
  try {
    checkResult.value = await api.checkRule(path);
  } catch (err) {
    checkResult.value = null;
    checkError.value = describeError(err);
  } finally {
    checking.value = false;
  }
}

async function copyRule(): Promise<void> {
  const copied = await copyText(selectedRule.value);
  if (copied) ElMessage.success(t('rules.message.copied'));
  else ElMessage.error(t('rules.message.copyFailed'));
}

async function load(): Promise<void> {
  loading.value = true;
  error.value = '';
  try {
    rules.value = await api.rules();
  } catch (err) {
    error.value = describeError(err);
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.rules-grid {
  display: grid;
  grid-template-columns: minmax(280px, 0.82fr) minmax(0, 1.5fr);
  gap: 18px;
  align-items: start;
}

.rules-list {
  overflow: hidden;
  position: sticky;
  top: calc(var(--topbar-height) + 20px);
  max-height: calc(100vh - var(--topbar-height) - 40px);
  display: flex;
  flex-direction: column;
}

.rules-list__head {
  padding: 17px 18px 12px;
}

.rules-list__search {
  padding: 0 14px 12px;
  border-bottom: 1px solid var(--line);
}

.rules-list__body {
  overflow-y: auto;
  padding: 6px;
  flex: 1;
}

.rule-row {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 8px 9px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.14s ease, border-color 0.14s ease;
}

.rule-row:hover {
  background: var(--bg-tint);
}

.rule-row.is-active {
  border-color: rgba(201, 100, 66, 0.18);
  background: var(--accent-softer);
}

.rule-row__icon {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border: 1px solid var(--line);
  border-radius: 7px;
  background: var(--surface);
  color: var(--ink-faint);
  font-size: 12px;
  flex: none;
}

.rule-row.is-active .rule-row__icon {
  border-color: rgba(201, 100, 66, 0.2);
  color: var(--accent);
}

.rule-row__body {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.rule-row__pattern {
  color: var(--ink-strong);
  font-size: 10.5px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rule-row__meta {
  margin-top: 1px;
  color: var(--ink-faint);
  font-size: 9px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rule-row__arrow {
  color: var(--ink-faint);
  font-size: 10px;
  opacity: 0;
}

.rule-row:hover .rule-row__arrow,
.rule-row.is-active .rule-row__arrow {
  opacity: 1;
}

.rules-list__foot {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 16px;
  border-top: 1px solid var(--line);
  background: var(--bg-tint);
  color: var(--ink-faint);
  font-size: 9px;
}

.rule-skeleton {
  padding: 14px 10px;
}

.rules-detail {
  gap: 16px;
}

.lookup {
  display: flex;
  gap: 8px;
}

.lookup .el-input {
  flex: 1;
}

.lookup__hint {
  margin-top: 6px;
  color: var(--ink-faint);
  font-size: 10.5px;
}

.lookup-result {
  margin-top: 14px;
  border-top: 1px solid var(--line);
  padding-top: 13px;
}

.lookup-result__meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 11px;
}

.lookup-result__rule {
  max-height: 300px;
  overflow-y: auto;
  padding: 12px 14px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--bg-tint);
}

.lookup-empty {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  padding: 10px 11px;
  border: 1px dashed var(--line-strong);
  border-radius: 8px;
  color: var(--ink-faint);
  font-size: 10.5px;
}

.lookup__error {
  margin-top: 10px;
  padding: 9px 10px;
  border-radius: 8px;
  background: var(--red-soft);
  color: var(--red);
  font-size: 10.5px;
}

.rule-content {
  max-height: 640px;
  overflow-y: auto;
  padding-right: 4px;
}

.btn-icon {
  margin-right: 5px;
}

@media (max-width: 1060px) {
  .rules-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .rules-list {
    position: static;
    max-height: 420px;
  }
}

@media (max-width: 600px) {
  .lookup {
    flex-direction: column;
  }
}
</style>
