<template>
  <div class="tidy-view">
    <div class="page-header">
      <h1 class="page-title">文件整理</h1>
      <p class="page-subtitle">使用 AI 自动整理文件到 Emby 标准格式</p>
    </div>

    <div class="content-wrapper">
      <!-- 路径选择 -->
      <div class="section-card">
        <div class="card-header">
          <h2 class="card-title">📁 选择路径</h2>
        </div>
        <div v-if="loadingConfig" class="loading-state">
          <div class="spinner"></div>
          <span>加载中...</span>
        </div>
        <div v-else-if="configPaths.length === 0" class="empty-state">
          <div class="empty-icon">📂</div>
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
            <div class="path-icon">📂</div>
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
          <h2 class="card-title">✨ 开始整理</h2>
        </div>
        <div class="action-area">
          <input
            v-model="currentPath"
            type="text"
            placeholder="或输入自定义路径"
            class="path-input"
          />
          <button @click="handleTidy" :disabled="tidying || !currentPath" class="btn btn-success btn-large">
            <span v-if="tidying" class="spinner-small"></span>
            <span v-else>✨</span>
            {{ tidying ? '整理中...' : '开始整理' }}
          </button>
        </div>
      </div>

      <!-- 整理日志 -->
      <div class="section-card log-card">
        <div class="card-header">
          <h2 class="card-title">📋 整理日志</h2>
          <button
            v-if="tidyLogs.length > 0"
            @click="tidyLogs = []"
            class="btn-clear"
          >
            清空
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
            <div class="empty-icon">📝</div>
            <p>暂无日志，点击"开始整理"按钮开始整理文件</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { tidyFile, type TidyChunk } from '@/api/files'
import { getConfig } from '@/api/config'

const currentPath = ref('')
const selectedPath = ref<string>('')
const tidying = ref(false)
const tidyLogs = ref<Array<{
  time: string
  node: string
  type: string
  data: Array<{ type: string; name: string; content: string }>
}>>([])

const configPaths = ref<Array<{ path: string }>>([])
const loadingConfig = ref(false)

const currentTime = computed(() => {
  return new Date().toLocaleTimeString()
})

const getPathName = (path: string) => {
  const parts = path.split('/').filter(Boolean)
  return parts[parts.length - 1] || path
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
}

const handleTidy = async () => {
  const path = currentPath.value || selectedPath.value
  if (!path) {
    alert('请输入目录路径或选择配置路径')
    return
  }

  tidying.value = true
  tidyLogs.value = []

  tidyFile(
    path,
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
    }
  )
}

onMounted(() => {
  loadConfig()
})
</script>

<style scoped>
.tidy-view {
  padding: 1rem;
  padding-bottom: calc(80px + 1rem);
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.log-card {
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f3f4f6;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
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
  border-color: #667eea;
  background: #f8f9ff;
  transform: translateY(-2px);
}

.path-card.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.path-icon {
  font-size: 2rem;
  flex-shrink: 0;
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
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.log-container {
  flex: 1;
  overflow-y: auto;
  background: #1e1e1e;
  padding: 1rem;
  border-radius: 12px;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  max-height: 600px;
  min-height: 300px;
}

.log-item {
  margin-bottom: 0.75rem;
  padding: 1rem;
  border-radius: 8px;
  background: #2d2d2d;
  border-left: 4px solid #666;
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
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.log-time {
  color: #9ca3af;
  font-size: 0.75rem;
}

.log-node {
  color: #d1d5db;
  font-weight: bold;
  font-size: 0.75rem;
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
  margin-top: 0.5rem;
  white-space: pre-wrap;
  word-break: break-word;
  color: #f3f4f6;
  line-height: 1.6;
}

.empty-log {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.empty-log .empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.btn-clear {
  padding: 0.5rem 1rem;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.btn-clear:hover {
  background: #4b5563;
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

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
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

.btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
}

.btn-success:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
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
  border-top-color: #667eea;
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
  .tidy-view {
    padding: 0.75rem;
    padding-bottom: calc(80px + 0.75rem);
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

  .log-container {
    max-height: 400px;
    font-size: 0.8rem;
    padding: 0.75rem;
  }

  .log-item {
    padding: 0.75rem;
    margin-bottom: 0.5rem;
  }

  .btn-large {
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
  }
}
</style>
