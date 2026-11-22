<template>
  <DashboardApiTable 
    group="dashboard"
    endpoint="profil/table"
    title="Profil Table"
    subtitle="Tabel data profil pengadaan"
    :params="['tahun', 'jenis', 'instansi']"
  />
</template>
