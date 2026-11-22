<template>
  <DashboardApiTable 
    group="dashboard"
    endpoint="rup/table"
    title="RUP Table"
    subtitle="Tabel data Rencana Umum Pengadaan"
    :params="['tahun', 'jenis', 'instansi']"
  />
</template>
