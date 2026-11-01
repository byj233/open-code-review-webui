<!-- SPDX-License-Identifier: Apache-2.0 -->
<template>
  <section class="card surface-card" :class="{ 'surface-card--flush': flush }">
    <header v-if="title || subtitle || $slots.actions" class="card-head" :class="{ 'card-head--bordered': true }">
      <div class="surface-card__heading">
        <h2 v-if="title" class="card-title">{{ title }}</h2>
        <p v-if="subtitle" class="card-subtitle">{{ subtitle }}</p>
      </div>
      <div v-if="$slots.actions" class="surface-card__actions">
        <slot name="actions" />
      </div>
    </header>
    <div class="card-body" :class="{ 'surface-card__body--flush': flush }">
      <slot />
    </div>
    <footer v-if="$slots.footer" class="card-foot">
      <slot name="footer" />
    </footer>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  subtitle?: string
  flush?: boolean
}>();
</script>

<style scoped>
.surface-card__heading {
  min-width: 0;
}

.surface-card__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.surface-card__body--flush {
  padding: 0;
}

.card-head + .card-body {
  padding-top: 16px;
}
</style>
