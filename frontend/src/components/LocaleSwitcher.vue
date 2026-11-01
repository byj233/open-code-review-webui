<!-- SPDX-License-Identifier: Apache-2.0 -->
<template>
  <el-dropdown trigger="click" placement="bottom-end" @command="onSelect">
    <button class="locale-button" type="button" :aria-label="t('locale.label')" :title="t('locale.label')">
      {{ current.short }}
    </button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="option in locales"
          :key="option.code"
          :command="option.code"
          :disabled="option.code === locale"
        >
          {{ option.label }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n, type LocaleCode } from '@/i18n';

const { t, locale, setLocale, locales } = useI18n();

const current = computed(() => locales.find((option) => option.code === locale.value) ?? locales[0]);

function onSelect(code: string | number | object): void {
  if (typeof code === 'string') setLocale(code as LocaleCode);
}
</script>

<style scoped>
.locale-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 7px;
  border: 1px solid transparent;
  border-radius: 9px;
  background: transparent;
  color: var(--ink-faint);
  font-size: 11.5px;
  font-weight: 650;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: background-color 0.16s ease, color 0.16s ease, border-color 0.16s ease;
}

.locale-button:hover {
  border-color: var(--line);
  background: var(--surface);
  color: var(--ink);
}
</style>
