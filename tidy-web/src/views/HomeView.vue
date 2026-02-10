<template>
  <div class="home-view">
    <div class="page-header">
      <h1 class="page-title">文件浏览</h1>
      <p class="page-subtitle">选择路径并扫描目录结构</p>
    </div>

    <div class="content-wrapper">
      <!-- 路径选择卡片 -->
      <div class="section-card">
        <div class="card-header">
          <div class="card-title-wrapper">
            <Folder class="card-icon" />
            <h2 class="card-title">配置路径</h2>
          </div>
        </div>
        <div v-if="loadingConfig" class="loading-state">
          <div class="spinner"></div>
          <span>加载中...</span>
        </div>
        <div v-else-if="configPaths.length === 0" class="empty-state">
          <FolderOpen class="empty-icon" />
          <p>暂无配置路径</p>
          <router-link to="/config" class="btn btn-primary">去配置</router-link>
        </div>
        <div v-else class="path-grid">
          <button
            v-for="(folder, index) in configPaths"
            :key="index"
            :class="['path-card', { active: selectedPath === folder.path }]"
            @click="selectPath(folder.path)"
          >
            <div class="path-icon">
              <Folder :size="24" />
            </div>
            <div class="path-info">
              <div class="path-name">{{ getPathName(folder.path) }}</div>
              <div class="path-full">{{ folder.path }}</div>
            </div>
          </button>
        </div>
      </div>

      <!-- 操作区域 -->
      <div v-if="selectedPath || currentPath" class="section-card">
        <div class="card-header">
          <div class="card-title-wrapper">
            <Search class="card-icon" />
            <h2 class="card-title">扫描操作</h2>
          </div>
        </div>
        <div class="action-area">
          <input
            v-model="currentPath"
            type="text"
            placeholder="或输入自定义路径"
            class="path-input"
          />
          <button @click="handleScan" :disabled="scanning" class="btn btn-primary btn-large">
            <span v-if="scanning" class="spinner-small"></span>
            <Search v-else :size="18" />
            {{ scanning ? '扫描中...' : '扫描目录' }}
          </button>
        </div>
      </div>

      <!-- 文件树 -->
      <div v-if="fileTree" class="section-card">
        <div class="card-header">
          <div class="card-title-wrapper">
            <FolderTree class="card-icon" />
            <h2 class="card-title">文件树</h2>
          </div>
          <div class="card-header-right">
            <span class="watch-hint">目录可点右侧图标监控</span>
            <span class="file-count">{{ getFileCount(fileTree) }} 个文件</span>
          </div>
        </div>
        <div class="tree-wrapper">
          <FileTreeNode
            :node="fileTree"
            :level="0"
            :load-children="loadChildren"
            :watched-paths="watchedPaths"
            :toggle-watch="toggleWatch"
            :watch-loading="watchLoading"
          />
        </div>
      </div>

      <div v-else-if="!scanning" class="section-card empty-card">
        <FileText class="empty-icon" />
        <p>请选择路径并扫描目录</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Folder, FolderOpen, Search, FolderTree, FileText } from 'lucide-vue-next'
import { scanDirectory, type FileTree } from '@/api/files'
import { getConfig } from '@/api/config'
import { getWatchDirectories, watchDirectory, unwatchDirectory } from '@/api/watch'
import FileTreeNode from '@/components/FileTreeNode.vue'

const currentPath = ref('')
const selectedPath = ref<string>('')
const fileTree = ref<FileTree | null>(null)
const scanning = ref(false)
const configPaths = ref<Array<{ path: string }>>([])
const loadingConfig = ref(false)
const watchedPaths = ref<string[]>([])
const watchLoading = ref(false)

const getPathName = (path: string) => {
  const parts = path.split('/').filter(Boolean)
  return parts[parts.length - 1] || path
}

const getFileCount = (tree: FileTree): number => {
  if (tree.type === 'file') return 1
  return tree.children.reduce((sum, child) => sum + getFileCount(child), 0)
}

const loadConfig = async () => {
  loadingConfig.value = true
  try {
    const config = await getConfig()
    const { webDav, ...cleanConfig } = config as any
    configPaths.value = cleanConfig.folders || []
  } catch (error) {
    console.error('加载配置失败:', error)
  } finally {
    loadingConfig.value = false
  }
}

const selectPath = (path: string) => {
  selectedPath.value = path
  currentPath.value = path
  fileTree.value = null
}

/** 只扫描一层，用于一级一级展开 */
const loadChildren = async (dirPath: string): Promise<FileTree[]> => {
  const result = await scanDirectory(dirPath, false)
  return result.fileTree.children || []
}

/** 拉取当前监控目录列表 */
const loadWatched = async () => {
  try {
    watchedPaths.value = await getWatchDirectories()
  } catch (e) {
    console.error('获取监控列表失败:', e)
    watchedPaths.value = []
  }
}

/** 点击监控：已监控则取消，未监控则添加 */
const toggleWatch = async (path: string) => {
  if (watchLoading.value) return
  watchLoading.value = true
  try {
    if (watchedPaths.value.includes(path)) {
      await unwatchDirectory(path)
    } else {
      await watchDirectory(path)
    }
    await loadWatched()
  } catch (e) {
    console.error('监控操作失败:', e)
    alert('操作失败: ' + (e instanceof Error ? e.message : String(e)))
  } finally {
    watchLoading.value = false
  }
}

const handleScan = async () => {
  const path = currentPath.value || selectedPath.value
  if (!path) {
    alert('请输入目录路径或选择配置路径')
    return
  }

  scanning.value = true
  try {
    const result = await scanDirectory(path, false)
    fileTree.value = result.fileTree
    await loadWatched()
  } catch (error) {
    console.error('扫描失败:', error)
    alert('扫描失败: ' + (error instanceof Error ? error.message : String(error)))
  } finally {
    scanning.value = false
  }
}

onMounted(() => {
  loadConfig()
  loadWatched()
})
</script>

<style scoped>
.home-view {
  padding: 1rem;
  background: linear-gradient(135deg, var(--color-spring-gradient-start) 0%, var(--color-spring-gradient-end) 100%);
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
  padding: 2rem 1rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.page-subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.section-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f3f4f6;
}

.card-title-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.card-icon {
  width: 24px;
  height: 24px;
  color: var(--color-primary);
  flex-shrink: 0;
  stroke-width: 2;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.card-header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.watch-hint {
  font-size: 0.75rem;
  color: #6b7280;
}

.file-count {
  font-size: 0.875rem;
  color: #6b7280;
  background: #f3f4f6;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
}

.path-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.path-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  width: 100%;
}

.path-card:hover {
  border-color: var(--color-primary);
  background: #f8f9ff;
  transform: translateY(-2px);
}

.path-card.active {
  border-color: var(--color-primary);
  background: linear-gradient(135deg, var(--color-spring-gradient-start) 0%, var(--color-spring-gradient-end) 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.path-icon {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border-radius: 12px;
  padding: 12px;
  transition: all 0.3s ease;
}

.path-icon {
  color: var(--color-primary);
  stroke-width: 2;
}

.path-card.active .path-icon {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.path-info {
  flex: 1;
  min-width: 0;
}

.path-name {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.path-full {
  font-size: 0.75rem;
  opacity: 0.7;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.path-card.active .path-full {
  opacity: 0.9;
}

.action-area {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.path-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.path-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.tree-wrapper {
  max-height: 600px;
  overflow-y: auto;
  padding: 0.5rem;
  background: #f9fafb;
  border-radius: 8px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem 1rem;
  text-align: center;
  color: #6b7280;
}

.empty-card {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin-bottom: 1rem;
  opacity: 0.4;
  color: #9ca3af;
}

.empty-icon {
  stroke-width: 1.5;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
}


.btn-large {
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-small {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 移动端优化 */
@media (max-width: 768px) {
  .home-view {
    padding: 0.75rem;
  }

  .page-header {
    padding: 1.5rem 0.5rem;
    margin-bottom: 1.5rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .page-subtitle {
    font-size: 0.875rem;
  }

  .section-card {
    padding: 1rem;
    border-radius: 12px;
  }

  .card-title {
    font-size: 1.1rem;
  }

  .path-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .path-card {
    padding: 0.875rem;
  }

  .path-icon {
    font-size: 1.5rem;
  }

  .path-name {
    font-size: 0.9rem;
  }

  .path-full {
    font-size: 0.7rem;
  }

  .tree-wrapper {
    max-height: 400px;
  }

  .btn-large {
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
  }
}
</style>
