<!-- SPDX-License-Identifier: Apache-2.0 -->
<template>
  <div class="page">
    <PageHeader
      v-if="job"
      :eyebrow="t('run.header.eyebrow', { kind: kindLabel })"
      :title="job.title"
      :description="runDescription"
      :back-to="backTo"
      :back-label="backLabel"
    >
      <template #meta>
        <StatusPill :status="job.status" />
        <span class="chip chip--mono">{{ t('run.header.started', { time: formatDate(job.started_at) }) }}</span>
        <span class="chip">{{ duration }}</span>
        <span v-if="job.exit_code !== undefined" class="chip chip--mono">{{ t('run.header.exit', { code: job.exit_code }) }}</span>
        <span v-if="running" class="chip" :class="{ 'chip--accent': connected }">
          <span class="dot" :class="connected ? 'dot--accent dot--pulse' : 'dot--amber'" />
          {{ connected ? t('run.header.liveStream') : t('run.header.polling') }}
        </span>
      </template>
      <template #actions>
        <template v-if="running">
          <el-button type="danger" plain :loading="canceling" @click="cancelRun">{{ t('run.header.stop') }}</el-button>
        </template>
        <template v-else>
          <el-button v-if="sessionId" @click="openSession">{{ t('run.header.openSession') }}</el-button>
          <el-button @click="runAgain">{{ t('run.header.runAgain') }}</el-button>
        </template>
      </template>
    </PageHeader>

    <PageHeader
      v-else-if="error"
      :eyebrow="t('nav.run')"
      :title="t('run.unavailable.title')"
      :description="t('run.unavailable.description')"
      back-to="/"
      :back-label="t('notFound.backToOverview')"
    />

    <CommandBar v-if="job" :command="job.command_preview" />

    <div v-if="!job && error" class="callout callout--error">
      <el-icon class="callout__icon"><WarningFilled /></el-icon>
      <div class="callout__content">
        <span>{{ error }}</span>
        <el-button size="small" @click="refresh">{{ t('common.retry') }}</el-button>
      </div>
    </div>

    <div v-else-if="!job" class="page-skeleton">
      <div class="skeleton" style="height: 460px" />
      <div class="skeleton" style="height: 160px" />
    </div>

    <template v-else>
      <div class="run-grid">
        <LogConsole
          :lines="job.logs ?? []"
          :running="running"
          :truncated="job.logs_truncated"
          :title="t('run.log.title', { kind: kindLabel })"
          :height="job.logs?.length ? 440 : 180"
        />

        <aside class="run-rail">
          <SurfaceCard :title="t('run.details.title')" :subtitle="t('run.details.subtitle')">
            <dl class="detail-list">
              <div>
                <dt>{{ t('run.details.status') }}</dt>
                <dd><StatusPill :status="job.status" /></dd>
              </div>
              <div>
                <dt>{{ t('run.details.started') }}</dt>
                <dd>{{ formatDate(job.started_at) }}</dd>
              </div>
              <div>
                <dt>{{ t('run.details.duration') }}</dt>
                <dd>{{ duration }}</dd>
              </div>
              <div v-if="job.exit_code !== undefined">
                <dt>{{ t('run.details.exitCode') }}</dt>
                <dd class="mono">{{ job.exit_code }}</dd>
              </div>
              <div v-if="llmModel">
                <dt>{{ t('run.details.model') }}</dt>
                <dd class="mono" :title="llmModel">{{ llmModel }}</dd>
              </div>
              <div v-if="sessionId">
                <dt>{{ t('run.details.session') }}</dt>
                <dd class="detail-list__session">
                  <button class="link-button mono" type="button" @click="openSession" :title="sessionId">
                    {{ shortId(sessionId, 12) }}
                  </button>
                  <button class="icon-button" type="button" :aria-label="t('run.details.copySession')" @click="copySession">
                    <el-icon><CopyDocument /></el-icon>
                  </button>
                </dd>
              </div>
              <div>
                <dt>{{ t('run.details.runId') }}</dt>
                <dd class="mono">{{ shortId(job.id, 12) }}</dd>
              </div>
            </dl>

            <div v-if="job.error" class="detail-error">
              <el-icon><WarningFilled /></el-icon>
              <span>{{ job.error }}</span>
            </div>
          </SurfaceCard>

          <SurfaceCard v-if="running" :title="t('run.live.currentStep')" :subtitle="t('run.live.subtitle')">
            <p class="latest-line mono">{{ latestLine || t('run.live.waiting') }}</p>
            <div class="live-hint">
              <span class="dot dot--accent dot--pulse" />
              {{ connected ? t('run.live.streaming') : t('run.live.fallback') }}
            </div>
          </SurfaceCard>

          <SurfaceCard v-else-if="job.status === 'failed'" :title="t('run.checks.title')">
            <ul class="check-list">
              <li>{{ t('run.checks.provider') }}</li>
              <li>{{ t('run.checks.apiKey') }}</li>
              <li>{{ t('run.checks.refs') }}</li>
            </ul>
            <div class="rail-actions">
              <router-link class="rail-link" to="/providers">{{ t('run.checks.openProviders') }} <el-icon><ArrowRight /></el-icon></router-link>
              <router-link class="rail-link" to="/settings">{{ t('run.checks.openSettings') }} <el-icon><ArrowRight /></el-icon></router-link>
            </div>
          </SurfaceCard>
        </aside>
      </div>

      <section class="result-section">
        <header class="result-section__head">
          <div>
            <h2 class="section-title">{{ t('run.result.title') }}</h2>
            <p class="result-section__sub">
              {{ running ? t('run.result.runningDescription') : t('run.result.description') }}
            </p>
          </div>
          <span v-if="job.status === 'failed'" class="chip chip--accent">{{ t('run.result.partial') }}</span>
        </header>

        <div v-if="running" class="result-waiting">
          <span class="result-waiting__spinner" />
          <div>
            <p class="result-waiting__title">{{ t('run.result.waitingTitle', { kind: kindLabel }) }}</p>
            <p class="result-waiting__text">
              {{ job.logs?.length ? tn('run.result.progressLines', job.logs.length) : t('run.result.starting') }}
            </p>
          </div>
        </div>

        <div v-else-if="isLLMTest" class="connection-card" :class="{ 'connection-card--bad': job.status !== 'succeeded' }">
          <div class="connection-card__mark">
            <el-icon><CircleCheck v-if="job.status === 'succeeded'" /><CircleClose v-else /></el-icon>
          </div>
          <div class="connection-card__body">
            <h3 class="connection-card__title">
              {{ job.status === 'succeeded' ? t('run.connection.verifiedTitle') : t('run.connection.failedTitle') }}
            </h3>
            <p class="connection-card__text">
              {{
                job.status === 'succeeded'
                  ? t('run.connection.verifiedText')
                  : t('run.connection.failedText')
              }}
            </p>
            <dl v-if="connectionDetails.length" class="connection-meta">
              <div v-for="line in connectionDetails" :key="line">
                <dt>{{ line.split(':')[0] }}</dt>
                <dd class="mono">{{ line.slice(line.indexOf(':') + 1).trim() }}</dd>
              </div>
            </dl>
            <details v-if="connectionOutput" class="connection-output">
              <summary>{{ t('run.connection.fullOutput') }}</summary>
              <pre>{{ connectionOutput }}</pre>
            </details>
            <div class="connection-actions">
              <el-button size="small" @click="runAgain">{{ t('run.header.backToProviders') }}</el-button>
              <el-button v-if="job.status === 'succeeded'" size="small" type="primary" @click="go('/reviews')">{{ t('run.connection.runReview') }}</el-button>
            </div>
          </div>
        </div>

        <template v-else-if="result">
          <div v-if="job.status === 'failed'" class="callout callout--error result-callout">
            <el-icon class="callout__icon"><WarningFilled /></el-icon>
            <div>
              <strong>{{ t('run.result.failedTitle') }}</strong>
              {{ job.error || t('run.result.failedFallback') }} {{ t('run.result.failedFooter') }}
            </div>
          </div>
          <div v-else-if="job.status === 'canceled'" class="callout callout--warning result-callout">
            <el-icon class="callout__icon"><WarningFilled /></el-icon>
            <div>{{ t('run.result.canceled') }}</div>
          </div>
          <ReviewResultPanel :result="result" />
        </template>

        <div v-else-if="job.status === 'failed' || job.status === 'canceled'" class="callout callout--error">
          <el-icon class="callout__icon"><WarningFilled /></el-icon>
          <div>
            <strong>{{ job.status === 'canceled' ? t('run.result.canceledTitle') : t('run.result.commandFailed') }}</strong>
            {{ job.error || t('run.result.noResult') }}
          </div>
        </div>

        <div v-else class="callout">
          <el-icon class="callout__icon"><InfoFilled /></el-icon>
          <div>{{ t('run.result.noResultFinished') }}</div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  ArrowRight,
  CircleCheck,
  CircleClose,
  CopyDocument,
  InfoFilled,
  WarningFilled,
} from '@element-plus/icons-vue';
import CommandBar from '@/components/CommandBar.vue';
import LogConsole from '@/components/LogConsole.vue';
import PageHeader from '@/components/PageHeader.vue';
import ReviewResultPanel from '@/components/ReviewResultPanel.vue';
import StatusPill from '@/components/StatusPill.vue';
import SurfaceCard from '@/components/SurfaceCard.vue';
import { useI18n } from '@/i18n';
import { api } from '@/api/client';
import { describeError } from '@/utils/format';
import { useJobStream } from '@/composables/useJobStream';
import { formatDate, formatElapsed, shortId } from '@/utils/format';
import { copyText } from '@/utils/clipboard';
import type { PreviewResult, ReviewResult } from '@/types';

const route = useRoute();
const router = useRouter();
const { t, tn } = useI18n();
const jobId = String(route.params.id ?? '');
const { job, connected, error, start, refresh } = useJobStream(jobId);

const now = ref(Date.now());
const canceling = ref(false);
let timer: number | undefined;

const running = computed(() =>
  job.value ? ['running', 'canceling'].includes(job.value.status) : false,
);
const kindLabel = computed(() => {
  switch (job.value?.kind) {
    case 'scan':
      return t('run.kind.scan');
    case 'llm-test':
      return t('run.kind.llmTest');
    default:
      return t('run.kind.review');
  }
});
const backTo = computed(() => {
  switch (job.value?.kind) {
    case 'scan':
      return '/scans';
    case 'llm-test':
      return '/providers';
    default:
      return '/reviews';
  }
});
const backLabel = computed(() => {
  switch (job.value?.kind) {
    case 'scan':
      return t('run.header.backToScan');
    case 'llm-test':
      return t('run.header.backToProviders');
    default:
      return t('run.header.backToReview');
  }
});
const runDescription = computed(() => {
  if (!job.value) return '';
  return t('run.header.description', { time: formatDate(job.value.started_at) });
});
const duration = computed(() => {
  const current = job.value;
  if (!current) return '--';
  const end = current.ended_at ?? new Date(now.value).toISOString();
  return formatElapsed(current.started_at, end);
});
const isLLMTest = computed(() => job.value?.kind === 'llm-test');
const result = computed<ReviewResult | PreviewResult | null>(() => {
  const value = job.value?.result;
  if (!value) return null;
  if (Array.isArray((value as PreviewResult).files)) return value as PreviewResult;
  const review = value as ReviewResult;
  if (Array.isArray(review.comments) || review.summary || review.manifest) return review;
  return null;
});
const sessionId = computed(() => (result.value as ReviewResult | null)?.session_id ?? '');
const llmModel = computed(() => (result.value as ReviewResult | null)?.llm?.model ?? '');
const latestLine = computed(() => {
  const lines = job.value?.logs ?? [];
  return lines.length ? lines[lines.length - 1].text : '';
});
const connectionOutput = computed(() => {
  const current = job.value;
  if (!current) return '';
  if (current.output) return current.output.trim();
  return (current.logs ?? []).map((line) => line.text).join('\n').trim();
});
const connectionDetails = computed(() =>
  connectionOutput.value
    .split('\n')
    .filter((line) => /^(Source|URL|Model|Region|Profile):/.test(line))
    .slice(0, 4),
);

async function cancelRun(): Promise<void> {
  try {
    await ElMessageBox.confirm(
      t('run.confirm.message'),
      t('run.confirm.title'),
      {
        confirmButtonText: t('run.confirm.confirm'),
        cancelButtonText: t('run.confirm.cancel'),
        type: 'warning',
      },
    );
  } catch {
    return;
  }
  canceling.value = true;
  try {
    await api.cancelJob(jobId);
    await refresh();
    ElMessage.info(t('run.message.stopping'));
  } catch (err) {
    ElMessage.error(describeError(err));
  } finally {
    canceling.value = false;
  }
}

function openSession(): void {
  if (sessionId.value) {
    void router.push(`/sessions/${encodeURIComponent(sessionId.value)}`);
  }
}

async function copySession(): Promise<void> {
  const copied = await copyText(sessionId.value);
  if (copied) ElMessage.success(t('run.message.sessionCopied'));
  else ElMessage.error(t('run.message.copyFailed'));
}

function runAgain(): void {
  void router.push(backTo.value);
}

function go(path: string): void {
  void router.push(path);
}

onMounted(async () => {
  timer = window.setInterval(() => {
    now.value = Date.now();
  }, 1000);
  await start();
});

onBeforeUnmount(() => {
  if (timer !== undefined) window.clearInterval(timer);
});
</script>

<style scoped>
.run-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(280px, 0.75fr);
  gap: 18px;
  align-items: start;
}

.run-rail {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.detail-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
}

.detail-list > div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
}

.detail-list dt {
  flex: none;
  color: var(--ink-faint);
  font-size: 10.5px;
  font-weight: 600;
}

.detail-list dd {
  margin: 0;
  min-width: 0;
  color: var(--ink-muted);
  font-size: 10.5px;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail-list__session {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.link-button {
  border: 0;
  background: transparent;
  color: var(--accent-ink);
  font-size: 10.5px;
  cursor: pointer;
  padding: 0;
}

.link-button:hover {
  color: var(--accent);
  text-decoration: underline;
}

.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: var(--ink-faint);
  font-size: 11px;
  cursor: pointer;
}

.icon-button:hover {
  background: var(--bg-tint);
  color: var(--ink);
}

.detail-error {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-top: 12px;
  padding: 9px 10px;
  border-radius: 8px;
  background: var(--red-soft);
  color: var(--red);
  font-size: 10.5px;
  line-height: 1.5;
  word-break: break-word;
}

.latest-line {
  padding: 10px 11px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--bg-tint);
  color: var(--ink-muted);
  font-size: 10.5px;
  line-height: 1.55;
  word-break: break-word;
}

.live-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  color: var(--ink-faint);
  font-size: 10px;
}

.check-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding-left: 16px;
  color: var(--ink-muted);
  font-size: 10.8px;
  line-height: 1.55;
}

.check-list li::marker {
  color: var(--accent);
}

.rail-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 11px;
}

.rail-link {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: var(--accent-ink);
  font-size: 11px;
  font-weight: 600;
}

.result-section {
  display: flex;
  flex-direction: column;
  gap: 13px;
  padding-top: 4px;
}

.result-section__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.result-section__sub {
  margin-top: 4px;
  color: var(--ink-faint);
  font-size: 11.5px;
}

.result-callout {
  margin-bottom: 2px;
}

.result-waiting {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 28px 22px;
  border: 1px dashed var(--line-strong);
  border-radius: var(--radius);
  background: var(--bg-tint);
}

.result-waiting__spinner {
  width: 22px;
  height: 22px;
  flex: none;
  border: 2px solid var(--line-strong);
  border-top-color: var(--accent);
  border-radius: 999px;
  animation: spin 0.9s linear infinite;
}

.result-waiting__title {
  color: var(--ink-strong);
  font-family: var(--font-display);
  font-size: 18px;
}

.result-waiting__text {
  margin-top: 2px;
  color: var(--ink-faint);
  font-size: 11.5px;
}

.connection-card {
  display: flex;
  gap: 16px;
  padding: 22px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
}

.connection-card__mark {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: var(--green-soft);
  color: var(--green);
  font-size: 21px;
  flex: none;
}

.connection-card--bad .connection-card__mark {
  background: var(--red-soft);
  color: var(--red);
}

.connection-card__body {
  min-width: 0;
  flex: 1;
}

.connection-card__title {
  color: var(--ink-strong);
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 500;
  letter-spacing: -0.02em;
}

.connection-card__text {
  margin-top: 4px;
  color: var(--ink-muted);
  font-size: 12px;
  line-height: 1.6;
}

.connection-meta {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin: 13px 0 0;
}

.connection-meta > div {
  display: flex;
  gap: 10px;
  font-size: 11px;
}

.connection-meta dt {
  width: 62px;
  flex: none;
  color: var(--ink-faint);
}

.connection-meta dd {
  margin: 0;
  min-width: 0;
  color: var(--ink-muted);
  word-break: break-all;
}

.connection-output {
  margin-top: 12px;
}

.connection-output summary {
  color: var(--ink-faint);
  font-size: 11px;
  cursor: pointer;
}

.connection-output pre {
  max-height: 260px;
  margin: 8px 0 0;
  padding: 12px;
  overflow: auto;
  border-radius: 9px;
  background: var(--code-bg);
  color: var(--code-ink);
  font-family: var(--font-mono);
  font-size: 11px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.connection-actions {
  display: flex;
  gap: 8px;
  margin-top: 15px;
}

.page-skeleton {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (max-width: 1060px) {
  .run-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .run-rail {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .run-rail {
    grid-template-columns: minmax(0, 1fr);
  }

  .connection-card {
    flex-direction: column;
  }
}
</style>
