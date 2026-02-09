<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
</script>

<template>
  <div id="app">
    <NavBar />
    <RouterView />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch; /* iOS 平滑滚动 */
  padding-bottom: 0; /* 底部导航是 fixed，不需要 padding */
}

/* 移动端优化 */
@media (max-width: 768px) {
  body {
    font-size: 14px;
  }

  /* 防止 iOS 双击缩放 */
  * {
    -webkit-tap-highlight-color: transparent;
  }

  /* 优化触摸目标大小 */
  button, a, input, select, textarea {
    min-height: 44px; /* iOS 推荐的最小触摸目标 */
  }
}
</style>
