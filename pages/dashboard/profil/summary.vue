<template>
  <DashboardApiTable 
    group="dashboard"
    endpoint="profil/summary"
    title="Profil Summary"
    subtitle="Ringkasan data profil pengadaan"
    :params="['tahun', 'jenis', 'instansi']"
  />
</template>
