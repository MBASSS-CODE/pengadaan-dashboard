<template>
  <DashboardApiTable 
    group="dashboard"
    :endpoint="endpointPath"
    :title="pageTitle"
    :subtitle="`Data API Dashboard ${pageTitle}`"
    :params="defaultParams"
  />
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const slug = computed(() => {
  const p = route.params.slug;
  if (Array.isArray(p)) return p.join('/');
  return p || '';
});

const endpointPath = computed(() => slug.value);

const defaultParams = computed(() => {
  if (slug.value === 'realisasi/penyedia/per-sumber') {
    return ['tahun', 'instansi'];
  }
  return ['tahun', 'jenis', 'instansi'];
});

const pageTitle = computed(() => {
  if (!slug.value) return 'Dashboard Data API';
  return slug.value
    .split('/')
    .map(part => part.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))
    .join(' - ');
});
</script>
