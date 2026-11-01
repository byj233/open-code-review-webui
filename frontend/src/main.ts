// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import App from './App.vue';
import router from './router';
import { initTheme } from './composables/useTheme';
import { initLocale } from './i18n';
import './styles/theme.css';

initTheme();
initLocale();

createApp(App).use(router).use(ElementPlus).mount('#app');
