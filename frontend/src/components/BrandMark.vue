<!-- SPDX-License-Identifier: Apache-2.0 -->
<template>
  <svg
    class="brand-mark"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <g stroke="currentColor" :stroke-width="weight" stroke-linecap="round">
      <path d="M12 2.6v5.1" />
      <path d="M12 16.3v5.1" />
      <path d="M2.6 12h5.1" />
      <path d="M16.3 12h5.1" />
      <path d="M5.4 5.4l3.6 3.6" />
      <path d="M15 15l3.6 3.6" />
      <path d="M18.6 5.4L15 9" />
      <path d="M9 15l-3.6 3.6" />
    </g>
  </svg>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: number
    weight?: number
  }>(),
  { size: 22, weight: 2.2 },
);
</script>

<style scoped>
.brand-mark {
  color: var(--accent);
  flex: none;
}
</style>
