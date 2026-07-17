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
  color: var(--maz-color-foreground, #000000);
  font-family: var(--maz-font-family, 'Plus Jakarta Sans', sans-serif);
  font-size: 14px;
}

*, *::before, *::after {
  box-sizing: inherit;
}

/* Global Override untuk warna baris genap MazTable */
.m-table-row.--background-even:nth-child(2n) {
  background-color: hsl(var(--maz-foreground) / 3%) !important;
}
.m-table-row.--background-even:nth-child(2n):is([class~=dark] *) {
  background-color: hsl(var(--maz-foreground) / 4%) !important;
}
</style>
