<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import HelloWorld from '@/components/HelloWorld.vue';
import { useGetJson, downloadFile2, downloadFile3 } from '@/service/test';

const { data, request: getJson, loading } = useGetJson();
const downloadFile1 = (type: 'txt' | 'img') => window.open(`/api/${type}File`);
</script>

<template>
  <header>
    <img
      alt="Vue logo"
      class="logo"
      src="@/assets/logo.svg"
      width="125"
      height="125"
    />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />

      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>

      <div>
        <button @click="getJson">getJson</button>
        <div>loading: {{ loading }}</div>
        <div>data: {{ data || '-' }}</div>
      </div>

      <div>
        <button @click="() => downloadFile1('txt')">downloadTxtFile1</button>
        <button @click="() => downloadFile1('img')">downloadImgFile1</button>
      </div>

      <div>
        <button @click="() => downloadFile2('txt')">downloadTxtFile2</button>
        <button @click="() => downloadFile2('img')">downloadImgFile2</button>
      </div>

      <div>
        <button @click="() => downloadFile3('txt')">downloadTxtFile3</button>
        <button @click="() => downloadFile3('img')">downloadImgFile3</button>
      </div>
    </div>
  </header>

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
