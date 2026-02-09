<template>
  <div class="config-view">
    <div class="page-header">
      <h1 class="page-title">配置管理</h1>
      <p class="page-subtitle">管理系统配置和参数</p>
    </div>

    <div class="content-wrapper">
      <div class="section-card">
        <!-- 标签页导航 -->
        <div class="tabs">
          <button
            :class="['tab', { active: activeTab === 'folders' }]"
            @click="activeTab = 'folders'"
          >
            <Folder :size="18" />
            <span>路径</span>
          </button>
          <button
            :class="['tab', { active: activeTab === 'log' }]"
            @click="activeTab = 'log'"
          >
            <FileText :size="18" />
            <span>日志</span>
          </button>
          <button
            :class="['tab', { active: activeTab === 'ai' }]"
            @click="activeTab = 'ai'"
          >
            <Brain :size="18" />
            <span>AI</span>
          </button>
        </div>

        <div v-if="loadingConfig" class="loading-state">
          <div class="spinner"></div>
          <span>加载中...</span>
        </div>

        <div v-else-if="fullConfig">
          <!-- 路径配置 -->
          <div v-show="activeTab === 'folders'" class="tab-content">
            <div class="form-section">
              <h3 class="form-section-title">配置路径列表</h3>
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
                <div v-if="configPaths.length === 0" class="empty-paths">
                  <FolderOpen class="empty-icon" />
                  <p>暂无配置路径</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 日志配置 -->
          <div v-show="activeTab === 'log'" class="tab-content">
            <div class="form-section">
              <h3 class="form-section-title">日志设置</h3>
              <div class="form-group">
                <label class="form-label">日志级别</label>
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
                <label class="form-checkbox">
                  <input
                    type="checkbox"
                    :checked="fullConfig.log.toFile"
                    @change="updateConfigField('log', 'toFile', ($event.target as HTMLInputElement).checked)"
                  />
                  <span>输出到文件</span>
                </label>
              </div>
              <div class="form-group">
                <label class="form-label">日志目录</label>
                <input
                  :value="fullConfig.log.logDir"
                  @input="updateConfigField('log', 'logDir', ($event.target as HTMLInputElement).value)"
                  type="text"
                  class="form-input"
                />
              </div>
            </div>
          </div>

          <!-- AI 配置 -->
          <div v-show="activeTab === 'ai'" class="tab-content">
            <div class="form-section">
              <h3 class="form-section-title">AI 设置</h3>
              <div class="form-group">
                <label class="form-label">模型名称</label>
                <input
                  :value="fullConfig.ai.model"
                  @input="updateConfigField('ai', 'model', ($event.target as HTMLInputElement).value)"
                  type="text"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label class="form-label">API Base URL</label>
                <input
                  :value="fullConfig.ai.baseUrl"
                  @input="updateConfigField('ai', 'baseUrl', ($event.target as HTMLInputElement).value)"
                  type="text"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label class="form-label">API Key</label>
                <input
                  :value="fullConfig.ai.apiKey"
                  @input="updateConfigField('ai', 'apiKey', ($event.target as HTMLInputElement).value)"
                  type="password"
                  class="form-input"
                  placeholder="输入 API Key"
                />
              </div>
              <div class="form-group">
                <label class="form-label">递归限制</label>
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
      </div>

      <!-- 操作按钮 -->
      <div class="action-bar">
        <button @click="loadConfig" class="btn btn-secondary" :disabled="loadingConfig">
          <span v-if="loadingConfig" class="spinner-small"></span>
          <RefreshCw v-else :size="18" />
          {{ loadingConfig ? '加载中...' : '重新加载' }}
        </button>
        <button @click="saveConfig" class="btn btn-primary btn-large" :disabled="savingConfig || !fullConfig">
          <span v-if="savingConfig" class="spinner-small"></span>
          <Save v-else :size="18" />
          {{ savingConfig ? '保存中...' : '保存配置' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Folder, FolderOpen, FileText, Brain, RefreshCw, Save } from 'lucide-vue-next'
import { getConfig, setConfig, type Config } from '@/api/config'

const fullConfig = ref<Config | null>(null)
const configPaths = ref<Array<{ path: string }>>([])
const loadingConfig = ref(false)
const savingConfig = ref(false)
const activeTab = ref<'folders' | 'log' | 'ai'>('folders')
const newPath = ref('')

const loadConfig = async () => {
  loadingConfig.value = true
  try {
    const config = await getConfig()
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

const addPath = () => {
  if (newPath.value.trim()) {
    configPaths.value.push({ path: newPath.value.trim() })
    newPath.value = ''
  }
}

const removePath = (index: number) => {
  configPaths.value.splice(index, 1)
}

const updateConfigField = (section: keyof Config, field: string, value: any) => {
  if (!fullConfig.value) return
  if (section === 'folders') return
  
  if (section in fullConfig.value) {
    ;(fullConfig.value[section] as any)[field] = value
  }
}

const saveConfig = async () => {
  if (!fullConfig.value) return
  
  savingConfig.value = true
  try {
    const updatedConfig: Config = {
      log: fullConfig.value.log,
      ai: fullConfig.value.ai,
      folders: configPaths.value,
    }
    await setConfig(updatedConfig)
    fullConfig.value = updatedConfig
    alert('配置保存成功')
    configPaths.value = updatedConfig.folders || []
  } catch (error) {
    console.error('保存配置失败:', error)
    alert('保存配置失败: ' + (error instanceof Error ? error.message : String(error)))
  } finally {
    savingConfig.value = false
  }
}

onMounted(() => {
  loadConfig()
})
</script>

<style scoped>
.config-view {
  padding: 1rem;
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
  max-width: 900px;
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
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #f3f4f6;
  padding-bottom: 0.5rem;
}

.tab {
  flex: 1;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.3s ease;
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.tab:hover {
  color: #667eea;
  background: #f8f9ff;
}

.tab.active {
  color: #667eea;
  border-bottom-color: #667eea;
  font-weight: 600;
  background: #f8f9ff;
}

.tab-content {
  min-height: 300px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #f3f4f6;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 500;
  color: #374151;
  font-size: 0.95rem;
}

.form-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  color: #374151;
}

.form-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  padding-right: 2.5rem;
}

.path-input-group {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.path-list-config {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.path-item-config {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.path-item-config .form-input {
  flex: 1;
}

.empty-paths {
  text-align: center;
  padding: 2rem;
  color: #9ca3af;
}

.empty-paths .empty-icon {
  width: 60px;
  height: 60px;
  margin-bottom: 0.5rem;
  opacity: 0.5;
  color: #9ca3af;
  stroke-width: 1.5;
}

.action-bar {
  display: flex;
  gap: 1rem;
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
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

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #4b5563;
  transform: translateY(-2px);
}

.btn-danger {
  background: #ef4444;
  color: white;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
}

.btn-danger:hover {
  background: #dc2626;
}

.btn-large {
  flex: 1;
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem 1rem;
  color: #6b7280;
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
  .config-view {
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

  .tabs {
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .tab {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }

  .form-input {
    font-size: 16px; /* 防止 iOS 缩放 */
    padding: 1rem;
  }

  .path-input-group {
    flex-direction: column;
  }

  .path-item-config {
    flex-direction: column;
    align-items: stretch;
  }

  .path-item-config .btn {
    width: 100%;
  }

  .action-bar {
    flex-direction: column;
    padding: 1rem;
  }

  .action-bar .btn {
    width: 100%;
    padding: 1rem;
    font-size: 1rem;
  }

  .btn-large {
    flex: none;
  }
}
</style>
