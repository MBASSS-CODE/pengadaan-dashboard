<template>
  <DashboardApiTable 
    group="dashboard"
    endpoint="afirmasi/table"
    title="Afirmasi Table"
    subtitle="Tabel detail data afirmasi pengadaan"
    :params="['tahun', 'kd_klpd', 'kd_satker']"
  />
</template>
