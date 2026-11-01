<!-- SPDX-License-Identifier: Apache-2.0 -->
<template>
  <div class="not-found">
    <div class="not-found__mark">
      <BrandMark :size="30" />
    </div>
    <p class="eyebrow eyebrow--accent">404</p>
    <h1 class="not-found__title">{{ t('notFound.title') }}</h1>
    <p class="not-found__text">{{ t('notFound.text') }}</p>
    <div class="not-found__actions">
      <el-button type="primary" @click="router.push('/')">{{ t('notFound.backToOverview') }}</el-button>
      <el-button @click="router.back()">{{ t('notFound.goBack') }}</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import BrandMark from '@/components/BrandMark.vue'
import { useI18n } from '@/i18n'

const router = useRouter()
const { t } = useI18n()
</script>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 8px;
  min-height: 56vh;
  max-width: 560px;
  margin: 0 auto;
  animation: page-in 0.34s cubic-bezier(0.22, 0.8, 0.3, 1) both;
}

.not-found__mark {
  display: grid;
  place-items: center;
  width: 58px;
  height: 58px;
  margin-bottom: 18px;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: var(--accent-softer);
  box-shadow: var(--shadow-xs);
}

.not-found__title {
  margin-top: 6px;
  color: var(--ink-strong);
  font-family: var(--font-display);
  font-size: clamp(30px, 4vw, 42px);
  font-weight: 500;
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.not-found__text {
  margin-top: 10px;
  color: var(--ink-muted);
  font-size: 13px;
  line-height: 1.7;
}

.not-found__actions {
  display: flex;
  gap: 8px;
  margin-top: 20px;
}
</style>
