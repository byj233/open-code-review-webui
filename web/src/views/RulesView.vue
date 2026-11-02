<!-- SPDX-License-Identifier: Apache-2.0 -->
<template>
  <div class="page">
    <PageHeader
      eyebrow="Reference"
      title="Review rules"
      description="Built-in language rules decide what the model pays attention to. Project and global rules can override them; this page shows the system layer and resolves a path against every layer."
    >
      <template #actions>
        <el-button text :loading="loading" @click="load">
          <el-icon class="btn-icon"><Refresh /></el-icon>
          Reload
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
            <h2 class="card-title">Built-in rules</h2>
            <p class="card-subtitle">{{ patternCount }} patterns plus the default fallback</p>
          </div>
        </header>
        <div class="rules-list__search">
          <el-input v-model="query" clearable placeholder="Search patterns or rule text">
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
              <span class="rule-row__pattern">Default fallback</span>
              <span class="rule-row__meta">Used when no pattern matches</span>
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
            title="No rules match"
            description="Clear the search to see every built-in rule."
          />
        </div>

        <footer class="rules-list__foot">
          <span>{{ rules?.patterns.length ?? 0 }} built-in patterns</span>
          <span class="mono">~/.opencodereview/rule.json</span>
        </footer>
      </section>

      <div class="stack rules-detail">
        <SurfaceCard
          title="Which rule applies?"
          subtitle="Resolve a path across custom, project, global, and system layers"
        >
          <form class="lookup" @submit.prevent="checkPathRule">
            <el-input
              v-model="checkPath"
              placeholder="e.g. src/main/java/com/example/Foo.java"
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
              Find rule
            </el-button>
          </form>
          <p class="lookup__hint">Reads the same resolver the review uses. No model call is made.</p>

          <div v-if="checkResult" class="lookup-result">
            <div class="lookup-result__meta">
              <span class="chip chip--accent">{{ sourceName(checkResult.source) }}</span>
              <span class="chip chip--mono">{{ checkResult.pattern }}</span>
              <span v-if="checkResult.sniffed_as" class="chip">content sniff: {{ checkResult.sniffed_as }}</span>
            </div>
            <div class="lookup-result__rule">
              <MarkdownView :text="checkResult.rule" />
            </div>
          </div>
          <p v-else-if="checkError" class="lookup__error">{{ checkError }}</p>
          <div v-else class="lookup-empty">
            <el-icon><InfoFilled /></el-icon>
            Enter a repo-relative file path to see which rule the agent would use.
          </div>
        </SurfaceCard>

        <SurfaceCard :title="selectedTitle" :subtitle="selectedSubtitle">
          <template #actions>
            <el-button size="small" text @click="copyRule">
              <el-icon class="btn-icon"><CopyDocument /></el-icon>
              Copy rule
            </el-button>
          </template>
          <div v-if="selectedRule" class="rule-content">
            <MarkdownView :text="selectedRule" />
          </div>
          <EmptyState v-else title="Select a rule" description="Choose a pattern from the list to read its guidance." />
        </SurfaceCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
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
} from '@element-plus/icons-vue'
import EmptyState from '@/components/EmptyState.vue'
import MarkdownView from '@/components/MarkdownView.vue'
import PageHeader from '@/components/PageHeader.vue'
import SurfaceCard from '@/components/SurfaceCard.vue'
import { api, errorMessage } from '@/api/client'
import { copyText } from '@/utils/clipboard'
import type { RuleCheckResponse, RulesResponse } from '@/types'

const rules = ref<RulesResponse | null>(null)
const loading = ref(true)
const error = ref('')
const query = ref('')
const selected = ref(-1)
const checkPath = ref('')
const checking = ref(false)
const checkResult = ref<RuleCheckResponse | null>(null)
const checkError = ref('')

const patternCount = computed(() => rules.value?.patterns.length ?? 0)
const filteredPatterns = computed(() => {
  if (!rules.value) return []
  const term = query.value.trim().toLowerCase()
  return rules.value.patterns
    .map((entry, index) => ({ ...entry, index }))
    .filter((entry) => {
      if (!term) return true
      return `${entry.pattern} ${entry.rule}`.toLowerCase().includes(term)
    })
})
const defaultVisible = computed(() => {
  if (!rules.value) return false
  const term = query.value.trim().toLowerCase()
  if (!term) return true
  return rules.value.default_rule.toLowerCase().includes(term)
})
const selectedPattern = computed(() => {
  if (!rules.value || selected.value < 0) return null
  return rules.value.patterns[selected.value] ?? null
})
const selectedRule = computed(() =>
  selected.value < 0 ? rules.value?.default_rule ?? '' : selectedPattern.value?.rule ?? '',
)
const selectedTitle = computed(() =>
  selected.value < 0 ? 'Default fallback rule' : selectedPattern.value?.pattern || 'Rule',
)
const selectedSubtitle = computed(() =>
  selected.value < 0
    ? 'Applies when no path pattern matches'
    : `Built-in pattern ${selectedPattern.value?.pattern ?? ''}`,
)

function ruleHint(pattern: string): string {
  if (pattern.includes('{')) return 'Brace-expanded into multiple path patterns'
  if (pattern.includes('pom.xml') || pattern.includes('Cargo.toml')) return 'Project manifest guidance'
  if (pattern.includes('*.xml')) return 'XML mapping guidance'
  return 'First matching pattern wins'
}

function sourceName(source: string): string {
  switch (source) {
    case 'custom':
      return 'Custom rule'
    case 'project':
      return 'Project rule'
    case 'global':
      return 'Global rule'
    case 'system':
      return 'Built-in system rule'
    default:
      return source || 'Rule'
  }
}

async function checkPathRule(): Promise<void> {
  const path = checkPath.value.trim()
  if (!path) return
  checking.value = true
  checkError.value = ''
  try {
    checkResult.value = await api.checkRule(path)
  } catch (err) {
    checkResult.value = null
    checkError.value = errorMessage(err)
  } finally {
    checking.value = false
  }
}

async function copyRule(): Promise<void> {
  const copied = await copyText(selectedRule.value)
  if (copied) ElMessage.success('Rule copied')
  else ElMessage.error('Could not copy the rule')
}

async function load(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    rules.value = await api.rules()
  } catch (err) {
    error.value = errorMessage(err)
  } finally {
    loading.value = false
  }
}

onMounted(load)
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
