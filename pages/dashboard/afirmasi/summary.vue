<template>
  <DashboardApiTable 
    group="dashboard"
    endpoint="afirmasi/summary"
    title="Afirmasi Summary"
    subtitle="Ringkasan data afirmasi pengadaan (PDN & UMK)"
    :params="['tahun', 'kd_klpd', 'kd_satker']"
  />
</template>
