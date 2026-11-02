<!-- SPDX-License-Identifier: Apache-2.0 -->
<template>
  <div v-if="html" class="markdown-body" v-html="html" />
  <p v-else class="markdown-empty">{{ emptyText }}</p>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DOMPurify from 'dompurify'
import { marked } from 'marked'

const props = withDefaults(
  defineProps<{
    text?: string
    emptyText?: string
  }>(),
  { text: '', emptyText: 'Nothing to show yet.' },
)

marked.setOptions({ gfm: true, breaks: true })

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank')
    node.setAttribute('rel', 'noopener noreferrer')
  }
})

const html = computed(() => {
  const source = props.text?.trim()
  if (!source) return ''
  const rendered = marked.parse(source) as string
  return DOMPurify.sanitize(rendered, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['style', 'iframe', 'form', 'input'],
  })
})
</script>

<style scoped>
.markdown-empty {
  color: var(--ink-faint);
  font-size: 12px;
  line-height: 1.6;
}
</style>
