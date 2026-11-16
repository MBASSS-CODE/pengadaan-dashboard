<template>
  <DashboardApiTable 
    group="dashboard"
    endpoint="realisasi-rup/summary"
    title="Realisasi RUP Summary"
    subtitle="Ringkasan data realisasi RUP"
    :params="['tahun', 'kd_klpd', 'kd_satker']"
  />
</template>
