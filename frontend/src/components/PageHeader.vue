<!-- SPDX-License-Identifier: Apache-2.0 -->
<template>
  <header class="page-header">
    <div class="page-header__main">
      <router-link v-if="backTo" :to="backTo" class="back-link">
        <el-icon><ArrowLeft /></el-icon>
        {{ backLabel || t('pageHeader.back') }}
      </router-link>
      <p v-if="eyebrow" class="eyebrow" :class="{ 'eyebrow--accent': accentEyebrow }">{{ eyebrow }}</p>
      <h1 class="page-title">{{ title }}</h1>
      <p v-if="description" class="page-description">{{ description }}</p>
      <div v-if="$slots.meta" class="page-header__meta">
        <slot name="meta" />
      </div>
    </div>
    <div v-if="$slots.actions" class="page-header__actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { ArrowLeft } from '@element-plus/icons-vue'
import { useI18n } from '@/i18n'

const { t } = useI18n()

withDefaults(
  defineProps<{
    title: string
    eyebrow?: string
    description?: string
    backTo?: string
    backLabel?: string
    accentEyebrow?: boolean
  }>(),
  { accentEyebrow: true },
)
</script>

<style scoped>
.back-link {
  display: flex;
  width: fit-content;
  align-items: center;
  gap: 5px;
  margin-bottom: 14px;
  color: var(--ink-faint);
  font-size: 11.5px;
  font-weight: 600;
  transition: color 0.16s ease;
}

.back-link:hover {
  color: var(--accent);
}

.page-header__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 14px;
}
</style>
