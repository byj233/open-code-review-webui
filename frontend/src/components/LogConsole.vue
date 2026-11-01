<!-- SPDX-License-Identifier: Apache-2.0 -->
<template>
  <section class="log">
    <header class="log__bar">
      <div class="log__title-row">
        <span class="log__light" :class="{ 'log__light--live': running }" />
        <span class="log__title">{{ titleText }}</span>
        <span v-if="running" class="log__live">{{ t('logs.header.live') }}</span>
      </div>
      <div class="log__actions">
        <button class="log__button" type="button" :aria-pressed="follow" @click="follow = !follow">
          <el-icon><Bottom /></el-icon>
          {{ follow ? t('logs.actions.following') : t('logs.actions.follow') }}
        </button>
        <button class="log__button" type="button" :aria-label="t('logs.actions.copy')" @click="copyLog">
          <el-icon><CopyDocument /></el-icon>
          {{ t('common.copy') }}
        </button>
      </div>
    </header>

    <div ref="bodyRef" class="log__body" :style="{ height: heightStyle }" @scroll="onScroll">
      <div v-if="!lines.length" class="log__empty">
        <span v-if="running" class="log__cursor" />
        <span v-if="running">{{ t('logs.empty.starting') }}</span>
        <span v-else>{{ t('logs.empty.none') }}</span>
      </div>
      <div v-else class="log__lines" role="log" aria-live="polite">
        <div
          v-for="line in lines"
          :key="line.seq"
          class="log__line"
          :class="lineClass(line)"
          :title="formatDate(line.time)"
        >
          <span class="log__stream" aria-hidden="true">{{ line.stream === 'stderr' ? '·' : '›' }}</span>
          <span class="log__text">{{ line.text }}</span>
        </div>
        <div v-if="running" class="log__line log__line--cursor">
          <span class="log__stream" aria-hidden="true">›</span>
          <span class="log__cursor" />
        </div>
      </div>
      <button v-if="!follow" class="log__jump" type="button" @click="jumpToLatest">
        {{ t('logs.actions.jumpToLatest') }}
        <el-icon><ArrowDown /></el-icon>
      </button>
    </div>

    <footer class="log__foot">
      <span>{{ tn('logs.footer.lineCount', lines.length) }}</span>
      <span v-if="truncated">{{ t('logs.footer.trimmed') }}</span>
      <span class="log__foot-spacer" />
      <span class="log__foot-state">
        <span class="dot" :class="running ? 'dot--accent dot--pulse' : 'dot--green'" />
        {{ running ? t('logs.footer.running') : t('logs.footer.complete') }}
      </span>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { ArrowDown, Bottom, CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useI18n } from '@/i18n'
import { copyText } from '@/utils/clipboard'
import { formatDate } from '@/utils/format'
import type { JobLogLine } from '@/types'

const props = withDefaults(
  defineProps<{
    lines: JobLogLine[]
    running?: boolean
    title?: string
    height?: number | string
    truncated?: boolean
  }>(),
  { running: false, height: 460, truncated: false },
)

const { t, tn } = useI18n()

const bodyRef = ref<HTMLElement | null>(null)
const follow = ref(true)

const titleText = computed(() => props.title ?? t('logs.header.title'))

const heightStyle = computed(() =>
  typeof props.height === 'number' ? `${props.height}px` : props.height,
)

function lineClass(line: JobLogLine): string[] {
  const classes = ['log__line']
  if (line.stream === 'stderr') classes.push('log__line--stderr')
  if (/\b(error|failed|failure)\b/i.test(line.text)) classes.push('log__line--error')
  else if (/\b(warning|warn)\b/i.test(line.text)) classes.push('log__line--warn')
  else if (/(completed|successful|done)\b/i.test(line.text)) classes.push('log__line--success')
  return classes
}

function isNearBottom(): boolean {
  const el = bodyRef.value
  if (!el) return true
  return el.scrollHeight - el.scrollTop - el.clientHeight < 48
}

function onScroll(): void {
  if (isNearBottom()) follow.value = true
  else follow.value = false
}

async function jumpToLatest(): Promise<void> {
  follow.value = true
  await nextTick()
  const el = bodyRef.value
  if (el) el.scrollTop = el.scrollHeight
}

watch(
  () => props.lines.length,
  async () => {
    if (!follow.value) return
    await nextTick()
    const el = bodyRef.value
    if (el) el.scrollTop = el.scrollHeight
  },
)

async function copyLog(): Promise<void> {
  const text = props.lines.map((line) => line.text).join('\n')
  const copied = await copyText(text)
  if (copied) ElMessage.success(t('logs.actions.copied'))
  else ElMessage.error(t('logs.actions.copyFailed'))
}
</script>

<style scoped>
.log {
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 13px;
  background: var(--code-bg);
  box-shadow: 0 18px 40px -34px rgba(0, 0, 0, 0.7);
}

.log__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  background: var(--code-bg-soft);
}

.log__title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.log__light {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #6f6a5f;
  flex: none;
}

.log__light--live {
  background: var(--accent);
  box-shadow: 0 0 0 3px rgba(217, 119, 87, 0.14);
  animation: log-blink 1.8s ease-in-out infinite;
}

.log__title {
  color: var(--code-ink);
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.log__live {
  padding: 1px 6px;
  border-radius: 999px;
  background: rgba(217, 119, 87, 0.14);
  color: #e6a58e;
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.log__actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.log__button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 25px;
  padding: 0 7px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: var(--code-ink-dim);
  font-size: 10.5px;
  cursor: pointer;
  transition: background-color 0.16s ease, color 0.16s ease;
}

.log__button:hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--code-ink);
}

.log__body {
  position: relative;
  overflow: auto;
  padding: 13px 16px 18px;
  background:
    radial-gradient(600px 220px at 12% 0%, rgba(217, 119, 87, 0.05), transparent 60%),
    var(--code-bg);
}

.log__lines {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.log__line {
  display: flex;
  gap: 9px;
  color: var(--code-ink);
  font-family: var(--font-mono);
  font-size: 11.5px;
  line-height: 1.72;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  tab-size: 2;
}

.log__stream {
  flex: none;
  width: 8px;
  color: var(--code-ink-dim);
  opacity: 0.55;
  user-select: none;
}

.log__line--stderr .log__text {
  color: #c9c2b4;
}

.log__line--warn .log__text {
  color: #e2b978;
}

.log__line--error .log__text {
  color: #ec9b90;
}

.log__line--success .log__text {
  color: #a9c9a4;
}

.log__empty {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 12px 2px;
  color: var(--code-ink-dim);
  font-family: var(--font-mono);
  font-size: 11.5px;
}

.log__cursor {
  display: inline-block;
  width: 7px;
  height: 14px;
  background: var(--accent);
  animation: cursor-blink 1.1s step-end infinite;
}

.log__line--cursor {
  padding-top: 2px;
}

.log__jump {
  position: sticky;
  bottom: 2px;
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 12px auto 0;
  padding: 5px 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  background: rgba(38, 37, 34, 0.94);
  color: var(--code-ink);
  font-size: 10.5px;
  cursor: pointer;
  backdrop-filter: blur(4px);
}

.log__foot {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  background: var(--code-bg-soft);
  color: var(--code-ink-dim);
  font-size: 9.5px;
  letter-spacing: 0.02em;
}

.log__foot-spacer {
  flex: 1;
}

.log__foot-state {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.log__foot-state .dot {
  width: 5px;
  height: 5px;
}

@keyframes cursor-blink {
  0%,
  49% {
    opacity: 1;
  }
  50%,
  100% {
    opacity: 0;
  }
}

@keyframes log-blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.45;
  }
}
</style>
