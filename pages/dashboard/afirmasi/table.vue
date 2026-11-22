<template>
  <DashboardApiTable 
    group="dashboard"
    endpoint="afirmasi/table"
    title="Afirmasi Table"
    subtitle="Tabel detail data afirmasi pengadaan"
    :params="['tahun', 'jenis', 'instansi']"
  />
</template>
