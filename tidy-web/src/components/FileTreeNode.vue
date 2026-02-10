<template>
  <div class="file-tree-node">
    <div
      :class="['node-item', { expanded: isExpanded, watched: isWatched }]"
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
      <button
        v-if="node.type === 'directory' && toggleWatch"
        type="button"
        class="watch-btn"
        :title="isWatched ? '取消监控' : '点击监控此目录'"
        :disabled="watchLoading"
        @click.stop="onWatchClick"
      >
        <Eye v-if="!isWatched" :size="14" />
        <EyeOff v-else :size="14" />
      </button>
    </div>
    <div v-if="isExpanded && node.children.length > 0" class="node-children">
      <FileTreeNode
        v-for="child in node.children"
        :key="child.path"
        :node="child"
        :level="level + 1"
        :load-children="loadChildren"
        :watched-paths="watchedPaths"
        :toggle-watch="toggleWatch"
        :watch-loading="watchLoading"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Folder, FolderOpen, File, Eye, EyeOff } from 'lucide-vue-next'
import type { FileTree } from '@/api/files'

const props = withDefaults(
  defineProps<{
    node: FileTree
    level: number
    loadChildren?: (path: string) => Promise<FileTree[]>
    watchedPaths?: string[]
    toggleWatch?: (path: string) => void | Promise<void>
    watchLoading?: boolean
  }>(),
  { watchedPaths: () => [], watchLoading: false },
)

const isExpanded = ref(props.level === 0)
const loading = ref(false)
const hasLoaded = ref(props.node.children.length > 0)

const isWatched = computed(() =>
  props.watchedPaths.some((p) => p === props.node.path),
)

async function onWatchClick() {
  if (props.node.type !== 'directory' || !props.toggleWatch) return
  await props.toggleWatch(props.node.path)
}

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

.node-item.watched {
  background-color: #ecfdf5;
  border-left: 3px solid var(--color-primary);
  padding-left: 5px;
}

.node-item.watched .node-icon {
  color: var(--color-primary);
}

.watch-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px 6px;
  margin-left: 4px;
  background: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  cursor: pointer;
  color: #6b7280;
  flex-shrink: 0;
  opacity: 0.7;
}

.watch-btn:hover:not(:disabled) {
  background: #f3f4f6;
  color: var(--color-primary);
  opacity: 1;
}

.watch-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.node-item.watched .watch-btn {
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.node-icon {
  margin-right: 6px;
  display: flex;
  align-items: center;
  color: var(--color-primary);
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
