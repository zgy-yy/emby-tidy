<template>
  <div class="tidy-file-tree-node">
    <div
      :class="['node-item', { 
        expanded: isExpanded,
        selected: isSelected,
        'is-directory': node.type === 'directory'
      }]"
      :style="{ paddingLeft: `${level * 20 + 8}px` }"
      @click.stop="handleClick"
    >
      <span class="node-icon">
        <span v-if="node.type === 'directory' && loading" class="spinner-small"></span>
        <FolderOpen v-else-if="node.type === 'directory' && isExpanded" :size="18" />
        <Folder v-else-if="node.type === 'directory'" :size="18" />
        <File v-else :size="18" />
      </span>
      <span class="node-name" :title="node.path">{{ node.name }}</span>
      <button
        v-if="node.type === 'directory'"
        @click.stop="handleTidyClick"
        class="tidy-btn"
        title="整理此目录"
      >
        <Sparkles :size="14" />
      </button>
    </div>
    <div v-if="isExpanded && node.children.length > 0" class="node-children">
      <TidyFileTreeNode
        v-for="child in node.children"
        :key="child.path"
        :node="child"
        :level="level + 1"
        :selected-path="selectedPath"
        :load-children="loadChildren"
        @select="handleSelect"
        @tidy="handleTidy"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Folder, FolderOpen, File, Sparkles } from 'lucide-vue-next'
import type { FileTree } from '@/api/files'

const props = defineProps<{
  node: FileTree
  level: number
  selectedPath?: string
  loadChildren?: (path: string) => Promise<FileTree[]>
}>()

const emit = defineEmits<{
  select: [path: string]
  tidy: [path: string]
}>()

const isExpanded = ref(props.level === 0)
const loading = ref(false)
const hasLoaded = ref(props.node.children.length > 0)

const isSelected = computed(() => {
  return props.selectedPath === props.node.path
})

async function loadOnExpand() {
  if (props.node.type !== 'directory' || hasLoaded.value || !props.loadChildren) return
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

const handleClick = async () => {
  emit('select', props.node.path)
  if (props.node.type === 'directory') {
    isExpanded.value = !isExpanded.value
    if (isExpanded.value) await loadOnExpand()
  }
}

const handleTidyClick = () => {
  emit('tidy', props.node.path)
}

const handleSelect = (path: string) => {
  emit('select', path)
}

const handleTidy = (path: string) => {
  emit('tidy', path)
}
</script>

<style scoped>
.tidy-file-tree-node {
  user-select: none;
}

.node-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 6px;
  margin: 2px 0;
  position: relative;
}

.node-item:hover {
  background-color: #f3f4f6;
}

.node-item.selected {
  background-color: #e0e7ff;
  border-left: 3px solid var(--color-primary);
}

.node-item.is-directory {
  font-weight: 500;
}

.node-icon {
  margin-right: 8px;
  display: flex;
  align-items: center;
  color: var(--color-primary);
  flex-shrink: 0;
}

.node-item.selected .node-icon {
  color: var(--color-primary);
}

.node-name {
  flex: 1;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #1f2937;
}

.node-item.selected .node-name {
  color: var(--color-primary);
  font-weight: 600;
}

.tidy-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  margin-left: 8px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.node-item:hover .tidy-btn {
  opacity: 1;
}

.tidy-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
}

.node-children {
  margin-left: 0;
}

.spinner-small {
  width: 18px;
  height: 18px;
  border: 2px solid #e0e0e0;
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
