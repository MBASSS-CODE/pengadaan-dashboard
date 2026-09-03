import { getDataDir } from '../../utils/dataDir';
import path from 'path';
import { readJsonSafe } from '../../utils/mergeManager';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const tahun = (query.tahun as string) || new Date().getFullYear().toString();

  try {
    const filePath = path.resolve(getDataDir(), 'merged', `epurchasing_enriched_${tahun}.json`);
    let data = (await readJsonSafe(filePath)) as any[];

    const satker = query.satker as string;
    if (satker && data) {
      data = data.filter((item: any) => String(item.kd_satker) === satker);
    }

    if (!data || !Array.isArray(data)) {
      return {
        success: false,
        message: 'Data belum di-merge atau tidak tersedia.',
        summary: null
      };
    }

    let filteredData = data;
    const statusQuery = query.status as string;
    if (statusQuery) {
      const allowedStatus = statusQuery.split(',').filter(Boolean);
      filteredData = data.filter((item: any) => allowedStatus.includes(item.status));
    }

    // Maps for aggregations
    const maps = {
      trend: {} as Record<string, { count: number; total: number }>,
      umkm: {} as Record<string, { count: number; total: number }>,
      rupConnection: {
        'Terkoneksi RUP': { count: 0, total: 0 },
        'Tidak Terkoneksi': { count: 0, total: 0 }
      },
      topPenyedia: {} as Record<string, { count: number; total: number }>,
      topPpk: {} as Record<string, { count: number; total: number }>,
      orderStatus: {} as Record<string, { count: number; total: number }>,
      minikom: {
        'Produk Lokal': { count: 0, total: 0 },
        'Impor / Lainnya': { count: 0, total: 0 }
      }
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

      // 4. Top Penyedia
      const penyedia = item.penyedia_nama || 'Tidak Diketahui';
      if (penyedia !== 'Tidak Diketahui') {
        let penyediaEntry = maps.topPenyedia[penyedia];
        if (!penyediaEntry) {
          penyediaEntry = { count: 0, total: 0 };
          maps.topPenyedia[penyedia] = penyediaEntry;
        }
        penyediaEntry.count++;
        penyediaEntry.total += total;
      }

      // 4b. Top PPK
      const ppk = item.ppk_nama_lengkap || item.rup_nama_ppk || 'Tidak Diketahui';
      if (ppk !== 'Tidak Diketahui') {
        let ppkEntry = maps.topPpk[ppk];
        if (!ppkEntry) {
          ppkEntry = { count: 0, total: 0 };
          maps.topPpk[ppk] = ppkEntry;
        }
        ppkEntry.count++;
        ppkEntry.total += total;
      }

      // 5. Order Status
      const status = item.status || 'Tidak Diketahui';
      let statusEntry = maps.orderStatus[status];
      if (!statusEntry) {
        statusEntry = { count: 0, total: 0 };
        maps.orderStatus[status] = statusEntry;
      }
      statusEntry.count++;
      statusEntry.total += total;

      // 6. Minikom (Produk Lokal)
      const minikomFlag = item.flag_minikom === true || String(item.flag_minikom).toLowerCase() === 'true';
      const minikomKey = minikomFlag ? 'Produk Lokal' : 'Impor / Lainnya';
      let minikomEntry = maps.minikom[minikomKey as keyof typeof maps.minikom];
      minikomEntry.count++;
      minikomEntry.total += total;
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

    // Top 10 Penyedia
    const topPenyediaArray = formatToArray(maps.topPenyedia, 'total').slice(0, 10);
    
    // Top 10 PPK
    const topPpkArray = formatToArray(maps.topPpk, 'total').slice(0, 10);

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
        topPenyedia: topPenyediaArray,
        topPpk: topPpkArray,
        orderStatus: formatToArray(maps.orderStatus, 'total'),
        minikom: formatToArray(maps.minikom, 'none')
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
