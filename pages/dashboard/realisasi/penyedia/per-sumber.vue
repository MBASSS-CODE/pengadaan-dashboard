<template>
  <DashboardApiTable 
    group="dashboard"
    endpoint="realisasi/penyedia/per-sumber"
    title="Realisasi Penyedia Per-Sumber"
    subtitle="Data realisasi penyedia berdasarkan sumber dana"
    :params="['tahun', 'kd_satker']"
  />
</template>
