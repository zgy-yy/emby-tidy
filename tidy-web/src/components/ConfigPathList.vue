<template>
  <div class="config-path-list">
    <div class="path-input-group">
      <input
        :value="newPath"
        type="text"
        placeholder="输入新路径"
        class="form-input"
        @input="$emit('update:newPath', ($event.target as HTMLInputElement).value)"
        @keyup.enter="$emit('add')"
      />
      <button type="button" class="btn btn-primary" @click="$emit('add')">
        添加路径
      </button>
    </div>
    <div class="path-list-config">
      <div
        v-for="(folder, index) in modelValue"
        :key="index"
        class="path-item-config"
      >
        <input
          :value="folder.path"
          type="text"
          readonly
          class="form-input form-input-readonly"
        />
        <button
          type="button"
          class="btn btn-danger"
          @click="$emit('remove', index)"
        >
          删除
        </button>
      </div>
      <div v-if="modelValue.length === 0" class="empty-paths">
        <FolderOpen class="empty-icon" />
        <p>暂无配置路径</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FolderOpen } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: Array<{ path: string }>
  newPath: string
}>()

const emit = defineEmits<{
  'update:newPath': [value: string]
  add: []
  remove: [index: number]
}>()
</script>

<style scoped>
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

.path-item-config .btn {
  padding: var(--btn-padding);
  font-size: var(--btn-font-size);
  min-height: var(--btn-min-height);
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
}
</style>