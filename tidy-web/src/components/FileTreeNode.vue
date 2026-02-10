<template>
  <div class="file-tree-node">
    <div
      :class="['node-item', { expanded: isExpanded }]"
      :style="{ paddingLeft: `${level * 20 + 8}px` }"
      @click="toggleExpand"
    >
      <span class="node-icon">
        <span v-if="node.type === 'directory' && loading" class="spinner-small"></span>
        <FolderOpen v-else-if="node.type === 'directory' && isExpanded" :size="16" />
        <Folder v-else-if="node.type === 'directory'" :size="16" />
        <File v-else :size="16" />
      </span>
      <span class="node-name" :title="node.path">{{ node.name }}</span>
    </div>
    <div v-if="isExpanded && node.children.length > 0" class="node-children">
      <FileTreeNode
        v-for="child in node.children"
        :key="child.path"
        :node="child"
        :level="level + 1"
        :load-children="loadChildren"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Folder, FolderOpen, File } from 'lucide-vue-next'
import type { FileTree } from '@/api/files'

const props = defineProps<{
  node: FileTree
  level: number
  loadChildren?: (path: string) => Promise<FileTree[]>
}>()

const isExpanded = ref(props.level === 0)
const loading = ref(false)
const hasLoaded = ref(props.node.children.length > 0)

async function toggleExpand() {
  if (props.node.type !== 'directory') return
  isExpanded.value = !isExpanded.value
  if (isExpanded.value && !hasLoaded.value && props.loadChildren) {
    loading.value = true
    try {
      const children = await props.loadChildren(props.node.path)
      props.node.children = children
      hasLoaded.value = true
    } catch (e) {
      console.error('加载子目录失败:', e)
    } finally {
      loading.value = false
    }
  }
}
</script>

<style scoped>
.file-tree-node {
  user-select: none;
}

.node-item {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.node-item:hover {
  background-color: #f0f0f0;
}

.node-icon {
  margin-right: 6px;
  display: flex;
  align-items: center;
  color: #667eea;
  flex-shrink: 0;
}

.node-name {
  flex: 1;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-children {
  margin-left: 0;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid #e0e0e0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
