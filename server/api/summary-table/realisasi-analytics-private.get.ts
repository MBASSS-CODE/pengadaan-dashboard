import {
  getRealisasiMasterData,
  getRealisasiOfficialSummary,
  getRealisasiPenyediaPerSumber
} from '../../utils/realisasiMasterMerge';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const tahun = (query.tahun as string) || new Date().getFullYear().toString();

  try {
    const [unifiedData, officialSummary, penyediaPerSumberRaw] = await Promise.all([
      getRealisasiMasterData(tahun),
      getRealisasiOfficialSummary(tahun),
      getRealisasiPenyediaPerSumber(tahun)
    ]);

    if (!unifiedData || unifiedData.length === 0) {
      return {
        success: true,
        summary: {
          totalPesanan: 0,
          totalNilai: 0,
          totalPagu: 0,
          totalPdn: 0,
          totalUmk: 0,
          paketPdnCount: 0,
          paketUmkCount: 0,
          persentaseTerhadapPagu: 0,
          selisihPaguRealisasi: 0,
          officialSummary,
          enrichmentStats: {
            txMatchedCount: 0,
            rupMatchedCount: 0,
            uniqueRupCount: 0,
            kajiUlangPaketCount: 0,
            totalKajiUlangCount: 0,
            anggaranMatchedCount: 0,
            uniqueMakCount: 0,
            ppkCompletedCount: 0,
            uniquePpkCount: 0,
            penyediaCompletedCount: 0,
            uniquePenyediaCount: 0,
            sppCount: 0
          },
          trend: [],
          sumberTransaksi: [],
          metodePengadaan: [],
          jenisPengadaan: [],
          sumberDana: [],
          tahapanPengadaan: [],
          statusPaket: [],
          penyediaPerSumber: penyediaPerSumberRaw || [],
          topPpk: [],
          topPenyedia: []
        }
      };
    }

    let filteredData = [...unifiedData];
    let hasDateFilter = false;

    if (query.filterType === 'tanggal' && query.startDate && query.endDate) {
      hasDateFilter = true;
      const start = new Date(query.startDate as string);
      start.setHours(0, 0, 0, 0);
      const startMs = start.getTime();

      const end = new Date(query.endDate as string);
      end.setHours(23, 59, 59, 999);
      const endMs = end.getTime();

      filteredData = filteredData.filter(item => {
        if (!item._sort_date) return false;
        return item._sort_date >= startMs && item._sort_date <= endMs;
      });
    } else if (query.filterType === 'triwulan' && query.selectedQuarter) {
      hasDateFilter = true;
      const q = query.selectedQuarter as string;
      const quarterMap: Record<string, number[]> = {
        'TW 1': [0, 1, 2],
        'TW 2': [3, 4, 5],
        'TW 3': [6, 7, 8],
        'TW 4': [9, 10, 11]
      };
      const validMonths = quarterMap[q] || [];
      if (validMonths.length > 0) {
        filteredData = filteredData.filter(item => {
          if (!item._sort_date) return false;
          const d = new Date(item._sort_date);
          return validMonths.includes(d.getMonth());
        });
      }
    }

    let totalPesanan = 0;
    let totalNilai = 0;
    let totalPagu = 0;
    let totalPdn = 0;
    let totalUmk = 0;
    let paketPdnCount = 0;
    let paketUmkCount = 0;

    let txMatchedCount = 0;
    let rupMatchedCount = 0;
    let kajiUlangPaketCount = 0;
    let totalKajiUlangCount = 0;
    let anggaranMatchedCount = 0;
    let ppkCompletedCount = 0;
    let penyediaCompletedCount = 0;
    let sppCount = 0;

    const uniqueRupSet = new Set<string>();
    const uniqueMakSet = new Set<string>();
    const uniquePpkSet = new Set<string>();
    const uniquePenyediaSet = new Set<string>();

    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const trendMap = new Map<string, { total: number; count: number }>();
    monthNames.forEach(m => trendMap.set(m, { total: 0, count: 0 }));

    const sumberTransaksiMap = new Map<string, { total: number; pagu: number; pdn: number; umk: number; count: number }>();
    const metodeMap = new Map<string, { total: number; count: number }>();
    const jenisMap = new Map<string, { total: number; count: number }>();
    const sumberDanaMap = new Map<string, { total: number; count: number }>();
    const tahapanMap = new Map<string, { total: number; count: number }>();
    const statusMap = new Map<string, { total: number; count: number }>();
    const ppkMap = new Map<string, { total: number; pagu: number; pdn: number; umk: number; count: number; jabatan: string; unit_kerja: string }>();
    const penyediaMap = new Map<string, { total: number; pagu: number; pdn: number; umk: number; count: number; status_umkk: any; jenis_perusahaan: string }>();

    const addSimpleGroup = (
      mapObj: Map<string, { total: number; count: number }>,
      key: string | undefined,
      val: number
    ) => {
      const k = key && key.trim() ? key.trim() : 'Tidak Diketahui';
      const cur = mapObj.get(k) || { total: 0, count: 0 };
      cur.total += val;
      cur.count += 1;
      mapObj.set(k, cur);
    };

    for (const item of filteredData) {
      totalPesanan++;
      const valNilai = Number(item.total_nilai) || 0;
      const valPagu = Number(item.nilai_pagu) || 0;
      const valPdn = Number(item.nilai_pdn) || 0;
      const valUmk = Number(item.nilai_umk) || 0;

      totalNilai += valNilai;
      totalPagu += valPagu;
      totalPdn += valPdn;
      totalUmk += valUmk;
      if (valPdn > 0) paketPdnCount++;
      if (valUmk > 0) paketUmkCount++;

      // Enrichment counters
      if (item._tx_matched) txMatchedCount++;
      if (item._rup_matched) rupMatchedCount++;
      if (item.kode_rup) uniqueRupSet.add(String(item.kode_rup));
      if (item._has_kaji_ulang) {
        kajiUlangPaketCount++;
        totalKajiUlangCount += Number(item.kaji_ulang_count) || 0;
      }
      if (item._has_anggaran) anggaranMatchedCount++;
      if (Array.isArray(item.mak_list)) {
        item.mak_list.forEach((m: string) => {
          if (m) uniqueMakSet.add(m);
        });
      }
      if (item._ppk_completed) ppkCompletedCount++;
      if (item._penyedia_completed) penyediaCompletedCount++;
      if (item.rup_spp_lingkungan || item.rup_spp_sosial || item.rup_spp_ekonomi) {
        sppCount++;
      }

      if (item._sort_date) {
        const d = new Date(item._sort_date);
        if (!isNaN(d.getTime())) {
          const monthName = monthNames[d.getMonth()];
          const tEntry = trendMap.get(monthName)!;
          tEntry.total += valNilai;
          tEntry.count += 1;
        }
      }

      // Sumber transaksi (rich breakdown)
      const sKey = item.sumber_transaksi || 'Tidak Diketahui';
      const sCur = sumberTransaksiMap.get(sKey) || { total: 0, pagu: 0, pdn: 0, umk: 0, count: 0 };
      sCur.total += valNilai;
      sCur.pagu += valPagu;
      sCur.pdn += valPdn;
      sCur.umk += valUmk;
      sCur.count += 1;
      sumberTransaksiMap.set(sKey, sCur);

      addSimpleGroup(metodeMap, item.metode_pengadaan, valNilai);
      addSimpleGroup(jenisMap, item.jenis_pengadaan_enriched || item.jenis_pengadaan || 'Belum Terklasifikasi', valNilai);
      addSimpleGroup(sumberDanaMap, item.sumber_dana, valNilai);
      addSimpleGroup(tahapanMap, item.tahapan_pengadaan, valNilai);
      addSimpleGroup(statusMap, item.status_paket, valNilai);

      if (item.nama_ppk && item.nama_ppk !== '-') {
        uniquePpkSet.add(item.nama_ppk);
        const cur = ppkMap.get(item.nama_ppk) || {
          total: 0,
          pagu: 0,
          pdn: 0,
          umk: 0,
          count: 0,
          jabatan: item.ppk_jabatan || '',
          unit_kerja: item.ppk_unit_kerja || ''
        };
        cur.total += valNilai;
        cur.pagu += valPagu;
        cur.pdn += valPdn;
        cur.umk += valUmk;
        cur.count += 1;
        if (!cur.jabatan && item.ppk_jabatan) cur.jabatan = item.ppk_jabatan;
        if (!cur.unit_kerja && item.ppk_unit_kerja) cur.unit_kerja = item.ppk_unit_kerja;
        ppkMap.set(item.nama_ppk, cur);
      }

      if (item.nama_penyedia && item.nama_penyedia !== '-' && item.nama_penyedia !== 'SWAKELOLA') {
        uniquePenyediaSet.add(item.nama_penyedia);
        const cur = penyediaMap.get(item.nama_penyedia) || {
          total: 0,
          pagu: 0,
          pdn: 0,
          umk: 0,
          count: 0,
          status_umkk: item.penyedia_status_umkk ?? null,
          jenis_perusahaan: item.penyedia_jenis_perusahaan || ''
        };
        cur.total += valNilai;
        cur.pagu += valPagu;
        cur.pdn += valPdn;
        cur.umk += valUmk;
        cur.count += 1;
        if (!cur.status_umkk && item.penyedia_status_umkk) cur.status_umkk = item.penyedia_status_umkk;
        if (!cur.jenis_perusahaan && item.penyedia_jenis_perusahaan) cur.jenis_perusahaan = item.penyedia_jenis_perusahaan;
        penyediaMap.set(item.nama_penyedia, cur);
      }
    }

    const effectiveTotalPesanan = !hasDateFilter && officialSummary?.jumlah_paket
      ? officialSummary.jumlah_paket
      : totalPesanan;
    const effectiveTotalNilai = !hasDateFilter && officialSummary?.total_nilai
      ? officialSummary.total_nilai
      : totalNilai;

    const persentaseTerhadapPagu = totalPagu > 0
      ? Math.round((effectiveTotalNilai / totalPagu) * 1000) / 10
      : 0;
    const selisihPaguRealisasi = totalPagu > 0 ? totalPagu - effectiveTotalNilai : 0;

    // Enrich penyedia/per-sumber with realisasi total from filtered data
    const normalizeSumberName = (s: string) => {
      const lower = s.toLowerCase();
      if (lower.includes('katalog') && lower.includes('6')) return 'E-Katalog Versi 6.0';
      if (lower.includes('katalog') && lower.includes('5')) return 'E-Katalog Versi 5.0';
      if (lower.includes('pencatatan') && !lower.includes('swakelola')) return 'Pencatatan Non Tender';
      if (lower.includes('swakelola')) return 'Pencatatan Swakelola';
      if (lower.includes('non tender')) return 'Non Tender';
      if (lower === 'tender') return 'Tender';
      return s;
    };

    const penyediaPerSumber = penyediaPerSumberRaw.map((row) => {
      const mappedKey = normalizeSumberName(row.sumber_transaksi);
      const stats = sumberTransaksiMap.get(mappedKey);
      return {
        sumber_transaksi: row.sumber_transaksi,
        mapped_sumber: mappedKey,
        jumlah_penyedia: row.jumlah_penyedia,
        jumlah_paket: row.jumlah_paket,
        total_nilai: stats?.total || 0,
        total_pagu: stats?.pagu || 0
      };
    });

    const formatSimpleResult = (mapObj: Map<string, { total: number; count: number }>) =>
      Array.from(mapObj.entries())
        .map(([label, val]) => ({ label, total: val.total, count: val.count }))
        .sort((a, b) => b.total - a.total);

    return {
      success: true,
      summary: {
        totalPesanan: effectiveTotalPesanan,
        totalNilai: effectiveTotalNilai,
        totalPagu,
        totalPdn,
        totalUmk,
        paketPdnCount,
        paketUmkCount,
        persentaseTerhadapPagu,
        selisihPaguRealisasi,
        officialSummary,
        enrichmentStats: {
          txMatchedCount,
          rupMatchedCount,
          uniqueRupCount: uniqueRupSet.size,
          kajiUlangPaketCount,
          totalKajiUlangCount,
          anggaranMatchedCount,
          uniqueMakCount: uniqueMakSet.size,
          ppkCompletedCount,
          uniquePpkCount: uniquePpkSet.size,
          penyediaCompletedCount,
          uniquePenyediaCount: uniquePenyediaSet.size,
          sppCount
        },
        trend: Array.from(trendMap.entries()).map(([label, val]) => ({
          label,
          total: val.total,
          count: val.count
        })),
        sumberTransaksi: Array.from(sumberTransaksiMap.entries())
          .map(([label, val]) => ({ label, ...val }))
          .sort((a, b) => b.total - a.total),
        metodePengadaan: formatSimpleResult(metodeMap),
        jenisPengadaan: formatSimpleResult(jenisMap),
        sumberDana: formatSimpleResult(sumberDanaMap),
        tahapanPengadaan: formatSimpleResult(tahapanMap),
        statusPaket: formatSimpleResult(statusMap),
        penyediaPerSumber,
        topPpk: Array.from(ppkMap.entries())
          .map(([label, val]) => ({ label, ...val }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 10),
        topPenyedia: Array.from(penyediaMap.entries())
          .map(([label, val]) => ({ label, ...val }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 10)
      }
    };
  } catch (error: any) {
    console.error('API analytics realisasi error:', error);
    return {
      success: false,
      message: error.message || 'Terjadi kesalahan'
    };
  }
});
