<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
</script>

<template>
  <div id="app">
    <RouterView class="router-view" />
    <NavBar />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  width: 100%;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
  /* overflow-y: auto; */
  -webkit-overflow-scrolling: touch;
  /* iOS 平滑滚动 */
}

#app {
  width: 100%;
  height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  .router-view {
    flex: 1;
    overflow-y: auto;
  }
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
  button,
  a,
  input,
  select,
  textarea {
    min-height: 44px;
    /* iOS 推荐的最小触摸目标 */
  }
}
</style>
