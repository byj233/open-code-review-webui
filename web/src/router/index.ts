// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'overview',
      meta: { title: 'Overview' },
      component: () => import('@/views/OverviewView.vue'),
    },
    {
      path: '/review',
      name: 'review',
      meta: { title: 'Code review' },
      component: () => import('@/views/ReviewView.vue'),
    },
    {
      path: '/scan',
      name: 'scan',
      meta: { title: 'Repository scan' },
      component: () => import('@/views/ScanView.vue'),
    },
    {
      path: '/runs/:id',
      name: 'run',
      meta: { title: 'Run' },
      component: () => import('@/views/RunView.vue'),
    },
    {
      path: '/sessions',
      name: 'sessions',
      meta: { title: 'Sessions' },
      component: () => import('@/views/SessionsView.vue'),
    },
    {
      path: '/sessions/:id',
      name: 'session-detail',
      meta: { title: 'Session' },
      component: () => import('@/views/SessionDetailView.vue'),
    },
    {
      path: '/providers',
      name: 'providers',
      meta: { title: 'Providers' },
      component: () => import('@/views/ProvidersView.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      meta: { title: 'Settings' },
      component: () => import('@/views/ConfigView.vue'),
    },
    {
      path: '/rules',
      name: 'rules',
      meta: { title: 'Review rules' },
      component: () => import('@/views/RulesView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      meta: { title: 'Not found' },
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
})

router.afterEach((to) => {
  const title = (to.meta.title as string) || 'Console'
  document.title = `${title} · Open Code Review`
})

export default router
