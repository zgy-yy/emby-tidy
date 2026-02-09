<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'

import { get, post, put } from './net'

function tidy() {
  const urlencoded = new URLSearchParams();
  urlencoded.append("path", "/Volumes/dav.2dland.cn/电视");
  fetch('/api/file/tidy', {
    method: 'POST',
    body: urlencoded,
  }).then(
    async (res) => {
      const reader = await res.body!.getReader()
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        const lines = text.split('\n').filter(Boolean);

        lines.forEach(line => {
          const data = JSON.parse(line);
          console.log('收到数据:', data);
        });
      }
    }
  )
}

tidy()

</script>

<template>
  <RouterView />
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
