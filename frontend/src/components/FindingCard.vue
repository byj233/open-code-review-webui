<!-- SPDX-License-Identifier: Apache-2.0 -->
<template>
  <article class="finding">
    <header class="finding__head">
      <span v-if="severity" class="severity" :class="`severity--${severity}`">{{ severityLabel(comment.severity) }}</span>
      <span v-if="comment.category" class="category">{{ categoryLabel(comment.category) }}</span>
      <span class="finding__path">
        <el-icon><Document /></el-icon>
        <span class="finding__file">{{ comment.path }}</span>
        <span class="finding__line">{{ lineLabel }}</span>
      </span>
      <span class="spacer" />
      <el-tooltip :content="t('finding.actions.copy')" placement="top" :show-after="300">
        <button class="finding__copy" type="button" :aria-label="t('finding.actions.copy')" @click="copyFinding">
          <el-icon><CopyDocument /></el-icon>
        </button>
      </el-tooltip>
    </header>

    <div class="finding__body">
      <MarkdownView :text="comment.content" :empty-text="t('finding.body.empty')" />
    </div>

    <div v-if="comment.existing_code || comment.suggestion_code" class="finding__code">
      <div class="finding__code-head">
        <span>{{ t('finding.change.title') }}</span>
        <span class="finding__code-hint">{{ t('finding.change.hint') }}</span>
      </div>
      <div class="code-compare" :class="{ 'code-compare--single': !comment.existing_code || !comment.suggestion_code }">
        <section v-if="comment.existing_code" class="code-block code-block--current">
          <header class="code-block__head">
            <span>{{ t('finding.code.current') }}</span>
            <span class="mono">{{ lineLabel }}</span>
          </header>
          <pre><code>{{ comment.existing_code }}</code></pre>
        </section>
        <section v-if="comment.suggestion_code" class="code-block code-block--suggested">
          <header class="code-block__head">
            <span>{{ t('finding.code.suggested') }}</span>
            <span class="mono">{{ t('finding.code.replacement') }}</span>
          </header>
          <pre><code>{{ comment.suggestion_code }}</code></pre>
        </section>
      </div>
    </div>

    <details v-if="comment.thinking" class="finding__thinking">
      <summary>
        <el-icon><MagicStick /></el-icon>
        {{ t('finding.thinking.title') }}
      </summary>
      <MarkdownView :text="comment.thinking" />
    </details>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { CopyDocument, Document, MagicStick } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import MarkdownView from '@/components/MarkdownView.vue';
import { useI18n } from '@/i18n';
import { copyText } from '@/utils/clipboard';
import { categoryLabel, normalizedSeverity, severityLabel } from '@/utils/status';
import type { LlmComment } from '@/types';

const props = defineProps<{ comment: LlmComment }>();

const { t, tn } = useI18n();

const severity = computed(() => {
  const value = normalizedSeverity(props.comment.severity);
  return value === 'unknown' ? '' : value;
});

const lineLabel = computed(() => {
  const { start_line: start, end_line: end } = props.comment;
  if (!start) return '';
  return end && end !== start ? `${start}-${end}` : `${start}`;
});

async function copyFinding(): Promise<void> {
  const comment = props.comment;
  const header = `${comment.path}:${lineLabel.value}`;
  const text = [header, '', comment.content];
  if (comment.existing_code) text.push('', t('finding.copy.current'), comment.existing_code);
  if (comment.suggestion_code) text.push('', t('finding.copy.suggested'), comment.suggestion_code);
  const copied = await copyText(text.join('\n'));
  if (copied) ElMessage.success(t('finding.actions.copied'));
  else ElMessage.error(t('finding.actions.copyFailed'));
}
</script>

<style scoped>
.finding {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 17px 19px 18px;
  border: 1px solid var(--line);
  border-radius: 13px;
  background: var(--surface);
  box-shadow: var(--shadow-xs);
}

.finding__head {
  display: flex;
  align-items: center;
  gap: 7px;
  flex-wrap: wrap;
}

.finding__path {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  color: var(--ink-faint);
  font-family: var(--font-mono);
  font-size: 11px;
}

.finding__file {
  max-width: 420px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--ink-muted);
}

.finding__line {
  padding: 1px 5px;
  border-radius: 5px;
  background: var(--accent-softer);
  color: var(--accent-ink);
  font-size: 10.5px;
  flex: none;
}

.finding__copy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: 1px solid transparent;
  border-radius: 7px;
  background: transparent;
  color: var(--ink-faint);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.16s ease, background-color 0.16s ease, color 0.16s ease;
}

.finding:hover .finding__copy,
.finding__copy:focus-visible {
  opacity: 1;
}

.finding__copy:hover {
  border-color: var(--line);
  background: var(--surface-hover);
  color: var(--ink);
}

.finding__body {
  padding-left: 1px;
}

.finding__code {
  border-top: 1px solid var(--line);
  padding-top: 12px;
}

.finding__code-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
  color: var(--ink-faint);
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.finding__code-hint {
  font-weight: 550;
  letter-spacing: 0.02em;
  text-transform: none;
  color: var(--ink-faint);
}

.code-compare {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
}

.code-compare--single {
  grid-template-columns: minmax(0, 1fr);
}

.code-block {
  overflow: hidden;
  border-radius: 9px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.code-block__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 5px 10px;
  background: var(--bg-tint);
  color: var(--ink-faint);
  font-size: 9.5px;
  font-weight: 650;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.code-block pre {
  max-height: 300px;
  margin: 0;
  padding: 11px 12px;
  overflow: auto;
  background: var(--code-bg);
  color: var(--code-ink);
  font-family: var(--font-mono);
  font-size: 11.3px;
  line-height: 1.65;
  tab-size: 2;
}

.code-block--current pre {
  box-shadow: inset 2px 0 0 rgba(171, 66, 56, 0.75);
}

.code-block--suggested pre {
  box-shadow: inset 2px 0 0 rgba(79, 122, 82, 0.85);
}

.finding__thinking {
  border-top: 1px dashed var(--line);
  padding-top: 10px;
}

.finding__thinking summary {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--ink-faint);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  list-style: none;
}

.finding__thinking summary::-webkit-details-marker {
  display: none;
}

.finding__thinking[open] summary {
  margin-bottom: 8px;
  color: var(--ink-muted);
}

.finding__thinking :deep(.markdown-body) {
  color: var(--ink-faint);
  font-size: 12px;
}

@media (max-width: 760px) {
  .code-compare {
    grid-template-columns: minmax(0, 1fr);
  }

  .finding__file {
    max-width: 200px;
  }
}
</style>
