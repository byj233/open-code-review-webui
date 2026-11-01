<!-- SPDX-License-Identifier: Apache-2.0 -->
<template>
  <div class="stat">
    <div class="stat__label">
      <el-icon v-if="icon" class="stat__icon"><component :is="icon" /></el-icon>
      <span>{{ label }}</span>
    </div>
    <div class="stat__value" :class="{ 'stat__value--small': compact }">{{ value }}</div>
    <div v-if="hint" class="stat__hint" :title="hint">{{ hint }}</div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue';

defineProps<{
  label: string
  value: string | number
  hint?: string
  icon?: Component
  compact?: boolean
}>();
</script>

<style scoped>
.stat__icon {
  font-size: 11px;
  color: var(--ink-faint);
}
</style>
