<template>
  <DashboardApiTable 
    group="dashboard"
    endpoint="realisasi/table"
    title="Realisasi Table"
    subtitle="Tabel detail realisasi pengadaan"
    :params="['tahun', 'jenis', 'instansi']"
  />
</template>
