<!-- SPDX-License-Identifier: Apache-2.0 -->
<template>
  <span class="status-pill" :class="`status-pill--${toneClass}`">
    <span class="status-pill__dot" :class="{ 'dot--pulse': isPulsing }" />
    {{ text }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { jobStatusMeta } from '@/utils/status';

const props = defineProps<{
  status?: string
  label?: string
  tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger'
  pulse?: boolean
}>();

const meta = computed(() => jobStatusMeta(props.status));
const text = computed(() => props.label ?? meta.value.label);
const isPulsing = computed(() => props.pulse ?? meta.value.pulse);
const toneClass = computed(() => {
  if (props.tone) return props.tone;
  switch (meta.value.tone) {
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    case 'danger':
      return 'danger';
    case 'accent':
      return 'accent';
    default:
      return 'neutral';
  }
});
</script>

<style scoped>
.status-pill__dot {
  width: 5px;
  height: 5px;
  border-radius: 999px;
  background: currentColor;
}
</style>
