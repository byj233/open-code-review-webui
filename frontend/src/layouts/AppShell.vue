<!-- SPDX-License-Identifier: Apache-2.0 -->
<template>
  <div class="app-shell">
    <div v-if="mobileOpen" class="sidebar-backdrop" @click="mobileOpen = false" />
    <AppSidebar :open="mobileOpen" @navigate="mobileOpen = false" @palette="paletteOpen = true" />

    <div class="app-main">
      <AppTopbar @open-menu="mobileOpen = true" @open-palette="paletteOpen = true" />
      <main class="app-content">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" :key="$route.path" />
          </transition>
        </router-view>
      </main>
    </div>

    <CommandPalette v-model:open="paletteOpen" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import AppSidebar from '@/layouts/AppSidebar.vue';
import AppTopbar from '@/layouts/AppTopbar.vue';
import CommandPalette from '@/components/CommandPalette.vue';
import { useMetaStore } from '@/stores/meta';

const paletteOpen = ref(false);
const mobileOpen = ref(false);
const route = useRoute();
const { refresh } = useMetaStore();

watch(
  () => route.fullPath,
  () => {
    mobileOpen.value = false;
  },
);

onMounted(() => {
  void refresh(true);
});
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
}

.app-main {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  margin-left: var(--sidebar-width);
}

.app-content {
  flex: 1;
  width: 100%;
  max-width: calc(var(--content-max) + 80px);
  margin: 0 auto;
  padding: 32px 40px 80px;
}

.sidebar-backdrop {
  position: fixed;
  inset: 0;
  z-index: 35;
  background: rgba(25, 22, 17, 0.32);
  backdrop-filter: blur(2px);
}

.page-enter-active,
.page-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (max-width: 960px) {
  .app-main {
    margin-left: 0;
  }

  .app-content {
    padding: 24px 18px 64px;
  }
}

@media (max-width: 620px) {
  .app-content {
    padding: 20px 14px 56px;
  }
}
</style>
