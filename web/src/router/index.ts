// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

import { watch } from 'vue'
import { createRouter, createWebHistory, type RouteLocationNormalizedLoaded } from 'vue-router'
import { locale, t, type MessageKey } from '@/i18n'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'overview',
      meta: { title: 'nav.overview' },
      component: () => import('@/views/OverviewView.vue'),
    },
    {
      path: '/review',
      name: 'review',
      meta: { title: 'nav.review' },
      component: () => import('@/views/ReviewView.vue'),
    },
    {
      path: '/scan',
      name: 'scan',
      meta: { title: 'nav.scan' },
      component: () => import('@/views/ScanView.vue'),
    },
    {
      path: '/runs/:id',
      name: 'run',
      meta: { title: 'nav.run' },
      component: () => import('@/views/RunView.vue'),
    },
    {
      path: '/sessions',
      name: 'sessions',
      meta: { title: 'nav.sessions' },
      component: () => import('@/views/SessionsView.vue'),
    },
    {
      path: '/sessions/:id',
      name: 'session-detail',
      meta: { title: 'nav.session' },
      component: () => import('@/views/SessionDetailView.vue'),
    },
    {
      path: '/providers',
      name: 'providers',
      meta: { title: 'nav.providers' },
      component: () => import('@/views/ProvidersView.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      meta: { title: 'nav.settings' },
      component: () => import('@/views/ConfigView.vue'),
    },
    {
      path: '/rules',
      name: 'rules',
      meta: { title: 'nav.rules' },
      component: () => import('@/views/RulesView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      meta: { title: 'nav.notFound' },
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
})

function applyTitle(route: RouteLocationNormalizedLoaded): void {
  const key = route.meta.title as MessageKey | undefined
  document.title = `${key ? t(key) : t('topbar.console')} · ${t('app.title')}`
}

router.afterEach(applyTitle)

watch(locale, () => applyTitle(router.currentRoute.value))

export default router
