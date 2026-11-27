<template>
  <DashboardApiTable 
    group="dashboard"
    endpoint="realisasi/summary"
    title="Realisasi Summary"
    subtitle="Ringkasan data realisasi pengadaan"
    :params="['tahun', 'jenis', 'instansi']"
  />
</template>
