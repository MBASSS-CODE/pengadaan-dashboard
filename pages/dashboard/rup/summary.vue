<template>
  <DashboardApiTable 
    group="dashboard"
    endpoint="rup/summary"
    title="RUP Summary"
    subtitle="Ringkasan data Rencana Umum Pengadaan"
    :params="['tahun', 'jenis', 'instansi']"
  />
</template>
