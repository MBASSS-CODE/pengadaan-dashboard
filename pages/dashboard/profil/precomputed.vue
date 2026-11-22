<template>
  <DashboardApiTable 
    group="dashboard"
    endpoint="profil/precomputed"
    title="Profil Precomputed"
    subtitle="Data precomputed profil realisasi dan perencanaan pengadaan"
    :params="['tahun', 'jenis', 'instansi']"
  />
</template>
