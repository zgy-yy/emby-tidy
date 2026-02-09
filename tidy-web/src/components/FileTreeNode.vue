<template>
  <div class="file-tree-node">
    <div
      :class="['node-item', { expanded: isExpanded }]"
      :style="{ paddingLeft: `${level * 20 + 8}px` }"
      @click="toggleExpand"
    >
      <span class="node-icon">
        <FolderOpen v-if="node.type === 'directory' && isExpanded" :size="16" />
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
}>()

const isExpanded = ref(props.level < 2) // 默认展开前两级

const toggleExpand = () => {
  if (props.node.type === 'directory') {
    isExpanded.value = !isExpanded.value
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
</style>
