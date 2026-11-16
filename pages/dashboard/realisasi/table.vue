<template>
  <DashboardApiTable 
    group="dashboard"
    endpoint="realisasi/table"
    title="Realisasi Table"
    subtitle="Tabel detail realisasi pengadaan"
    :params="['tahun', 'kd_klpd', 'kd_satker']"
  />
</template>
