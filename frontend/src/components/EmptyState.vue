<!-- SPDX-License-Identifier: Apache-2.0 -->
<template>
  <div class="empty-state">
    <div class="empty-state__mark">
      <BrandMark :size="20" />
    </div>
    <h3 class="empty-state__title">{{ title }}</h3>
    <p v-if="description" class="empty-state__text">{{ description }}</p>
    <div v-if="$slots.default" class="empty-state__actions">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import BrandMark from '@/components/BrandMark.vue';

defineProps<{
  title: string
  description?: string
}>();
</script>

<style scoped>
.empty-state__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}
</style>
