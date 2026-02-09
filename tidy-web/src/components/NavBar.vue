<template>
  <nav class="bottom-nav">
    <router-link to="/" class="nav-item" active-class="active">
      <div class="nav-icon">📂</div>
      <span class="nav-label">浏览</span>
    </router-link>
    <router-link to="/tidy" class="nav-item" active-class="active">
      <div class="nav-icon">✨</div>
      <span class="nav-label">整理</span>
    </router-link>
    <router-link to="/config" class="nav-item" active-class="active">
      <div class="nav-icon">⚙️</div>
      <span class="nav-label">配置</span>
    </router-link>
  </nav>
</template>

<script setup lang="ts">
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.1);
  padding: 0.5rem 0;
  z-index: 1000;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.5rem 1.5rem;
  text-decoration: none;
  color: #9ca3af;
  transition: all 0.3s ease;
  border-radius: 12px;
  min-width: 70px;
  position: relative;
}

.nav-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 3px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 0 0 3px 3px;
  transition: width 0.3s ease;
}

.nav-item.active::before {
  width: 60%;
}

.nav-icon {
  font-size: 1.5rem;
  transition: transform 0.3s ease;
}

.nav-item.active .nav-icon {
  transform: scale(1.1);
}

.nav-label {
  font-size: 0.75rem;
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav-item.active {
  color: #667eea;
}

.nav-item.active .nav-label {
  color: #667eea;
  font-weight: 600;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .nav-item {
    padding: 0.5rem 1rem;
    min-width: 60px;
  }

  .nav-icon {
    font-size: 1.4rem;
  }

  .nav-label {
    font-size: 0.7rem;
  }
}

/* 安全区域适配（iPhone X 等） */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .bottom-nav {
    padding-bottom: calc(0.5rem + env(safe-area-inset-bottom));
  }
}
</style>
