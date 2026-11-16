<template>
  <DashboardApiTable 
    group="dashboard"
    endpoint="rup/kegiatan/summary"
    title="RUP Kegiatan Summary"
    subtitle="Ringkasan kegiatan Rencana Umum Pengadaan"
    :params="['tahun', 'kd_klpd', 'kd_satker']"
  />
</template>
