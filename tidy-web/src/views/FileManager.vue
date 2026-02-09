<template>
  <div class="file-manager">
    <!-- 顶部导航栏 -->
    <header class="navbar">
      <div class="navbar-content">
        <h1 class="logo">📁 Emby Tidy</h1>
        <button class="config-btn" @click="openConfigModal">
          ⚙️ 配置
        </button>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 左侧：路径选择和文件树 -->
      <aside class="sidebar">
        <div class="path-selector card">
          <h2 class="card-title">选择路径</h2>
          <div v-if="loadingConfig" class="loading-state">
            <div class="spinner"></div>
            <span>加载配置中...</span>
          </div>
          <div v-else-if="configPaths.length === 0" class="empty-state">
            <p>暂无配置路径</p>
            <button @click="openConfigModal" class="btn-primary">
              添加配置
            </button>
          </div>
          <div v-else class="path-list">
            <button
              v-for="(folder, index) in configPaths"
              :key="index"
              :class="['path-item', { active: selectedPath === folder.path }]"
              @click="selectPath(folder.path)"
            >
              <span class="path-icon">📂</span>
              <span class="path-text">{{ folder.path }}</span>
            </button>
          </div>
        </div>

        <!-- 操作按钮（仅在选择路径后显示） -->
        <div v-if="selectedPath" class="actions card">
          <h2 class="card-title">操作</h2>
          <div class="action-buttons">
            <button
              @click="handleScan"
              :disabled="scanning || tidying"
              class="btn btn-primary"
            >
              <span v-if="scanning" class="spinner-small"></span>
              <span v-else>🔍</span>
              {{ scanning ? '扫描中...' : '扫描目录' }}
            </button>
            <button
              @click="handleTidy"
              :disabled="tidying || scanning"
              class="btn btn-success"
            >
              <span v-if="tidying" class="spinner-small"></span>
              <span v-else>✨</span>
              {{ tidying ? '整理中...' : '整理文件' }}
            </button>
          </div>
        </div>

        <!-- 文件树 -->
        <div class="file-tree card">
          <h2 class="card-title">文件树</h2>
          <div v-if="scanning" class="loading-state">
            <div class="spinner"></div>
            <span>扫描中...</span>
          </div>
          <div v-else-if="fileTree" class="tree-container">
            <FileTreeNode :node="fileTree" :level="0" />
          </div>
          <div v-else class="empty-state">
            <p>请先选择路径并扫描目录</p>
          </div>
        </div>
      </aside>

      <!-- 右侧：整理日志 -->
      <section class="log-section">
        <div class="log-header card">
          <h2 class="card-title">整理日志</h2>
          <button
            v-if="tidyLogs.length > 0"
            @click="tidyLogs = []"
            class="btn-clear"
          >
            清空日志
          </button>
        </div>
        <div class="log-container">
          <div
            v-for="(log, index) in tidyLogs"
            :key="index"
            :class="['log-item', `log-${log.type}`]"
          >
            <div class="log-header-item">
              <span class="log-time">{{ log.time }}</span>
              <span class="log-node">[{{ log.node }}]</span>
            </div>
            <div class="log-content">
              <div
                v-for="(item, idx) in log.data"
                :key="idx"
                class="log-data-item"
              >
                <span class="log-type">{{ item.type }}</span>
                <span v-if="item.name" class="log-name">: {{ item.name }}</span>
                <div class="log-text">{{ item.content }}</div>
              </div>
            </div>
          </div>
          <div v-if="tidying && tidyLogs.length === 0" class="log-item log-info">
            <span class="log-time">{{ currentTime }}</span>
            <span>整理中...</span>
          </div>
          <div v-if="tidyLogs.length === 0 && !tidying" class="empty-log">
            <p>暂无日志</p>
          </div>
        </div>
      </section>
    </main>

    <!-- 配置模态框 -->
    <div v-if="showConfigModal" class="modal-overlay" @click.self="showConfigModal = false">
      <div class="modal-content modal-large">
        <div class="modal-header">
          <h2>配置管理</h2>
          <button class="modal-close" @click="showConfigModal = false">×</button>
        </div>
        <div class="modal-body">
          <div v-if="loadingConfig" class="loading-state">
            <div class="spinner"></div>
            <span>加载中...</span>
          </div>
          <div v-else-if="fullConfig" class="config-form">
            <!-- 标签页导航 -->
            <div class="tabs">
              <button
                :class="['tab', { active: activeTab === 'folders' }]"
                @click="activeTab = 'folders'"
              >
                📁 路径配置
              </button>
              <button
                :class="['tab', { active: activeTab === 'log' }]"
                @click="activeTab = 'log'"
              >
                📝 日志配置
              </button>
              <button
                :class="['tab', { active: activeTab === 'ai' }]"
                @click="activeTab = 'ai'"
              >
                🤖 AI 配置
              </button>
            </div>

            <!-- 路径配置 -->
            <div v-show="activeTab === 'folders'" class="tab-content">
              <div class="form-group">
                <label>配置路径列表</label>
                <div class="path-input-group">
                  <input
                    v-model="newPath"
                    type="text"
                    placeholder="输入新路径"
                    class="form-input"
                    @keyup.enter="addPath"
                  />
                  <button @click="addPath" class="btn btn-primary">添加</button>
                </div>
                <div class="path-list-config">
                  <div
                    v-for="(folder, index) in configPaths"
                    :key="index"
                    class="path-item-config"
                  >
                    <input
                      v-model="folder.path"
                      type="text"
                      class="form-input"
                    />
                    <button
                      @click="removePath(index)"
                      class="btn btn-danger"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 日志配置 -->
            <div v-show="activeTab === 'log'" class="tab-content">
              <div class="form-group">
                <label>日志级别</label>
                <select
                  :value="fullConfig.log.level"
                  @change="updateConfigField('log', 'level', ($event.target as HTMLSelectElement).value)"
                  class="form-input"
                >
                  <option value="DEBUG">DEBUG</option>
                  <option value="INFO">INFO</option>
                  <option value="WARN">WARN</option>
                  <option value="ERROR">ERROR</option>
                </select>
              </div>
              <div class="form-group">
                <label>
                  <input
                    type="checkbox"
                    :checked="fullConfig.log.toFile"
                    @change="updateConfigField('log', 'toFile', ($event.target as HTMLInputElement).checked)"
                  />
                  输出到文件
                </label>
              </div>
              <div class="form-group">
                <label>日志目录</label>
                <input
                  :value="fullConfig.log.logDir"
                  @input="updateConfigField('log', 'logDir', ($event.target as HTMLInputElement).value)"
                  type="text"
                  class="form-input"
                />
              </div>
            </div>

            <!-- AI 配置 -->
            <div v-show="activeTab === 'ai'" class="tab-content">
              <div class="form-group">
                <label>模型名称</label>
                <input
                  :value="fullConfig.ai.model"
                  @input="updateConfigField('ai', 'model', ($event.target as HTMLInputElement).value)"
                  type="text"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label>API Base URL</label>
                <input
                  :value="fullConfig.ai.baseUrl"
                  @input="updateConfigField('ai', 'baseUrl', ($event.target as HTMLInputElement).value)"
                  type="text"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label>API Key</label>
                <input
                  :value="fullConfig.ai.apiKey"
                  @input="updateConfigField('ai', 'apiKey', ($event.target as HTMLInputElement).value)"
                  type="password"
                  class="form-input"
                  placeholder="输入 API Key"
                />
              </div>
              <div class="form-group">
                <label>递归限制</label>
                <input
                  :value="fullConfig.ai.recursionLimit || 1000"
                  @input="updateConfigField('ai', 'recursionLimit', parseInt(($event.target as HTMLInputElement).value) || 1000)"
                  type="number"
                  class="form-input"
                  min="1"
                />
              </div>
            </div>

          </div>
        </div>
        <div class="modal-footer">
          <button @click="showConfigModal = false" class="btn btn-secondary">
            取消
          </button>
          <button @click="saveConfig" class="btn btn-primary" :disabled="savingConfig || !fullConfig">
            {{ savingConfig ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { scanDirectory, tidyFile, type FileTree, type TidyChunk } from '@/api/files'
import { getConfig, setConfig, type Config } from '@/api/config'
import FileTreeNode from '@/components/FileTreeNode.vue'

const selectedPath = ref<string>('')
const fileTree = ref<FileTree | null>(null)
const scanning = ref(false)
const tidying = ref(false)
const tidyLogs = ref<Array<{
  time: string
  node: string
  type: string
  data: Array<{ type: string; name: string; content: string }>
}>>([])

const configPaths = ref<Array<{ path: string }>>([])
const fullConfig = ref<Config | null>(null)
const loadingConfig = ref(false)
const savingConfig = ref(false)
const showConfigModal = ref(false)
const newPath = ref('')
const activeTab = ref<'folders' | 'log' | 'ai'>('folders')

const currentTime = computed(() => {
  return new Date().toLocaleTimeString()
})

// 加载配置
const loadConfig = async () => {
  loadingConfig.value = true
  try {
    const config = await getConfig()
    // 清理可能存在的 webDav 字段（兼容旧配置）
    const { webDav, ...cleanConfig } = config as any
    fullConfig.value = cleanConfig as Config
    configPaths.value = cleanConfig.folders || []
  } catch (error) {
    console.error('加载配置失败:', error)
    alert('加载配置失败: ' + (error instanceof Error ? error.message : String(error)))
  } finally {
    loadingConfig.value = false
  }
}

// 打开配置模态框时加载完整配置
const openConfigModal = async () => {
  showConfigModal.value = true
  if (!fullConfig.value) {
    await loadConfig()
  }
}

// 选择路径
const selectPath = (path: string) => {
  selectedPath.value = path
  fileTree.value = null
  tidyLogs.value = []
}

// 添加路径
const addPath = () => {
  if (newPath.value.trim()) {
    configPaths.value.push({ path: newPath.value.trim() })
    newPath.value = ''
  }
}

// 删除路径
const removePath = (index: number) => {
  configPaths.value.splice(index, 1)
  if (selectedPath.value === configPaths.value[index]?.path) {
    selectedPath.value = ''
  }
}

// 保存配置
const saveConfig = async () => {
  if (!fullConfig.value) return
  
  savingConfig.value = true
  try {
    // 明确构建配置对象，排除 webDav 字段
    const updatedConfig: Config = {
      log: fullConfig.value.log,
      ai: fullConfig.value.ai,
      folders: configPaths.value,
    }
    await setConfig(updatedConfig)
    fullConfig.value = updatedConfig
    showConfigModal.value = false
    alert('配置保存成功')
    // 重新加载路径列表
    configPaths.value = updatedConfig.folders || []
  } catch (error) {
    console.error('保存配置失败:', error)
    alert('保存配置失败: ' + (error instanceof Error ? error.message : String(error)))
  } finally {
    savingConfig.value = false
  }
}

// 更新单个配置项
const updateConfigField = (section: keyof Config, field: string, value: any) => {
  if (!fullConfig.value) return
  if (section === 'folders') return // folders 单独处理
  
  if (section in fullConfig.value) {
    ;(fullConfig.value[section] as any)[field] = value
  }
}

// 扫描目录
const handleScan = async () => {
  if (!selectedPath.value) {
    alert('请先选择路径')
    return
  }

  scanning.value = true
  try {
    const result = await scanDirectory(selectedPath.value, true)
    fileTree.value = result.fileTree
  } catch (error) {
    console.error('扫描失败:', error)
    alert('扫描失败: ' + (error instanceof Error ? error.message : String(error)))
  } finally {
    scanning.value = false
  }
}

// 整理文件
const handleTidy = async () => {
  if (!selectedPath.value) {
    alert('请先选择路径')
    return
  }

  tidying.value = true
  tidyLogs.value = []

  tidyFile(
    selectedPath.value,
    (chunk: TidyChunk) => {
      tidyLogs.value.push({
        time: new Date().toLocaleTimeString(),
        node: chunk.node,
        type: chunk.node === 'model_request' ? 'info' : chunk.node === 'tools' ? 'success' : 'info',
        data: chunk.data,
      })

      setTimeout(() => {
        const container = document.querySelector('.log-container')
        if (container) {
          container.scrollTop = container.scrollHeight
        }
      }, 0)
    },
    (error) => {
      console.error('整理失败:', error)
      tidyLogs.value.push({
        time: new Date().toLocaleTimeString(),
        node: 'error',
        type: 'error',
        data: [{ type: 'error', name: '', content: error.message }],
      })
      tidying.value = false
    },
    () => {
      console.log('整理完成')
      tidying.value = false
      handleScan()
    }
  )
}

onMounted(() => {
  loadConfig()
})
</script>

<style scoped>
.file-manager {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
}

/* 导航栏 */
.navbar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1rem 2rem;
}

.navbar-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.config-btn {
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.config-btn:hover {
  background: #5568d3;
  transform: translateY(-2px);
}

/* 主内容 */
.main-content {
  flex: 1;
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 1.5rem;
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  overflow: hidden;
}

/* 卡片样式 */
.card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.card-title {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

/* 侧边栏 */
.sidebar {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.path-selector,
.actions,
.file-tree {
  flex-shrink: 0;
}

.path-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.path-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
  text-align: left;
  width: 100%;
}

.path-item:hover {
  border-color: #667eea;
  background: #f8f9ff;
}

.path-item.active {
  border-color: #667eea;
  background: #667eea;
  color: white;
}

.path-icon {
  font-size: 1.2rem;
}

.path-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.9rem;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5568d3;
  transform: translateY(-2px);
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-2px);
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-danger {
  background: #ef4444;
  color: white;
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.tree-container {
  max-height: 400px;
  overflow-y: auto;
}

/* 日志区域 */
.log-section {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
  border-radius: 12px 12px 0 0;
}

.log-container {
  flex: 1;
  overflow-y: auto;
  background: #1e1e1e;
  padding: 1rem;
  border-radius: 0 0 12px 12px;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
}

.btn-clear {
  padding: 0.5rem 1rem;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}

.log-item {
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  border-radius: 6px;
  background: #2d2d2d;
  border-left: 3px solid #666;
}

.log-item.log-info {
  border-left-color: #3b82f6;
}

.log-item.log-success {
  border-left-color: #10b981;
}

.log-item.log-error {
  border-left-color: #ef4444;
}

.log-header-item {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.log-time {
  color: #9ca3af;
}

.log-node {
  color: #d1d5db;
  font-weight: bold;
}

.log-content {
  color: #e5e7eb;
}

.log-type {
  color: #60a5fa;
  font-weight: bold;
}

.log-name {
  color: #9ca3af;
}

.log-text {
  margin-top: 0.25rem;
  white-space: pre-wrap;
  word-break: break-word;
  color: #f3f4f6;
}

.empty-log {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  color: #6b7280;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e0e0e0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-small {
  width: 16px;
  height: 16px;
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

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-large {
  max-width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.modal-close {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #6b7280;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.modal-close:hover {
  background: #f3f4f6;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e0e0e0;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
}

.path-input-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.path-list-config {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.path-item-config {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.path-item-config .form-input {
  flex: 1;
}

/* 标签页样式 */
.tabs {
  display: flex;
  border-bottom: 2px solid #e0e0e0;
  margin-bottom: 1.5rem;
  gap: 0.5rem;
}

.tab {
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.3s;
  position: relative;
  bottom: -2px;
}

.tab:hover {
  color: #667eea;
  background: #f8f9ff;
}

.tab.active {
  color: #667eea;
  border-bottom-color: #667eea;
  font-weight: 600;
}

.tab-content {
  min-height: 300px;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
}

.form-group label input[type="checkbox"] {
  margin-right: 0.5rem;
}

.form-group select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  padding-right: 2.5rem;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
  }

  .sidebar {
    order: 2;
  }

  .log-section {
    order: 1;
  }
}

@media (max-width: 768px) {
  .navbar {
    padding: 1rem;
  }

  .main-content {
    padding: 1rem;
    gap: 1rem;
  }

  .card {
    padding: 1rem;
  }

  .modal-content {
    width: 95%;
    max-height: 90vh;
  }
}
</style>
