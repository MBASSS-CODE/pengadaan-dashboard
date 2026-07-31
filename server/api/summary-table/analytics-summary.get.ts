import path from 'path';
import { readJsonSafe } from '../../utils/mergeManager';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const tahun = (query.tahun as string) || new Date().getFullYear().toString();

  try {
    const filePath = path.resolve(process.cwd(), 'server', 'data', 'merged', `rup-penyedia-enriched_${tahun}.json`);
    const data = await readJsonSafe(filePath);

    if (!data) {
      return {
        success: false,
        message: 'Data belum di-merge atau tidak tersedia.',
        summary: null
      };
    }

    // Define type for map entries
    type MapEntry = { count: number; pagu: number; _idx?: number };
    type SummaryMap = Record<string, MapEntry>;

    // Initialize maps
    const maps: {
      metode: SummaryMap;
      jenis: SummaryMap;
      status: SummaryMap;
      pdn: SummaryMap;
      ppk: SummaryMap;
      ukm: SummaryMap;
      sd: SummaryMap;
      tgl: SummaryMap;
      satker: SummaryMap;
      kajiUlang: SummaryMap;
      pengumuman: SummaryMap;
    } = {
      metode: {},
      jenis: {},
      status: {},
      pdn: { 'PDN': { count: 0, pagu: 0 }, 'Non-PDN': { count: 0, pagu: 0 } },
      ppk: {},
      ukm: {},
      sd: {},
      tgl: {},
      satker: {},
      kajiUlang: { 'Ada Kaji Ulang / Revisi': { count: 0, pagu: 0 }, 'Tanpa Revisi': { count: 0, pagu: 0 } },
      pengumuman: { 'Terumumkan': { count: 0, pagu: 0 }, 'Draft / Belum Diumumkan': { count: 0, pagu: 0 } }
    };

    let totalPagu = 0;
    let totalItems = data.length;
    let realisasiCount = 0;
    let ppkCount = 0;

    const bulanNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

    for (const item of data) {
      const pagu = Number(item.pagu) || 0;
      totalPagu += pagu;
      
      if (item._has_realisasi) realisasiCount++;
      if (item._ppk_completed) ppkCount++;

      // 1. Metode
      const m = item.metode_pengadaan || 'Tidak Ditetapkan';
      if (!maps.metode[m]) maps.metode[m] = { count: 0, pagu: 0 };
      maps.metode[m].count++;
      maps.metode[m].pagu += pagu;

      // 2. Jenis
      const j = item.jenis_pengadaan || 'Tidak Ditetapkan';
      if (!maps.jenis[j]) maps.jenis[j] = { count: 0, pagu: 0 };
      maps.jenis[j].count++;
      maps.jenis[j].pagu += pagu;

      // 3. Status Realisasi
      const s = item.realisasi_status || 'Belum/Tidak Ada';
      if (!maps.status[s]) maps.status[s] = { count: 0, pagu: 0 };
      maps.status[s].count++;
      maps.status[s].pagu += pagu;

      // 4. PDN
      const isPdn = item.is_pdn === true || String(item.is_pdn).toLowerCase() === 'true';
      const pdnKey = isPdn ? 'PDN' : 'Non-PDN';
      if (!maps.pdn[pdnKey]) maps.pdn[pdnKey] = { count: 0, pagu: 0 };
      maps.pdn[pdnKey].count++;
      maps.pdn[pdnKey].pagu += pagu;

      // 5. PPK
      const p = item.ppk_nama_lengkap || item.nama_ppk || 'Tidak Ada PPK';
      if (!maps.ppk[p]) maps.ppk[p] = { count: 0, pagu: 0 };
      maps.ppk[p].count++;
      maps.ppk[p].pagu += pagu;

      // 6. UKM
      const u = item.status_ukm || item.usaha_kecil || item.umkk || (item.is_ukm ? 'Usaha Kecil/Menengah' : 'Tidak Ditetapkan');
      if (!maps.ukm[u]) maps.ukm[u] = { count: 0, pagu: 0 };
      maps.ukm[u].count++;
      maps.ukm[u].pagu += pagu;

      // 7. Sumber Dana
      let sdList = item.sumber_dana_list || item.sumber_dana || 'Tidak Diketahui';
      let sources = [];
      if (Array.isArray(sdList)) {
        sources = sdList;
      } else if (typeof sdList === 'string') {
        sources = sdList.split(',').map(s => s.trim());
      } else {
        sources = [String(sdList)];
      }
      
      sources.forEach(sd => {
        if (!maps.sd[sd]) maps.sd[sd] = { count: 0, pagu: 0 };
        maps.sd[sd].count++;
        maps.sd[sd].pagu += pagu / sources.length; 
      });

      // 8. Tgl Pemilihan
      let bulanLabel = 'Tidak Ditetapkan';
      if (item.tgl_awal_pemilihan) {
        const d = new Date(item.tgl_awal_pemilihan);
        if (!isNaN(d.getTime())) {
          bulanLabel = bulanNames[d.getMonth()] || 'Tidak Ditetapkan';
        }
      }
      if (!maps.tgl[bulanLabel]) maps.tgl[bulanLabel] = { count: 0, pagu: 0, _idx: bulanNames.indexOf(bulanLabel) };
      maps.tgl[bulanLabel]!.count++;
      maps.tgl[bulanLabel]!.pagu += pagu;

      // 9. Satker
      const satker = item.nama_satker || 'Tidak Ada Satker';
      if (!maps.satker[satker]) maps.satker[satker] = { count: 0, pagu: 0 };
      maps.satker[satker].count++;
      maps.satker[satker].pagu += pagu;

      // 10. Kaji Ulang
      const isKaji = item._has_kaji_ulang || (item.kaji_ulang_count && item.kaji_ulang_count > 0);
      const kajiKey = isKaji ? 'Ada Kaji Ulang / Revisi' : 'Tanpa Revisi';
      maps.kajiUlang[kajiKey]!.count++;
      maps.kajiUlang[kajiKey]!.pagu += pagu;

      // 11. Pengumuman
      const isUmum = item.status_umumkan_rup === 'Sudah' || item.status_aktif_rup === 'Aktif';
      const umumKey = isUmum ? 'Terumumkan' : 'Draft / Belum Diumumkan';
      maps.pengumuman[umumKey]!.count++;
      maps.pengumuman[umumKey]!.pagu += pagu;
    }

    // Format output functions
    const buildArray = (mapObj: any) => {
      return Object.keys(mapObj).map(key => ({
        label: key,
        count: mapObj[key].count,
        pagu: mapObj[key].pagu,
        persentase: totalPagu > 0 ? ((mapObj[key].pagu / totalPagu) * 100).toFixed(2) + '%' : '0%'
      })).sort((a, b) => b.pagu - a.pagu); // Default sort by pagu descending
    };

    const tglArray = Object.keys(maps.tgl).map(key => ({
      label: key,
      count: maps.tgl[key]!.count,
      pagu: maps.tgl[key]!.pagu,
      persentase: totalPagu > 0 ? ((maps.tgl[key]!.pagu / totalPagu) * 100).toFixed(2) + '%' : '0%',
      _idx: maps.tgl[key]!._idx
    })).sort((a, b) => {
      const idxA = a._idx ?? -1;
      const idxB = b._idx ?? -1;
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });

    return {
      success: true,
      summary: {
        totalItems,
        totalPagu,
        realisasiCount,
        ppkCount,
        metode: buildArray(maps.metode),
        jenis: buildArray(maps.jenis),
        status: buildArray(maps.status),
        pdn: buildArray(maps.pdn),
        ppk: buildArray(maps.ppk),
        ukm: buildArray(maps.ukm),
        sd: buildArray(maps.sd),
        tgl: tglArray,
        satker: buildArray(maps.satker),
        kajiUlang: buildArray(maps.kajiUlang),
        pengumuman: buildArray(maps.pengumuman)
      }
    };

  } catch (error) {
    console.error('Error in analytics summary:', error);
    return {
      success: false,
      message: 'Gagal memproses data agregasi',
      summary: null
    };
  }
});
