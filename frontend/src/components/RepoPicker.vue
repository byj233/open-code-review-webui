<!-- SPDX-License-Identifier: Apache-2.0 -->
<template>
  <el-dialog
    :model-value="open"
    :title="t('repoPicker.title')"
    width="560px"
    append-to-body
    @update:model-value="onToggle"
  >
    <p class="picker__text">{{ t('repoPicker.description') }}</p>

    <label class="picker__label" for="repo-picker-path">{{ t('repoPicker.pathLabel') }}</label>
    <el-input
      id="repo-picker-path"
      v-model="path"
      clearable
      :placeholder="t('repoPicker.placeholder')"
      @keyup.enter="submit"
    />
    <p class="picker__hint">{{ t('repoPicker.hint') }}</p>
    <p v-if="error" class="picker__error">{{ error }}</p>

    <div v-if="recent.length" class="picker__recent">
      <p class="picker__label">{{ t('repoPicker.recent') }}</p>
      <button
        v-for="item in recent"
        :key="item"
        class="picker__recent-item"
        type="button"
        :title="item"
        @click="path = item"
      >
        <el-icon><FolderOpened /></el-icon>
        <span class="picker__recent-path">{{ item }}</span>
      </button>
    </div>

    <template #footer>
      <el-button :disabled="loading" @click="close">{{ t('common.cancel') }}</el-button>
      <el-button type="primary" :loading="loading" @click="submit">{{ t('repoPicker.open') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { FolderOpened } from '@element-plus/icons-vue';
import { api } from '@/api/client';
import { describeError } from '@/utils/format';
import { useMetaStore } from '@/stores/meta';
import { useI18n } from '@/i18n';

const RECENT_KEY = 'ocr-recent-repos';

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ 'update:open': [value: boolean] }>();

const router = useRouter();
const { meta, refresh } = useMetaStore();
const { t } = useI18n();

const path = ref('');
const loading = ref(false);
const error = ref('');
const recent = ref<string[]>(readRecent());

function readRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === 'string').slice(0, 6);
  } catch {
    return [];
  }
}

function remember(target: string): void {
  recent.value = [target, ...recent.value.filter((item) => item !== target)].slice(0, 6);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent.value));
  } catch {
    // Private browsing rejects storage; the list still works for this session.
  }
}

onMounted(() => {
  path.value = meta.value?.repo.path ?? '';
});

watch(
  () => props.open,
  (value) => {
    if (!value) return;
    error.value = '';
    path.value = meta.value?.repo.path ?? '';
    recent.value = readRecent();
  },
);

function onToggle(value: boolean): void {
  if (!value) close();
}

function close(): void {
  if (!loading.value) emit('update:open', false);
}

async function submit(): Promise<void> {
  const target = path.value.trim();
  if (!target || loading.value) return;
  loading.value = true;
  error.value = '';
  try {
    const repo = await api.openRepo(target);
    await refresh(true);
    remember(repo.path);
    ElMessage.success(t('repoPicker.opened'));
    emit('update:open', false);
    void router.push('/');
  } catch (err) {
    error.value = describeError(err);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.picker__text {
  margin-bottom: 14px;
  color: var(--ink-muted);
  font-size: 12.5px;
  line-height: 1.6;
}

.picker__label {
  display: block;
  margin-bottom: 6px;
  color: var(--ink-muted);
  font-size: 12px;
  font-weight: 600;
}

.picker__hint {
  margin-top: 7px;
  color: var(--ink-faint);
  font-size: 11.5px;
  line-height: 1.55;
}

.picker__error {
  margin-top: 8px;
  color: var(--danger, #c0392b);
  font-size: 12px;
}

.picker__recent {
  margin-top: 18px;
}

.picker__recent-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 7px 9px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--ink-muted);
  font: inherit;
  font-size: 12px;
  text-align: left;
  cursor: pointer;
}

.picker__recent-item:hover {
  border-color: var(--line);
  background: var(--surface);
  color: var(--ink);
}

.picker__recent-path {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--font-mono);
  font-size: 11.5px;
}
</style>
