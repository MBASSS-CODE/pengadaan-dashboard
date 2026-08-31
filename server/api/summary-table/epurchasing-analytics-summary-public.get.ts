import path from 'path';
import { readJsonSafe } from '../../utils/mergeManager';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const tahun = (query.tahun as string) || new Date().getFullYear().toString();

  try {
    const filePath = path.resolve(process.cwd(), 'server', 'data', 'merged', `epurchasing_enriched_${tahun}.json`);
    const data = await readJsonSafe(filePath);

    if (!data || !Array.isArray(data)) {
      return {
        success: false,
        message: 'Data belum di-merge atau tidak tersedia.',
        summary: null
      };
    }

    // Paksa filter hanya untuk COMPLETED dan ON_PROCESS
    const allowedStatus = ['COMPLETED', 'ON_PROCESS'];
    let filteredData = data.filter((item: any) => allowedStatus.includes(item.status));

    // Maps for aggregations
    const maps = {
      trend: {} as Record<string, { count: number; total: number }>,
      umkm: {} as Record<string, { count: number; total: number }>,
      rupConnection: {
        'Terkoneksi RUP': { count: 0, total: 0 },
        'Tidak Terkoneksi': { count: 0, total: 0 }
      },
      orderStatus: {} as Record<string, { count: number; total: number }>,
      minikom: {
        'Produk Lokal': { count: 0, total: 0 },
        'Impor / Lainnya': { count: 0, total: 0 }
      },
      metodePengadaan: {} as Record<string, { count: number; total: number }>,
      jenisPengadaan: {} as Record<string, { count: number; total: number }>,
      sumberDana: {} as Record<string, { count: number; total: number }>
    };

    let totalNilai = 0;
    let totalPesanan = filteredData.length;

    const bulanNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

    for (const item of filteredData) {
      const total = Number(item.total) || 0;
      totalNilai += total;
      
      // 1. Trend per Bulan
      let orderMonth = 'Tidak Diketahui';
      if (item.order_date) {
        const dateObj = new Date(item.order_date);
        if (!isNaN(dateObj.getTime())) {
          orderMonth = bulanNames[dateObj.getMonth()] || 'Tidak Diketahui';
        }
      }
      let trendEntry = maps.trend[orderMonth];
      if (!trendEntry) {
        trendEntry = { count: 0, total: 0 };
        maps.trend[orderMonth] = trendEntry;
      }
      trendEntry.count++;
      trendEntry.total += total;

      // 2. UMKM Status
      const umkm = item.penyedia_status_umkk || 'Tidak Diketahui';
      let umkmEntry = maps.umkm[umkm];
      if (!umkmEntry) {
        umkmEntry = { count: 0, total: 0 };
        maps.umkm[umkm] = umkmEntry;
      }
      umkmEntry.count++;
      umkmEntry.total += total;

      // 3. RUP Connection
      const isConnected = !!item.rup_code;
      const rupKey = isConnected ? 'Terkoneksi RUP' : 'Tidak Terkoneksi';
      let rupEntry = maps.rupConnection[rupKey as keyof typeof maps.rupConnection];
      rupEntry.count++;
      rupEntry.total += total;

      // 4. Order Status
      const status = item.status || 'Tidak Diketahui';
      let statusEntry = maps.orderStatus[status];
      if (!statusEntry) {
        statusEntry = { count: 0, total: 0 };
        maps.orderStatus[status] = statusEntry;
      }
      statusEntry.count++;
      statusEntry.total += total;

      // 5. Minikom (Produk Lokal)
      const minikomFlag = item.flag_minikom === true || String(item.flag_minikom).toLowerCase() === 'true';
      const minikomKey = minikomFlag ? 'Produk Lokal' : 'Impor / Lainnya';
      let minikomEntry = maps.minikom[minikomKey as keyof typeof maps.minikom];
      minikomEntry.count++;
      minikomEntry.total += total;

      // 6. Metode Pengadaan
      const metode = item.rup_metode_pengadaan || 'Tidak Diketahui';
      let metodeEntry = maps.metodePengadaan[metode];
      if (!metodeEntry) {
        metodeEntry = { count: 0, total: 0 };
        maps.metodePengadaan[metode] = metodeEntry;
      }
      metodeEntry.count++;
      metodeEntry.total += total;

      // 7. Jenis Pengadaan
      const jenis = item.rup_jenis_pengadaan || 'Tidak Diketahui';
      let jenisEntry = maps.jenisPengadaan[jenis];
      if (!jenisEntry) {
        jenisEntry = { count: 0, total: 0 };
        maps.jenisPengadaan[jenis] = jenisEntry;
      }
      jenisEntry.count++;
      jenisEntry.total += total;

      // 8. Sumber Dana
      const sumber = item.funding_source || 'Tidak Diketahui';
      let sumberEntry = maps.sumberDana[sumber];
      if (!sumberEntry) {
        sumberEntry = { count: 0, total: 0 };
        maps.sumberDana[sumber] = sumberEntry;
      }
      sumberEntry.count++;
      sumberEntry.total += total;
    }

    // Format Maps into Sorted Arrays for frontend chart consumption
    const formatToArray = (mapObj: Record<string, {count: number, total: number}>, sortBy: 'total'|'count'|'none' = 'none') => {
      let arr = Object.entries(mapObj).map(([label, val]) => ({
        label,
        count: val.count,
        total: val.total,
        persentase: totalNilai > 0 ? ((val.total / totalNilai) * 100).toFixed(2) + '%' : '0%'
      }));

      if (sortBy === 'total') {
        arr.sort((a, b) => b.total - a.total);
      } else if (sortBy === 'count') {
        arr.sort((a, b) => b.count - a.count);
      }
      return arr;
    };

    // Special sorting for trend to keep month order
    const trendArray = bulanNames.map(bulan => {
      const val = maps.trend[bulan] || { count: 0, total: 0 };
      return {
        label: bulan,
        count: val.count,
        total: val.total,
        persentase: totalNilai > 0 ? ((val.total / totalNilai) * 100).toFixed(2) + '%' : '0%'
      };
    }).filter(i => i.count > 0 || totalPesanan === 0);

    return {
      success: true,
      message: 'Berhasil memuat analytics summary',
      summary: {
        totalPesanan,
        totalNilai,
        terkoneksiRup: maps.rupConnection['Terkoneksi RUP'].count,
        trend: trendArray,
        umkm: formatToArray(maps.umkm, 'total'),
        rupConnection: formatToArray(maps.rupConnection, 'none'),
        orderStatus: formatToArray(maps.orderStatus, 'total'),
        minikom: formatToArray(maps.minikom, 'none'),
        metodePengadaan: formatToArray(maps.metodePengadaan, 'total'),
        jenisPengadaan: formatToArray(maps.jenisPengadaan, 'total'),
        sumberDana: formatToArray(maps.sumberDana, 'total')
      }
    };

  } catch (error: any) {
    console.error('[E-Purchasing Analytics API] Error:', error.message);
    return {
      success: false,
      message: 'Terjadi kesalahan sistem saat memuat analytics summary.',
      summary: null
    };
  }
});
