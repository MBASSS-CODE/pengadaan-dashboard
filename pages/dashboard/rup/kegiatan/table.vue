<template>
  <DashboardApiTable 
    group="dashboard"
    endpoint="rup/kegiatan/table"
    title="RUP Kegiatan Table"
    subtitle="Tabel data kegiatan Rencana Umum Pengadaan"
    :params="['tahun', 'jenis', 'instansi']"
  />
</template>
