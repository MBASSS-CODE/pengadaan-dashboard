<template>
  <DashboardApiTable 
    group="dashboard"
    endpoint="realisasi-rup/search"
    title="Realisasi RUP Search"
    subtitle="Pencarian dan detail data realisasi RUP"
    :params="['tahun', 'jenis', 'instansi']"
  />
</template>
