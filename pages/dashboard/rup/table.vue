<template>
  <DashboardApiTable 
    group="dashboard"
    endpoint="rup/table"
    title="RUP Table"
    subtitle="Tabel data Rencana Umum Pengadaan"
    :params="['tahun', 'kd_klpd', 'kd_satker']"
  />
</template>
