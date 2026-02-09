<template>
    <nav class="bottom-nav">
        <router-link to="/" class="nav-item" active-class="active">
            <Folder class="nav-icon" />
            <span class="nav-label">浏览</span>
        </router-link>
        <router-link to="/tidy" class="nav-item" active-class="active">
            <Sparkles class="nav-icon" />
            <span class="nav-label">整理</span>
        </router-link>
        <router-link to="/config" class="nav-item" active-class="active">
            <Settings class="nav-icon" />
            <span class="nav-label">配置</span>
        </router-link>
    </nav>
</template>

<script setup lang="ts">
import { Folder, Sparkles, Settings } from 'lucide-vue-next'
</script>

<style scoped>
.bottom-nav {
    flex-shrink: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-around;
    align-items: center;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.08);
    padding: 0.75rem 0;
    z-index: 1000;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    padding: 0.5rem 1.75rem;
    text-decoration: none;
    color: #94a3b8;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 16px;
    min-width: 80px;
    position: relative;
}

.nav-item::before {
    content: '';
    position: absolute;
    top: -2px;
    left: 50%;
    transform: translateX(-50%) scaleX(0);
    width: 40px;
    height: 3px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    border-radius: 0 0 3px 3px;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-item.active::before {
    transform: translateX(-50%) scaleX(1);
}

.nav-icon {
    width: 24px;
    height: 24px;
    stroke-width: 2;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-item:not(.active) .nav-icon {
    opacity: 0.6;
    color: #94a3b8;
}

.nav-item.active .nav-icon {
    transform: translateY(-2px) scale(1.1);
    opacity: 1;
    color: #667eea;
}

.nav-label {
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.025em;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-item.active {
    color: #667eea;
}

.nav-item.active .nav-label {
    color: #667eea;
    font-weight: 600;
}

.nav-item:active {
    transform: scale(0.95);
}

/* 移动端优化 */
@media (max-width: 768px) {
    .nav-item {
        padding: 0.5rem 1rem;
        min-width: 70px;
    }

    .nav-icon {
        width: 22px;
        height: 22px;
    }

    .nav-label {
        font-size: 0.7rem;
    }
}

/* 安全区域适配（iPhone X 等） */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
    .bottom-nav {
        padding-bottom: calc(0.75rem + env(safe-area-inset-bottom));
    }
}
</style>
