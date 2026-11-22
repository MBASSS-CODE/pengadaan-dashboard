<template>
  <DashboardApiTable 
    group="dashboard"
    endpoint="rup/kegiatan/summary"
    title="RUP Kegiatan Summary"
    subtitle="Ringkasan kegiatan Rencana Umum Pengadaan"
    :params="['tahun', 'jenis', 'instansi']"
  />
</template>
