<template>
  <div class="path-input-group">
    <input
      :value="modelValue"
      type="text"
      placeholder="输入新路径"
      class="form-input"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @keyup.enter="$emit('add')"
    />
    <button type="button" class="btn btn-primary" @click="$emit('add')">
      添加路径
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
  add: []
}>()
</script>

<style scoped>
.path-input-group {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.path-input-group .form-input {
  flex: 1;
  min-width: 0;
}
</style>
