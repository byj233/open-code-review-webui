<!-- SPDX-License-Identifier: Apache-2.0 -->
<template>
  <Teleport to="body">
    <transition name="palette">
      <div v-if="open" class="palette-overlay" @mousedown.self="close">
        <div class="palette" role="dialog" aria-modal="true" aria-label="Command palette">
          <div class="palette__search">
            <el-icon class="palette__search-icon"><Search /></el-icon>
            <input
              ref="inputRef"
              v-model="query"
              class="palette__input"
              type="text"
              placeholder="Search commands and pages..."
              aria-label="Search commands"
              @keydown.up.prevent="move(-1)"
              @keydown.down.prevent="move(1)"
              @keydown.enter.prevent="runActive"
              @keydown.esc.prevent="close"
            />
            <span class="kbd">Esc</span>
          </div>

          <div v-if="filtered.length" class="palette__list" role="listbox">
            <template v-for="group in grouped" :key="group.label">
              <p class="palette__group">{{ group.label }}</p>
              <button
                v-for="item in group.items"
                :key="item.id"
                class="palette__item"
                :class="{ 'is-active': item.id === activeId }"
                type="button"
                role="option"
                :aria-selected="item.id === activeId"
                @mouseenter="activeId = item.id"
                @click="execute(item)"
              >
                <span class="palette__item-icon">
                  <el-icon><component :is="item.icon" /></el-icon>
                </span>
                <span class="palette__item-text">
                  <span class="palette__item-label">{{ item.label }}</span>
                  <span class="palette__item-hint">{{ item.hint }}</span>
                </span>
                <span class="palette__item-kind">{{ item.group }}</span>
              </button>
            </template>
          </div>
          <div v-else class="palette__empty">
            No commands match “{{ query }}”.
          </div>

          <div class="palette__foot">
            <span><span class="kbd">↑</span><span class="kbd">↓</span> navigate</span>
            <span><span class="kbd">↵</span> select</span>
            <span class="palette__foot-brand">Open Code Review</span>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Connection,
  EditPen,
  Grid,
  Collection,
  Reading,
  Search,
  Setting,
  VideoPlay,
} from '@element-plus/icons-vue'
import { api, errorMessage } from '@/api/client'
import type { Component } from 'vue'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ 'update:open': [value: boolean] }>()

interface PaletteItem {
  id: string
  label: string
  hint: string
  group: 'Navigate' | 'Actions'
  icon: Component
  to?: string
  action?: 'test-connection'
}

const router = useRouter()
const query = ref('')
const activeId = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

const items: PaletteItem[] = [
  { id: 'overview', label: 'Overview', hint: 'Workspace, sessions, and recent activity', group: 'Navigate', icon: Grid, to: '/' },
  { id: 'review', label: 'Run a code review', hint: 'Review working tree, a commit, or a branch range', group: 'Navigate', icon: EditPen, to: '/review' },
  { id: 'scan', label: 'Scan the repository', hint: 'Review whole files without a diff', group: 'Navigate', icon: Search, to: '/scan' },
  { id: 'sessions', label: 'Sessions', hint: 'Browse saved review history', group: 'Navigate', icon: Collection, to: '/sessions' },
  { id: 'providers', label: 'Providers', hint: 'Choose a model provider and add credentials', group: 'Navigate', icon: Connection, to: '/providers' },
  { id: 'settings', label: 'Settings', hint: 'Review effort, tokens, telemetry, and MCP servers', group: 'Navigate', icon: Setting, to: '/settings' },
  { id: 'rules', label: 'Review rules', hint: 'Inspect the built-in language rules', group: 'Navigate', icon: Reading, to: '/rules' },
  { id: 'test', label: 'Test model connection', hint: 'Send a small request to the configured provider', group: 'Actions', icon: VideoPlay, action: 'test-connection' },
]

const filtered = computed(() => {
  const value = query.value.trim().toLowerCase()
  if (!value) return items
  return items.filter((item) =>
    `${item.label} ${item.hint} ${item.group}`.toLowerCase().includes(value),
  )
})

const grouped = computed(() => {
  const groups: Array<{ label: string; items: PaletteItem[] }> = []
  for (const label of ['Navigate', 'Actions'] as const) {
    const groupItems = filtered.value.filter((item) => item.group === label)
    if (groupItems.length) groups.push({ label, items: groupItems })
  }
  return groups
})

watch(query, () => {
  if (!filtered.value.some((item) => item.id === activeId.value)) {
    activeId.value = filtered.value[0]?.id ?? ''
  }
})

watch(
  () => props.open,
  async (value) => {
    if (value) {
      query.value = ''
      activeId.value = items[0]?.id ?? ''
      await nextTick()
      inputRef.value?.focus()
    }
  },
)

function close(): void {
  emit('update:open', false)
}

function move(delta: number): void {
  const list = filtered.value
  if (!list.length) return
  const index = Math.max(0, list.findIndex((item) => item.id === activeId.value))
  const next = (index + delta + list.length) % list.length
  activeId.value = list[next].id
}

function runActive(): void {
  const item = filtered.value.find((entry) => entry.id === activeId.value) ?? filtered.value[0]
  if (item) void execute(item)
}

async function execute(item: PaletteItem): Promise<void> {
  close()
  if (item.to) {
    await router.push(item.to)
    return
  }
  if (item.action === 'test-connection') {
    try {
      const job = await api.testConnection()
      await router.push(`/runs/${job.id}`)
    } catch (error) {
      ElMessage.error(errorMessage(error))
    }
  }
}

function onKeydown(event: KeyboardEvent): void {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    emit('update:open', !props.open)
    return
  }
  if (event.key === 'Escape' && props.open) {
    event.preventDefault()
    close()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.palette-overlay {
  position: fixed;
  inset: 0;
  z-index: 120;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 11vh 16px 40px;
  background: rgba(25, 22, 17, 0.34);
  backdrop-filter: blur(3px);
}

html.dark .palette-overlay {
  background: rgba(0, 0, 0, 0.55);
}

.palette {
  width: min(640px, 100%);
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 17px;
  background: var(--surface);
  box-shadow: var(--shadow-pop);
}

.palette__search {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--line);
}

.palette__search-icon {
  color: var(--ink-faint);
  font-size: 16px;
}

.palette__input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--ink);
  font-size: 14.5px;
}

.palette__input::placeholder {
  color: var(--ink-faint);
}

.palette__list {
  max-height: min(58vh, 520px);
  padding: 8px;
  overflow-y: auto;
}

.palette__group {
  margin: 9px 9px 5px;
  color: var(--ink-faint);
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.palette__item {
  display: flex;
  align-items: center;
  gap: 11px;
  width: 100%;
  padding: 9px 10px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.palette__item.is-active {
  background: var(--bg-tint);
}

.palette__item-icon {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border: 1px solid var(--line);
  border-radius: 9px;
  background: var(--surface);
  color: var(--ink-muted);
  font-size: 14px;
  flex: none;
}

.palette__item.is-active .palette__item-icon {
  border-color: rgba(201, 100, 66, 0.25);
  background: var(--accent-softer);
  color: var(--accent);
}

.palette__item-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.palette__item-label {
  color: var(--ink-strong);
  font-size: 12.5px;
  font-weight: 600;
}

.palette__item-hint {
  margin-top: 1px;
  color: var(--ink-faint);
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.palette__item-kind {
  color: var(--ink-faint);
  font-size: 9.5px;
  font-weight: 650;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.palette__empty {
  padding: 38px 20px;
  color: var(--ink-faint);
  text-align: center;
  font-size: 12.5px;
}

.palette__foot {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 9px 14px;
  border-top: 1px solid var(--line);
  background: var(--bg-tint);
  color: var(--ink-faint);
  font-size: 10.5px;
}

.palette__foot > span {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.palette__foot-brand {
  margin-left: auto;
  font-family: var(--font-display);
  font-size: 11.5px;
  color: var(--ink-faint);
}

.palette-enter-active,
.palette-leave-active {
  transition: opacity 0.16s ease;
}

.palette-enter-active .palette,
.palette-leave-active .palette {
  transition: transform 0.18s cubic-bezier(0.22, 0.8, 0.3, 1), opacity 0.16s ease;
}

.palette-enter-from,
.palette-leave-to {
  opacity: 0;
}

.palette-enter-from .palette,
.palette-leave-to .palette {
  transform: translateY(-8px) scale(0.985);
  opacity: 0;
}
</style>
