<template>
  <DashboardApiTable 
    group="dashboard"
    endpoint="profil/summary"
    title="Profil Summary"
    subtitle="Ringkasan data profil pengadaan"
    :params="['tahun', 'kd_klpd', 'kd_satker']"
  />
</template>
