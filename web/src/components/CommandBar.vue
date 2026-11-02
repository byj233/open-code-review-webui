<!-- SPDX-License-Identifier: Apache-2.0 -->
<template>
  <div class="command-bar" :title="command">
    <span class="command-bar__prompt">$</span>
    <span class="command-bar__text">{{ command }}</span>
    <el-tooltip content="Copy command" placement="top" :show-after="350">
      <button class="command-bar__copy" type="button" aria-label="Copy command" @click="copy">
        <el-icon><CopyDocument /></el-icon>
      </button>
    </el-tooltip>
  </div>
</template>

<script setup lang="ts">
import { CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { copyText } from '@/utils/clipboard'

const props = defineProps<{ command: string }>()

async function copy(): Promise<void> {
  const copied = await copyText(props.command)
  if (copied) ElMessage.success('Command copied')
  else ElMessage.error('Could not copy the command')
}
</script>

<style scoped>
.command-bar__copy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 25px;
  height: 25px;
  margin-left: auto;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: var(--ink-faint);
  cursor: pointer;
  flex: none;
  transition: background-color 0.16s ease, color 0.16s ease;
}

.command-bar__copy:hover {
  background: var(--surface);
  color: var(--ink);
}
</style>
