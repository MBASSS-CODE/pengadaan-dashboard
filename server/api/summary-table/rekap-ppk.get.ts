import { getRekapPpkMergedData } from '../../utils/mergeManager';
import { aggregatePpkMetrics, type PpkPacketDetail, type PpkRupDetail } from '../../utils/rekapPpkMerge';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const tahun = String(query.tahun || new Date().getFullYear());
  const filterType = String(query.filterType || 'semua'); // 'semua' | 'tanggal' | 'triwulan'
  const startDate = String(query.startDate || '');
  const endDate = String(query.endDate || '');
  const selectedQuarter = String(query.selectedQuarter || 'TW 1');
  const page = Math.max(1, parseInt(String(query.page || '1'), 10) || 1);
  const limit = Math.max(1, parseInt(String(query.limit || '10'), 10) || 10);

  const sumberTransaksiParam = String(query.sumberTransaksi || '');
  const metodePengadaanParam = String(query.metodePengadaan || '');
  const jenisPengadaanParam = String(query.jenisPengadaan || '');
  const sumberDanaParam = String(query.sumberDana || '');
  const tahapanPengadaanParam = String(query.tahapanPengadaan || '');
  const ppkParam = String(query.ppk || '');
  const statusPpkParam = String(query.statusPpk || '');
  const unitKerjaParam = String(query.unitKerja || '');
  const search = String(query.search || '').trim().toLowerCase();

  const tahapanLabelMap: Record<string, string> = {
    pemilihan_berlangsung: 'Pemilihan Berlangsung',
    pemilihan_selesai: 'Pemilihan Selesai',
    kontrak: 'Kontrak',
    selesai: 'Selesai'
  };

  try {
    const rawData: any[] = await getRekapPpkMergedData(tahun);

    // Collect available filter options across unfiltered dataset
    const sumberSet = new Set<string>();
    const metodeSet = new Set<string>();
    const jenisSet = new Set<string>();
    const sumberDanaSet = new Set<string>();
    const tahapanSet = new Set<string>();
    const unitKerjaSet = new Set<string>();
    const ppkNameSet = new Set<string>();

    for (const ppk of rawData) {
      if (ppk.nama) ppkNameSet.add(ppk.nama);
      if (ppk.unit_kerja) unitKerjaSet.add(ppk.unit_kerja);
      const pkts: PpkPacketDetail[] = Array.isArray(ppk.detail_paket_list) ? ppk.detail_paket_list : [];
      for (const pkt of pkts) {
        if (pkt.sumber_transaksi) sumberSet.add(pkt.sumber_transaksi);
        if (pkt.metode_pengadaan && pkt.metode_pengadaan !== '-') metodeSet.add(pkt.metode_pengadaan);
        if (pkt.jenis_pengadaan && pkt.jenis_pengadaan !== '-') jenisSet.add(pkt.jenis_pengadaan);
        if (pkt.sumber_dana && pkt.sumber_dana !== '-') sumberDanaSet.add(pkt.sumber_dana);
        if (pkt.tahapan_rekap) tahapanSet.add(tahapanLabelMap[pkt.tahapan_rekap] || pkt.tahapan_rekap);
      }
    }

    const splitParam = (val: string) =>
      val && val !== 'ALL' ? val.split(',').map((s) => s.trim()).filter(Boolean) : [];

    const selectedSumberList = splitParam(sumberTransaksiParam);
    const selectedMetodeList = splitParam(metodePengadaanParam);
    const selectedJenisList = splitParam(jenisPengadaanParam);
    const selectedSumberDanaList = splitParam(sumberDanaParam);
    const selectedTahapanList = splitParam(tahapanPengadaanParam);
    const selectedPpkList = splitParam(ppkParam);
    const selectedStatusPpkList = splitParam(statusPpkParam);

    const hasDateFilter = filterType === 'tanggal' && Boolean(startDate || endDate);
    const hasQuarterFilter = filterType === 'triwulan' && Boolean(selectedQuarter);
    const hasPacketFilter =
      selectedSumberList.length > 0 ||
      selectedMetodeList.length > 0 ||
      selectedJenisList.length > 0 ||
      selectedSumberDanaList.length > 0 ||
      selectedTahapanList.length > 0 ||
      hasDateFilter ||
      hasQuarterFilter;

    let startMs = 0;
    let endMs = Number.MAX_SAFE_INTEGER;

    if (hasDateFilter) {
      if (startDate) {
        const d = new Date(`${startDate}T00:00:00`);
        if (!Number.isNaN(d.getTime())) startMs = d.getTime();
      }
      if (endDate) {
        const d = new Date(`${endDate}T23:59:59.999`);
        if (!Number.isNaN(d.getTime())) endMs = d.getTime();
      }
    } else if (hasQuarterFilter) {
      const yr = Number(tahun) || new Date().getFullYear();
      const qBounds: Record<string, [number, number]> = {
        'TW 1': [0, 2],
        'TW 2': [3, 5],
        'TW 3': [6, 8],
        'TW 4': [9, 11],
        Q1: [0, 2],
        Q2: [3, 5],
        Q3: [6, 8],
        Q4: [9, 11]
      };
      const [mStart, mEnd] = qBounds[selectedQuarter] || [0, 11];
      startMs = new Date(yr, mStart, 1, 0, 0, 0, 0).getTime();
      endMs = new Date(yr, mEnd + 1, 0, 23, 59, 59, 999).getTime();
    }

    let processed = rawData;

    if (hasPacketFilter) {
      processed = rawData.map((ppk) => {
        const rupList: PpkRupDetail[] = Array.isArray(ppk.detail_rup_list) ? ppk.detail_rup_list : [];
        const allPackets: PpkPacketDetail[] = Array.isArray(ppk.detail_paket_list) ? ppk.detail_paket_list : [];

        const filteredPackets = allPackets.filter((pkt) => {
          if (selectedSumberList.length > 0 && !selectedSumberList.includes(pkt.sumber_transaksi)) {
            return false;
          }
          if (selectedMetodeList.length > 0 && !selectedMetodeList.includes(pkt.metode_pengadaan)) {
            return false;
          }
          if (selectedJenisList.length > 0 && !selectedJenisList.includes(pkt.jenis_pengadaan)) {
            return false;
          }
          if (selectedSumberDanaList.length > 0 && !selectedSumberDanaList.includes(pkt.sumber_dana)) {
            return false;
          }
          if (selectedTahapanList.length > 0) {
            const label = tahapanLabelMap[pkt.tahapan_rekap] || pkt.tahapan_rekap;
            if (!selectedTahapanList.includes(label) && !selectedTahapanList.includes(pkt.tahapan_rekap)) {
              return false;
            }
          }
          if (hasDateFilter || hasQuarterFilter) {
            if (!pkt._sort_date || pkt._sort_date <= 0) return false;
            if (pkt._sort_date < startMs || pkt._sort_date > endMs) return false;
          }
          return true;
        });

        const rupLookupMap = new Map<string, PpkRupDetail>();
        for (const r of rupList) {
          rupLookupMap.set(r.kd_rup, r);
        }

        return aggregatePpkMetrics(ppk, rupList, filteredPackets, rupLookupMap);
      });
    }

    // Apply PPK-level filters
    const filteredData = processed
      .filter((ppk) => {
        if (hasPacketFilter && ppk.total_kode_paket === 0 && ppk.ppk_key === 'UNASSIGNED') {
          return false;
        }
        if (unitKerjaParam && unitKerjaParam !== 'ALL' && ppk.unit_kerja !== unitKerjaParam) {
          return false;
        }
        if (selectedPpkList.length > 0 && !selectedPpkList.includes(ppk.nama)) {
          return false;
        }
        if (selectedStatusPpkList.length > 0) {
          const statusLabel = ppk.is_ppk_completed
            ? 'Terpetakan'
            : ppk.ppk_key === 'UNASSIGNED'
              ? 'Tanpa Atribut PPK'
              : 'Belum Mapping';
          const legacyCode = ppk.is_ppk_completed ? 'completed' : 'incomplete';
          if (!selectedStatusPpkList.includes(statusLabel) && !selectedStatusPpkList.includes(legacyCode)) {
            return false;
          }
        }
        if (search) {
          const haystack = [
            ppk.nama,
            ppk.nip_asli,
            ppk.nip_nama_masked,
            ppk.jabatan,
            ppk.unit_kerja,
            ppk.nama_satuan_kerja,
            ppk.list_kode_rup,
            ppk.list_kode_paket
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          if (!haystack.includes(search)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if ((b.total_nilai_realisasi || 0) !== (a.total_nilai_realisasi || 0)) {
          return (b.total_nilai_realisasi || 0) - (a.total_nilai_realisasi || 0);
        }
        return (b.total_rup_terumumkan_nilai || 0) - (a.total_rup_terumumkan_nilai || 0);
      });

    // Compute overall KPI summary across all filtered PPKs
    const summary = filteredData.reduce(
      (acc, ppk) => {
        acc.totalPpk += 1;
        if (ppk.is_ppk_completed) acc.ppkCompleted += 1;
        else if (ppk.ppk_key === 'UNASSIGNED') acc.ppkUnassigned += 1;
        else acc.ppkIncomplete += 1;
        acc.totalRupTerumumkanPaket += Number(ppk.total_rup_terumumkan_paket) || 0;
        acc.totalRupTerumumkanNilai += Number(ppk.total_rup_terumumkan_nilai) || 0;
        acc.totalRupTerealisasiPaket += Number(ppk.paket_rup) || 0;
        acc.totalRupTerealisasiNilai += Number(ppk.nilai_rup) || 0;
        acc.totalRupBelumJalanPaket += Number(ppk.rup_belum_jalan_paket) || 0;
        acc.totalRupBelumJalanNilai += Number(ppk.rup_belum_jalan_nilai) || 0;
        acc.totalKodePaket += Number(ppk.total_kode_paket) || 0;
        acc.paketPemilihanBerlangsung += Number(ppk.paket_pemilihan_berlangsung) || 0;
        acc.nilaiPemilihanBerlangsung += Number(ppk.nilai_pemilihan_berlangsung) || 0;
        acc.paketPemilihanSelesai += Number(ppk.paket_pemilihan_selesai) || 0;
        acc.nilaiPemilihanSelesai += Number(ppk.nilai_pemilihan_selesai) || 0;
        acc.paketKontrak += Number(ppk.paket_kontrak) || 0;
        acc.nilaiKontrak += Number(ppk.nilai_kontrak) || 0;
        acc.paketSelesai += Number(ppk.paket_selesai) || 0;
        acc.nilaiSelesai += Number(ppk.nilai_selesai) || 0;
        acc.totalNilaiRealisasi += Number(ppk.total_nilai_realisasi) || 0;
        acc.totalNilaiTransaksi += Number(ppk.total_nilai_transaksi) || 0;
        acc.totalNilaiPdn += Number(ppk.nilai_pdn) || 0;
        acc.totalNilaiUmk += Number(ppk.nilai_umk) || 0;
        return acc;
      },
      {
        totalPpk: 0,
        ppkCompleted: 0,
        ppkIncomplete: 0,
        ppkUnassigned: 0,
        totalRupTerumumkanPaket: 0,
        totalRupTerumumkanNilai: 0,
        totalRupTerealisasiPaket: 0,
        totalRupTerealisasiNilai: 0,
        totalRupBelumJalanPaket: 0,
        totalRupBelumJalanNilai: 0,
        totalKodePaket: 0,
        paketPemilihanBerlangsung: 0,
        nilaiPemilihanBerlangsung: 0,
        paketPemilihanSelesai: 0,
        nilaiPemilihanSelesai: 0,
        paketKontrak: 0,
        nilaiKontrak: 0,
        paketSelesai: 0,
        nilaiSelesai: 0,
        totalNilaiRealisasi: 0,
        totalNilaiTransaksi: 0,
        totalNilaiPdn: 0,
        totalNilaiUmk: 0,
        persentaseSerapan: 0,
        persentasePdn: 0,
        persentaseUmk: 0
      }
    );

    summary.persentaseSerapan =
      summary.totalRupTerumumkanNilai > 0
        ? Math.round((summary.totalNilaiRealisasi / summary.totalRupTerumumkanNilai) * 1000) / 10
        : 0;
    summary.persentasePdn =
      summary.totalNilaiRealisasi > 0
        ? Math.round((summary.totalNilaiPdn / summary.totalNilaiRealisasi) * 1000) / 10
        : 0;
    summary.persentaseUmk =
      summary.totalNilaiRealisasi > 0
        ? Math.round((summary.totalNilaiUmk / summary.totalNilaiRealisasi) * 1000) / 10
        : 0;

    const totalItems = filteredData.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const safePage = Math.min(page, totalPages);
    const startIdx = (safePage - 1) * limit;
    const paginatedData = filteredData.slice(startIdx, startIdx + limit);

    return {
      success: true,
      data: paginatedData,
      summary,
      meta: {
        totalItems,
        totalPages,
        currentPage: safePage
      },
      filterOptions: {
        sumberTransaksi: Array.from(sumberSet).sort(),
        metodePengadaan: Array.from(metodeSet).sort(),
        jenisPengadaan: Array.from(jenisSet).sort(),
        sumberDana: Array.from(sumberDanaSet).sort(),
        tahapanPengadaan: ['Pemilihan Berlangsung', 'Pemilihan Selesai', 'Kontrak', 'Selesai'].filter((t) =>
          tahapanSet.has(t)
        ),
        ppk: Array.from(ppkNameSet).sort(),
        unitKerja: Array.from(unitKerjaSet).sort()
      }
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Gagal memuat data Rekap PPK',
      data: [],
      summary: null,
      meta: { totalItems: 0, totalPages: 1, currentPage: 1 },
      filterOptions: {
        sumberTransaksi: [],
        metodePengadaan: [],
        jenisPengadaan: [],
        sumberDana: [],
        tahapanPengadaan: [],
        ppk: [],
        unitKerja: []
      }
    };
  }
});
