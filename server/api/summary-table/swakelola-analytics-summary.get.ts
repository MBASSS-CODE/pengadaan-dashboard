import path from 'path';
import { readJsonSafe } from '../../utils/mergeManager';

type MapEntry = { count: number, pagu: number, realisasi: number };
type SummaryMap = Record<string, MapEntry>;

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const tahun = (query.tahun as string) || new Date().getFullYear().toString();

  try {
    const filePath = path.resolve(process.cwd(), 'server', 'data', 'merged', `pencatatan-swakelola-enriched_${tahun}.json`);
    const data = await readJsonSafe(filePath);

    if (!data || !Array.isArray(data)) {
      return { success: false, message: 'Data pencatatan swakelola tidak ditemukan', summary: null };
    }

    let totalItems = 0;
    let totalPagu = 0;
    let totalRealisasi = 0;

    const maps = {
      status: {} as SummaryMap,
      tipe: {} as SummaryMap,
      sumberDana: {} as SummaryMap,
      satker: {} as SummaryMap,
      ppk: {} as SummaryMap,
      deviasi: {} as SummaryMap, // Overbudget, Underbudget, Sesuai
    };

    for (const item of data) {
      totalItems++;
      const pagu = item.pagu || 0;
      const realisasi = item.total_realisasi || 0;
      totalPagu += pagu;
      totalRealisasi += realisasi;

      // 1. Status
      const statusKey = item.status_swakelola_pct_ket || item.status_swakelola_pct || 'Unknown';
      if (!maps.status[statusKey]) maps.status[statusKey] = { count: 0, pagu: 0, realisasi: 0 };
      maps.status[statusKey]!.count++;
      maps.status[statusKey]!.pagu += pagu;
      maps.status[statusKey]!.realisasi += realisasi;

      // 2. Tipe Swakelola
      const tipeKey = item.tipe_swakelola_nama || `Tipe ${item.tipe_swakelola}` || 'Tidak Ditetapkan';
      if (!maps.tipe[tipeKey]) maps.tipe[tipeKey] = { count: 0, pagu: 0, realisasi: 0 };
      maps.tipe[tipeKey]!.count++;
      maps.tipe[tipeKey]!.pagu += pagu;
      maps.tipe[tipeKey]!.realisasi += realisasi;

      // 3. Sumber Dana
      const sdKey = item.sumber_dana || 'Tidak Ditetapkan';
      if (!maps.sumberDana[sdKey]) maps.sumberDana[sdKey] = { count: 0, pagu: 0, realisasi: 0 };
      maps.sumberDana[sdKey]!.count++;
      maps.sumberDana[sdKey]!.pagu += pagu;
      maps.sumberDana[sdKey]!.realisasi += realisasi;

      // 4. Satker
      const satkerKey = item.nama_satker || 'Tidak Ditetapkan';
      if (!maps.satker[satkerKey]) maps.satker[satkerKey] = { count: 0, pagu: 0, realisasi: 0 };
      maps.satker[satkerKey]!.count++;
      maps.satker[satkerKey]!.pagu += pagu;
      maps.satker[satkerKey]!.realisasi += realisasi;

      // 5. PPK
      const ppkKey = item.ppk_nama_lengkap || item.nama_ppk || 'Tidak Ditetapkan';
      if (!maps.ppk[ppkKey]) maps.ppk[ppkKey] = { count: 0, pagu: 0, realisasi: 0 };
      maps.ppk[ppkKey]!.count++;
      maps.ppk[ppkKey]!.pagu += pagu;
      maps.ppk[ppkKey]!.realisasi += realisasi;

      // 6. Deviasi (Realisasi vs Pagu)
      let devKey = 'Sesuai (Realisasi = Pagu)';
      if (realisasi > pagu) devKey = 'Overbudget (Realisasi > Pagu)';
      else if (realisasi < pagu) devKey = 'Underbudget (Realisasi < Pagu)';
      
      if (!maps.deviasi[devKey]) maps.deviasi[devKey] = { count: 0, pagu: 0, realisasi: 0 };
      maps.deviasi[devKey]!.count++;
      maps.deviasi[devKey]!.pagu += pagu;
      maps.deviasi[devKey]!.realisasi += realisasi;
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
        tipe: buildArray(maps.tipe, totalRealisasi, true),
        sumberDana: buildArray(maps.sumberDana, totalRealisasi, true),
        satker: buildArray(maps.satker, totalRealisasi, true).slice(0, 50),
        ppk: buildArray(maps.ppk, totalRealisasi, true).slice(0, 50),
        deviasi: buildArray(maps.deviasi, totalRealisasi, true)
      }
    };
  } catch (error: any) {
    console.error('Error di swakelola-analytics-summary:', error);
    return { success: false, message: error.message };
  }
});
