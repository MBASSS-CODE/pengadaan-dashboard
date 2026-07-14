<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
/* CSS Reset (Karena Tailwind dihapus) */
html, body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  background-color: var(--maz-color-background, #ffffff);
}

*, *::before, *::after {
  box-sizing: inherit;
}
</style>
