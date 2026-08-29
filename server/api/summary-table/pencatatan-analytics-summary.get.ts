import { getDataDir } from '../../utils/dataDir';
import path from 'path';
import { readJsonSafe } from '../../utils/mergeManager';

type MapEntry = { count: number, pagu: number, realisasi: number };
type SummaryMap = Record<string, MapEntry>;

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const tahun = (query.tahun as string) || new Date().getFullYear().toString();

  try {
    const filePath = path.resolve(getDataDir(), 'merged', `pencatatan-nontender-enriched_${tahun}.json`);
    const data = await readJsonSafe(filePath);

    if (!data || !Array.isArray(data)) {
      return { success: false, message: 'Data pencatatan tidak ditemukan', summary: null };
    }

    let totalItems = 0;
    let totalPagu = 0;
    let totalRealisasi = 0;

    const maps = {
      status: {} as SummaryMap,
      metode: {} as SummaryMap,
      kategori: {} as SummaryMap,
      sumberDana: {} as SummaryMap,
      buktiBayar: {} as SummaryMap,
      satker: {} as SummaryMap,
      ppk: {} as SummaryMap,
      deviasi: {} as SummaryMap, // Overbudget, Underbudget, Sesuai
      penyediaUmkk: {} as SummaryMap,
    };

    for (const item of data) {
      totalItems++;
      const pagu = item.pagu || 0;
      const realisasi = item.total_realisasi || 0;
      totalPagu += pagu;
      totalRealisasi += realisasi;

      // 1. Status
      const statusKey = item.status_nontender_pct_ket || item.status_nontender_pct || 'Unknown';
      if (!maps.status[statusKey]) maps.status[statusKey] = { count: 0, pagu: 0, realisasi: 0 };
      maps.status[statusKey]!.count++;
      maps.status[statusKey]!.pagu += pagu;
      maps.status[statusKey]!.realisasi += realisasi;

      // 2. Metode
      const metodeKey = item.mtd_pemilihan || 'Tidak Ditetapkan';
      if (!maps.metode[metodeKey]) maps.metode[metodeKey] = { count: 0, pagu: 0, realisasi: 0 };
      maps.metode[metodeKey]!.count++;
      maps.metode[metodeKey]!.pagu += pagu;
      maps.metode[metodeKey]!.realisasi += realisasi;

      // 3. Kategori
      const kategoriKey = item.kategori_pengadaan || 'Tidak Ditetapkan';
      if (!maps.kategori[kategoriKey]) maps.kategori[kategoriKey] = { count: 0, pagu: 0, realisasi: 0 };
      maps.kategori[kategoriKey]!.count++;
      maps.kategori[kategoriKey]!.pagu += pagu;
      maps.kategori[kategoriKey]!.realisasi += realisasi;

      // 4. Sumber Dana
      const sdKey = item.sumber_dana || 'Tidak Ditetapkan';
      if (!maps.sumberDana[sdKey]) maps.sumberDana[sdKey] = { count: 0, pagu: 0, realisasi: 0 };
      maps.sumberDana[sdKey]!.count++;
      maps.sumberDana[sdKey]!.pagu += pagu;
      maps.sumberDana[sdKey]!.realisasi += realisasi;

      // 5. Bukti Bayar
      const buktiKey = item.bukti_pembayaran || 'Tidak Ditetapkan';
      if (!maps.buktiBayar[buktiKey]) maps.buktiBayar[buktiKey] = { count: 0, pagu: 0, realisasi: 0 };
      maps.buktiBayar[buktiKey]!.count++;
      maps.buktiBayar[buktiKey]!.pagu += pagu;
      maps.buktiBayar[buktiKey]!.realisasi += realisasi;

      // 6. Satker
      const satkerKey = item.nama_satker || 'Tidak Ditetapkan';
      if (!maps.satker[satkerKey]) maps.satker[satkerKey] = { count: 0, pagu: 0, realisasi: 0 };
      maps.satker[satkerKey]!.count++;
      maps.satker[satkerKey]!.pagu += pagu;
      maps.satker[satkerKey]!.realisasi += realisasi;

      // 7. PPK
      const ppkKey = item.ppk_nama_lengkap || item.nama_ppk || 'Tidak Ditetapkan';
      if (!maps.ppk[ppkKey]) maps.ppk[ppkKey] = { count: 0, pagu: 0, realisasi: 0 };
      maps.ppk[ppkKey]!.count++;
      maps.ppk[ppkKey]!.pagu += pagu;
      maps.ppk[ppkKey]!.realisasi += realisasi;

      // 8. Deviasi (Realisasi vs Pagu)
      let devKey = 'Sesuai (Realisasi = Pagu)';
      if (realisasi > pagu) devKey = 'Overbudget (Realisasi > Pagu)';
      else if (realisasi < pagu) devKey = 'Underbudget (Realisasi < Pagu)';
      
      if (!maps.deviasi[devKey]) maps.deviasi[devKey] = { count: 0, pagu: 0, realisasi: 0 };
      maps.deviasi[devKey]!.count++;
      maps.deviasi[devKey]!.pagu += pagu;
      maps.deviasi[devKey]!.realisasi += realisasi;

      // 9. Penyedia UMKK (dari realisasi_list)
      if (item.realisasi_list && Array.isArray(item.realisasi_list)) {
        item.realisasi_list.forEach((real: any) => {
          if (real.penyedia_detail) {
            let umkkKey = 'Tidak Diketahui';
            if (real.penyedia_detail.status_umkk === 1) umkkKey = 'Usaha Mikro/Kecil';
            else if (real.penyedia_detail.status_umkk === 0) umkkKey = 'Non-UMKK';
            
            if (!maps.penyediaUmkk[umkkKey]) maps.penyediaUmkk[umkkKey] = { count: 0, pagu: 0, realisasi: 0 };
            maps.penyediaUmkk[umkkKey]!.count++;
            
            const nilaiReal = Number(real.nilai_realisasi) || 0;
            maps.penyediaUmkk[umkkKey]!.realisasi += nilaiReal;
            maps.penyediaUmkk[umkkKey]!.pagu += pagu / item.realisasi_list.length; // Distribusi pagu merata
          }
        });
      }
    }

    // Helper to sort objects into array
    const buildArray = (mapObj: SummaryMap, totalVal: number, useRealisasi = false) => {
      return Object.keys(mapObj).map(key => {
        const item = mapObj[key]!;
        const valToUse = useRealisasi ? item.realisasi : item.pagu;
        return {
          label: key,
          count: item.count,
          pagu: item.pagu,
          realisasi: item.realisasi,
          persentase: ((valToUse / (totalVal || 1)) * 100).toFixed(2) + '%'
        };
      }).sort((a, b) => (useRealisasi ? b.realisasi - a.realisasi : b.pagu - a.pagu));
    };

    return {
      success: true,
      summary: {
        totalItems,
        totalPagu,
        totalRealisasi,
        status: buildArray(maps.status, totalRealisasi, true),
        metode: buildArray(maps.metode, totalRealisasi, true),
        kategori: buildArray(maps.kategori, totalRealisasi, true),
        sumberDana: buildArray(maps.sumberDana, totalRealisasi, true),
        buktiBayar: buildArray(maps.buktiBayar, totalRealisasi, true),
        satker: buildArray(maps.satker, totalRealisasi, true).slice(0, 50),
        ppk: buildArray(maps.ppk, totalRealisasi, true).slice(0, 50),
        deviasi: buildArray(maps.deviasi, totalRealisasi, true),
        penyediaUmkk: buildArray(maps.penyediaUmkk, totalRealisasi, true)
      }
    };
  } catch (error: any) {
    console.error('Error di pencatatan-analytics-summary:', error);
    return { success: false, message: error.message };
  }
});
