<template>
  <DashboardApiTable 
    group="dashboard"
    endpoint="afirmasi/summary"
    title="Afirmasi Summary"
    subtitle="Ringkasan data afirmasi pengadaan (PDN & UMK)"
    :params="['tahun', 'jenis', 'instansi']"
  />
</template>
