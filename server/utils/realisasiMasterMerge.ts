import fs from 'fs/promises';
import path from 'path';
import { getDataDir } from './dataDir';
import { loadPpkMaster } from './ppkManager';
import { loadPenyediaMaster } from './penyediaManager';

const normalizeText = (val?: any): string => {
  if (val === null || val === undefined) return '';
  return String(val).replace(/\s+/g, ' ').trim();
};

const normalizeNameKey = (val?: any): string => {
  return normalizeText(val)
    .toLowerCase()
    .replace(/[.,'"`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const cleanNpwp = (val?: any): string => {
  if (!val) return '';
  return String(val).replace(/[^a-zA-Z0-9]/g, '');
};

const parseTimestamp = (val?: any): number => {
  if (!val) return 0;
  const ms = new Date(val).getTime();
  return Number.isFinite(ms) ? ms : 0;
};

const parseDetailLokasi = (raw: any): string => {
  if (!raw) return '';
  let arr = raw;
  if (typeof raw === 'string') {
    try {
      arr = JSON.parse(raw);
    } catch {
      return raw;
    }
  }
  if (Array.isArray(arr)) {
    return arr
      .map((loc: any) =>
        [loc.detil_lokasi || loc.lokasi, loc.kbp_nama, loc.prp_nama].filter(Boolean).join(', ')
      )
      .filter(Boolean)
      .join(' | ');
  }
  return typeof raw === 'string' ? raw : '';
};

export const readJsonSafe = async (filePath: string): Promise<any> => {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw) ?? [];
  } catch {
    return [];
  }
};

const unwrapArray = (raw: any): any[] => {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.data)) return raw.data;
  return [];
};

export const getRealisasiOfficialSummary = async (
  tahun: string
): Promise<{ jumlah_paket: number; total_nilai: number } | null> => {
  const dataDir = getDataDir();
  const summaryPath = path.join(dataDir, 'dashboard', 'realisasi', `summary_${tahun}.json`);
  const raw = unwrapArray(await readJsonSafe(summaryPath));
  if (raw.length > 0 && raw[0] && typeof raw[0] === 'object') {
    return {
      jumlah_paket: Number(raw[0].jumlah_paket) || 0,
      total_nilai: Number(raw[0].total_nilai) || 0
    };
  }
  return null;
};

export const getRealisasiPenyediaPerSumber = async (
  tahun: string
): Promise<Array<{ sumber_transaksi: string; jumlah_penyedia: number; jumlah_paket: number }>> => {
  const dataDir = getDataDir();
  const filePath = path.join(dataDir, 'dashboard', 'realisasi', 'penyedia', `per-sumber_${tahun}.json`);
  const raw = unwrapArray(await readJsonSafe(filePath));
  return raw.map((r: any) => ({
    sumber_transaksi: String(r.sumber_transaksi || '-'),
    jumlah_penyedia: Number(r.jumlah_penyedia) || 0,
    jumlah_paket: Number(r.jumlah_paket) || 0
  }));
};

export const checkRealisasiMasterPrerequisites = async (tahun: string) => {
  const dataDir = getDataDir();
  const specs = [
    { group: 'dashboard', endpoint: 'realisasi/table', label: 'Dashboard Realisasi Table (Acuan Utama)', required: true },
    { group: 'dashboard', endpoint: 'realisasi/summary', label: 'Dashboard Realisasi Summary (Acuan Total)', required: true },
    { group: 'dashboard', endpoint: 'realisasi/penyedia/per-sumber', label: 'Realisasi Penyedia Per Sumber', required: false },
    { group: 'ekatalog', endpoint: 'paket-e-purchasing', label: 'E-Purchasing V6 (Pengayaan)', required: false },
    { group: 'ekatalog-archive', endpoint: 'paket-e-purchasing', label: 'E-Purchasing Archive V5 (Pengayaan)', required: false },
    { group: 'tender', endpoint: 'pencatatan-non-tender', label: 'Pencatatan Non-Tender (Pengayaan)', required: false },
    { group: 'tender', endpoint: 'pencatatan-non-tender-realisasi', label: 'Realisasi Pencatatan Non-Tender', required: false },
    { group: 'tender', endpoint: 'non-tender-pengumuman', label: 'Non-Tender Pengumuman (Pengayaan)', required: false },
    { group: 'tender', endpoint: 'pengumuman', label: 'Pengumuman Tender (Pengayaan)', required: false },
    { group: 'tender', endpoint: 'peserta-tender', label: 'Peserta Tender (Pemenang)', required: false },
    { group: 'tender', endpoint: 'pencatatan-swakelola', label: 'Pencatatan Swakelola (Pengayaan)', required: false },
    { group: 'tender', endpoint: 'pencatatan-swakelola-realisasi', label: 'Realisasi Pencatatan Swakelola', required: false },
    { group: 'rup', endpoint: 'paket-penyedia', label: 'RUP Paket Penyedia (Pengayaan)', required: false },
    { group: 'rup', endpoint: 'paket-swakelola', label: 'RUP Paket Swakelola (Pengayaan)', required: false },
    { group: 'rup', endpoint: 'paket-anggaran-penyedia', label: 'Anggaran / MAK Penyedia', required: false },
    { group: 'rup', endpoint: 'history-kaji-ulang', label: 'History Kaji Ulang RUP', required: false },
    { group: 'rup', endpoint: 'master-satker', label: 'Master Satker', required: false }
  ];

  const sources: any[] = [];
  for (const s of specs) {
    const filePath = path.resolve(dataDir, s.group, `${s.endpoint}_${tahun}.json`);
    let found = false;
    let count = 0;
    try {
      const stat = await fs.stat(filePath);
      if (stat.isFile()) {
        const parsed = unwrapArray(await readJsonSafe(filePath));
        count = parsed.length;
        found = count > 0 || !s.required;
      }
    } catch {
      // missing
    }
    sources.push({ ...s, found, count, filePath });
  }

  // Master DB / Enriched PPK & Penyedia check
  const ppkData = await loadPpkMaster();
  sources.push({
    group: 'master',
    endpoint: 'ppk-master',
    label: 'Master PPK (MariaDB)',
    required: false,
    found: ppkData.length > 0,
    count: ppkData.length
  });

  const penyediaData = await loadPenyediaMaster();
  sources.push({
    group: 'master',
    endpoint: 'penyedia-master',
    label: 'Master Penyedia (MariaDB)',
    required: false,
    found: penyediaData.length > 0,
    count: penyediaData.length
  });

  const allRequiredFound = sources.filter(s => s.required).every(s => s.found);
  return { sources, allRequiredFound };
};

export const executeRealisasiMasterMerge = async (tahun: string, trigger: string = 'manual'): Promise<any> => {
  const startTime = Date.now();
  const dataDir = getDataDir();
  const mergedDir = path.resolve(dataDir, 'merged');
  console.log(`[RealisasiMasterMerge] Generating enriched realisasi data from dashboard/realisasi/table for ${tahun}...`);

  // 1. Primary Reference Data (Acuan Utama)
  const officialTable = unwrapArray(
    await readJsonSafe(path.join(dataDir, 'dashboard', 'realisasi', `table_${tahun}.json`))
  );
  const officialSummary = await getRealisasiOfficialSummary(tahun);
  const penyediaPerSumber = await getRealisasiPenyediaPerSumber(tahun);

  if (officialTable.length === 0) {
    throw new Error(`Data acuan dashboard/realisasi/table_${tahun}.json tidak ditemukan atau kosong.`);
  }

  // 2. Load Enrichment Sources (Existing Local Datasets & DB Masters)
  const ekatalog = unwrapArray(await readJsonSafe(path.join(dataDir, 'ekatalog', `paket-e-purchasing_${tahun}.json`)));
  const ekatalogV5 = unwrapArray(await readJsonSafe(path.join(dataDir, 'ekatalog-archive', `paket-e-purchasing_${tahun}.json`)));
  const pctNonTender = unwrapArray(await readJsonSafe(path.join(dataDir, 'tender', `pencatatan-non-tender_${tahun}.json`)));
  const pctNonTenderReal = unwrapArray(await readJsonSafe(path.join(dataDir, 'tender', `pencatatan-non-tender-realisasi_${tahun}.json`)));
  const nonTenderPengumuman = unwrapArray(await readJsonSafe(path.join(dataDir, 'tender', `non-tender-pengumuman_${tahun}.json`)));
  const pengumumanTender = unwrapArray(await readJsonSafe(path.join(dataDir, 'tender', `pengumuman_${tahun}.json`)));
  const pesertaTender = unwrapArray(await readJsonSafe(path.join(dataDir, 'tender', `peserta-tender_${tahun}.json`)));
  const pctSwakelola = unwrapArray(await readJsonSafe(path.join(dataDir, 'tender', `pencatatan-swakelola_${tahun}.json`)));
  const pctSwakelolaReal = unwrapArray(await readJsonSafe(path.join(dataDir, 'tender', `pencatatan-swakelola-realisasi_${tahun}.json`)));
  const rupPenyedia = unwrapArray(await readJsonSafe(path.join(dataDir, 'rup', `paket-penyedia_${tahun}.json`)));
  const rupSwakelola = unwrapArray(await readJsonSafe(path.join(dataDir, 'rup', `paket-swakelola_${tahun}.json`)));
  const anggaranPenyedia = unwrapArray(await readJsonSafe(path.join(dataDir, 'rup', `paket-anggaran-penyedia_${tahun}.json`)));
  const anggaranSwakelola = unwrapArray(await readJsonSafe(path.join(dataDir, 'rup', `paket-anggaran-swakelola_${tahun}.json`)));
  const historyKajiUlang = unwrapArray(await readJsonSafe(path.join(dataDir, 'rup', `history-kaji-ulang_${tahun}.json`)));
  const masterSatker = unwrapArray(await readJsonSafe(path.join(dataDir, 'rup', `master-satker_${tahun}.json`)));

  const ppkMaster = await loadPpkMaster();
  const penyediaMaster = await loadPenyediaMaster();

  // 3. Build O(1) Lookup Maps
  const rupPenyediaMap = new Map<string, any>();
  for (const r of rupPenyedia) {
    if (r.kd_rup) rupPenyediaMap.set(String(r.kd_rup), r);
  }

  const rupSwakelolaMap = new Map<string, any>();
  for (const r of rupSwakelola) {
    if (r.kd_rup) rupSwakelolaMap.set(String(r.kd_rup), r);
  }

  const satkerMap = new Map<string, any>();
  const satkerByNameMap = new Map<string, any>();
  for (const s of masterSatker) {
    if (s.kd_satker) satkerMap.set(String(s.kd_satker), s);
    if (s.kd_satker_str) satkerMap.set(String(s.kd_satker_str), s);
    if (s.nama_satker) satkerByNameMap.set(normalizeNameKey(s.nama_satker), s);
  }

  const anggaranByRup = new Map<string, any[]>();
  for (const a of [...anggaranPenyedia, ...anggaranSwakelola]) {
    if (a.kd_rup) {
      const k = String(a.kd_rup);
      if (!anggaranByRup.has(k)) anggaranByRup.set(k, []);
      anggaranByRup.get(k)!.push(a);
    }
  }

  const kajiUlangByRup = new Map<string, any[]>();
  for (const k of historyKajiUlang) {
    const keys = [String(k.kd_rup_baru || ''), String(k.kd_rup_lama || '')].filter(Boolean);
    for (const key of keys) {
      if (!kajiUlangByRup.has(key)) kajiUlangByRup.set(key, []);
      kajiUlangByRup.get(key)!.push(k);
    }
  }

  // Transaction maps by kode_paket
  const ekatV6Map = new Map<string, any>();
  for (const x of ekatalog) {
    if (x.order_id) ekatV6Map.set(String(x.order_id), x);
  }

  const ekatV5ExactMap = new Map<string, any>();
  const ekatV5ByPaketMap = new Map<string, any[]>();
  for (const x of ekatalogV5) {
    const kp = String(x.kd_paket || x.no_paket || '');
    if (!kp) continue;
    ekatV5ExactMap.set(`${kp}|${Number(x.total_harga) || 0}`, x);
    if (!ekatV5ByPaketMap.has(kp)) ekatV5ByPaketMap.set(kp, []);
    ekatV5ByPaketMap.get(kp)!.push(x);
  }

  const pctNonTenderMap = new Map<string, any>();
  for (const x of pctNonTender) {
    if (x.kd_nontender_pct) pctNonTenderMap.set(String(x.kd_nontender_pct), x);
  }

  const pctNonTenderRealMap = new Map<string, any[]>();
  for (const r of pctNonTenderReal) {
    if (r.kd_nontender_pct) {
      const k = String(r.kd_nontender_pct);
      if (!pctNonTenderRealMap.has(k)) pctNonTenderRealMap.set(k, []);
      pctNonTenderRealMap.get(k)!.push(r);
    }
  }

  const nonTenderMap = new Map<string, any>();
  for (const x of nonTenderPengumuman) {
    if (x.kd_nontender) nonTenderMap.set(String(x.kd_nontender), x);
  }

  const tenderMap = new Map<string, any>();
  for (const x of pengumumanTender) {
    if (x.kd_tender) tenderMap.set(String(x.kd_tender), x);
  }

  const pesertaByTenderMap = new Map<string, any[]>();
  for (const p of pesertaTender) {
    if (p.kd_tender) {
      const k = String(p.kd_tender);
      if (!pesertaByTenderMap.has(k)) pesertaByTenderMap.set(k, []);
      pesertaByTenderMap.get(k)!.push(p);
    }
  }

  const pctSwakelolaMap = new Map<string, any>();
  for (const x of pctSwakelola) {
    if (x.kd_swakelola_pct) pctSwakelolaMap.set(String(x.kd_swakelola_pct), x);
  }

  const pctSwakelolaRealMap = new Map<string, any[]>();
  for (const r of pctSwakelolaReal) {
    if (r.kd_swakelola_pct) {
      const k = String(r.kd_swakelola_pct);
      if (!pctSwakelolaRealMap.has(k)) pctSwakelolaRealMap.set(k, []);
      pctSwakelolaRealMap.get(k)!.push(r);
    }
  }

  // PPK Master Lookup + fallback from enriched JSON files on disk
  const ppkMap = new Map<string, any>();
  const ppkMapLower = new Map<string, any>();
  const ppkByRupFallback = new Map<string, any>();

  const registerPpk = (maskedKey: string | null | undefined, entry: any) => {
    if (!entry || !entry.nama_lengkap) return;
    if (maskedKey) {
      const norm = normalizeText(maskedKey);
      if (norm) {
        if (!ppkMap.has(norm) || (!ppkMap.get(norm)?.jabatan && entry.jabatan)) {
          ppkMap.set(norm, entry);
        }
        const lower = norm.toLowerCase();
        if (!ppkMapLower.has(lower) || (!ppkMapLower.get(lower)?.jabatan && entry.jabatan)) {
          ppkMapLower.set(lower, entry);
        }
      }
    }
    if (entry.nip_asli) {
      const nipNorm = normalizeText(entry.nip_asli);
      if (nipNorm && (!ppkMap.has(nipNorm) || (!ppkMap.get(nipNorm)?.jabatan && entry.jabatan))) {
        ppkMap.set(nipNorm, entry);
      }
    }
  };

  for (const p of ppkMaster) {
    registerPpk(p.nip_nama_masked, p);
  }

  // Penyedia Master Lookup + fallback from enriched JSON files on disk
  const penyediaByKode = new Map<string, any>();
  const penyediaByNpwp = new Map<string, any>();
  const penyediaByName = new Map<string, any>();

  const registerPenyedia = (entry: any) => {
    if (!entry) return;
    const kode = entry.kode_penyedia ? String(entry.kode_penyedia) : '';
    const npwp = cleanNpwp(entry.npwp || entry.npwp_penyedia);
    const nama = entry.nama_penyedia || entry.penyedia_nama || '';
    const normEntry = {
      kode_penyedia: kode || '',
      nama_penyedia: nama || '',
      npwp: entry.npwp || entry.npwp_penyedia || '',
      alamat: entry.alamat || entry.penyedia_alamat || '',
      telepon: entry.telepon || '',
      email: entry.email || '',
      jenis_perusahaan: entry.jenis_perusahaan || '',
      bentuk_usaha: entry.bentuk_usaha || '',
      status_umkk: entry.status_umkk ?? entry.penyedia_status_umkk ?? null,
      status_aktif: entry.status_aktif || '',
      nib: entry.nib || ''
    };
    if (kode && (!penyediaByKode.has(kode) || (!penyediaByKode.get(kode)?.npwp && normEntry.npwp))) {
      penyediaByKode.set(kode, normEntry);
    }
    if (npwp && (!penyediaByNpwp.has(npwp) || (!penyediaByNpwp.get(npwp)?.nama_penyedia && normEntry.nama_penyedia))) {
      penyediaByNpwp.set(npwp, normEntry);
    }
    if (nama) {
      const nk = normalizeNameKey(nama);
      if (nk && (!penyediaByName.has(nk) || (!penyediaByName.get(nk)?.npwp && normEntry.npwp))) {
        penyediaByName.set(nk, normEntry);
      }
    }
  };

  for (const p of penyediaMaster) {
    registerPenyedia(p);
  }

  const enrichedFallbacks = [
    `rup-penyedia-enriched_${tahun}.json`,
    `rup-swakelola-enriched_${tahun}.json`,
    `epurchasing_enriched_${tahun}.json`,
    `nontender_enriched_${tahun}.json`,
    `pencatatan-nontender-enriched_${tahun}.json`,
    `pencatatan-swakelola-enriched_${tahun}.json`
  ];
  for (const fname of enrichedFallbacks) {
    const rows = unwrapArray(await readJsonSafe(path.join(mergedDir, fname)));
    for (const row of rows) {
      if (row.ppk_nama_lengkap) {
        const entry = {
          nama_lengkap: row.ppk_nama_lengkap,
          nip_asli: row.ppk_nip_asli || '',
          jabatan: row.ppk_jabatan || '',
          unit_kerja: row.ppk_unit_kerja || '',
          telepon: row.ppk_telepon || '',
          email: row.ppk_email || '',
          nip_nama_masked: row.nip_nama_ppk || ''
        };
        const nipPart = normalizeText(row.nip_ppk || row.rup_nip_ppk);
        const namaPart = normalizeText(row.nama_ppk || row.rup_nama_ppk);
        const combined = nipPart && namaPart ? `${nipPart} - ${namaPart}` : (nipPart || namaPart);
        registerPpk(row.nip_nama_ppk, entry);
        registerPpk(combined, entry);
        if (row.kd_rup && !ppkByRupFallback.has(String(row.kd_rup))) {
          ppkByRupFallback.set(String(row.kd_rup), entry);
        }
      }
      if (row.penyedia_detail && (row.penyedia_detail.kode_penyedia || row.penyedia_detail.nama_penyedia)) {
        registerPenyedia(row.penyedia_detail);
      }
      if (row.kode_penyedia && (row.penyedia_nama || row.penyedia_npwp)) {
        registerPenyedia({
          kode_penyedia: row.kode_penyedia,
          nama_penyedia: row.penyedia_nama,
          npwp: row.penyedia_npwp,
          status_umkk: row.penyedia_status_umkk
        });
      }
    }
  }

  // Helper Resolvers
  const resolvePpk = (nip?: string, nama?: string, rawMasked?: string, kdRup?: string) => {
    const cleanNip = normalizeText(nip);
    const cleanNama = normalizeText(nama);
    const cleanRaw = normalizeText(rawMasked);
    const combinedKey = cleanNip && cleanNama ? `${cleanNip} - ${cleanNama}` : (cleanNip || cleanNama || cleanRaw);

    const p =
      (cleanRaw && (ppkMap.get(cleanRaw) || ppkMapLower.get(cleanRaw.toLowerCase()))) ||
      (combinedKey && (ppkMap.get(combinedKey) || ppkMapLower.get(combinedKey.toLowerCase()))) ||
      (cleanNip && ppkMap.get(cleanNip)) ||
      (kdRup ? ppkByRupFallback.get(String(kdRup)) : null);

    if (p && p.nama_lengkap) {
      return {
        nama_ppk: p.nama_lengkap,
        ppk_nip_asli: p.nip_asli || '',
        ppk_nip_masked: combinedKey || p.nip_nama_masked || '',
        ppk_jabatan: p.jabatan || '',
        ppk_unit_kerja: p.unit_kerja || '',
        ppk_telepon: p.telepon || '',
        ppk_email: p.email || '',
        _ppk_completed: true
      };
    }

    return {
      nama_ppk: cleanNama || cleanRaw || '-',
      ppk_nip_asli: '',
      ppk_nip_masked: combinedKey || '-',
      ppk_jabatan: '',
      ppk_unit_kerja: '',
      ppk_telepon: '',
      ppk_email: '',
      _ppk_completed: false
    };
  };

  const resolvePenyedia = (kode?: string, npwp?: string, namaFallback?: string) => {
    const k = kode ? String(kode) : '';
    const n = cleanNpwp(npwp);
    const nm = normalizeNameKey(namaFallback);
    const found =
      (k && penyediaByKode.get(k)) ||
      (n && penyediaByNpwp.get(n)) ||
      (nm && penyediaByName.get(nm)) ||
      null;

    if (found) {
      return {
        penyedia_kode: found.kode_penyedia || k || '',
        penyedia_npwp: found.npwp || npwp || '',
        penyedia_alamat: found.alamat || '',
        penyedia_telepon: found.telepon || '',
        penyedia_email: found.email || '',
        penyedia_jenis_perusahaan: found.jenis_perusahaan || '',
        penyedia_bentuk_usaha: found.bentuk_usaha || '',
        penyedia_status_umkk: found.status_umkk ?? null,
        penyedia_nib: found.nib || '',
        _penyedia_completed: true
      };
    }

    return {
      penyedia_kode: k || '',
      penyedia_npwp: npwp || '',
      penyedia_alamat: '',
      penyedia_telepon: '',
      penyedia_email: '',
      penyedia_jenis_perusahaan: '',
      penyedia_bentuk_usaha: '',
      penyedia_status_umkk: null,
      penyedia_nib: '',
      _penyedia_completed: false
    };
  };

  // Counters for merge statistics
  let txMatchedCount = 0;
  let rupMatchedCount = 0;
  let ppkCompletedCount = 0;
  let penyediaCompletedCount = 0;
  let hasAnggaranCount = 0;
  let hasKajiUlangCount = 0;

  // 4. Enrich every canonical row from dashboard/realisasi/table
  const enrichedData = officialTable.map((item: any, idx: number) => {
    const kodePaket = String(item.kode_paket || '');
    const kodeRup = item.kode_rup !== undefined && item.kode_rup !== null ? String(item.kode_rup).trim() : '';
    const sumber = String(item.sumber_transaksi || '');

    // Lookup RUP (Penyedia first, fallback Swakelola)
    const rupP = kodeRup ? rupPenyediaMap.get(kodeRup) : null;
    const rupS = kodeRup ? rupSwakelolaMap.get(kodeRup) : null;
    const rup = rupP || rupS || null;
    const rupTipePaket = rupP ? 'Penyedia' : (rupS ? 'Swakelola' : '');
    if (rup) rupMatchedCount++;

    // Lookup Transaction detail by kode_paket & sumber_transaksi
    let tx: any = null;
    let txType = '';
    let tglTransaksi = '';
    let sortDate = 0;
    let kodePenyediaTx = '';
    let npwpPenyediaTx = '';
    let realisasiList: any[] = [];
    let produkList: any[] = [];
    let pesertaCount = 0;
    let pemenangDetail: any = null;
    let txMak = '';

    if (sumber === 'E-Katalog Versi 6.0' || ekatV6Map.has(kodePaket)) {
      tx = ekatV6Map.get(kodePaket) || null;
      if (tx) {
        txType = 'ekatalog_v6';
        tglTransaksi = tx.order_date || '';
        sortDate = parseTimestamp(tx.order_date);
        kodePenyediaTx = tx.kode_penyedia ? String(tx.kode_penyedia) : '';
        txMak = tx.mak ? String(tx.mak) : '';
        if (Array.isArray(tx.products)) {
          produkList = tx.products;
        }
      }
    } else if (sumber === 'E-Katalog Versi 5.0') {
      const exactKey = `${kodePaket}|${Number(item.total_nilai) || 0}`;
      tx = ekatV5ExactMap.get(exactKey) || (ekatV5ByPaketMap.get(kodePaket)?.[0] ?? null);
      if (tx) {
        txType = 'ekatalog_v5';
        tglTransaksi = tx.tanggal_buat_paket || '';
        sortDate = parseTimestamp(tx.tanggal_buat_paket);
        kodePenyediaTx = tx.kd_penyedia ? String(tx.kd_penyedia) : '';
        txMak = tx.kode_anggaran ? String(tx.kode_anggaran) : '';
      }
    } else if (sumber === 'Pencatatan Non Tender' || pctNonTenderMap.has(kodePaket)) {
      tx = pctNonTenderMap.get(kodePaket) || null;
      if (tx) {
        txType = 'pencatatan_nontender';
        tglTransaksi = tx.tgl_buat_paket || tx.tgl_mulai_paket || '';
        sortDate = parseTimestamp(tglTransaksi);
        realisasiList = pctNonTenderRealMap.get(kodePaket) || [];
        if (realisasiList.length > 0) {
          kodePenyediaTx = realisasiList[0].kode_penyedia ? String(realisasiList[0].kode_penyedia) : '';
          npwpPenyediaTx = realisasiList[0].npwp_penyedia ? String(realisasiList[0].npwp_penyedia) : '';
        }
      }
    } else if (sumber === 'Non Tender' || nonTenderMap.has(kodePaket)) {
      tx = nonTenderMap.get(kodePaket) || null;
      if (tx) {
        txType = 'nontender';
        tglTransaksi = tx.tgl_buat_paket || tx.tgl_pengumuman_nontender || '';
        sortDate = parseTimestamp(tglTransaksi);
        txMak = tx.mak ? String(tx.mak) : '';
      }
    } else if (sumber === 'Tender' || tenderMap.has(kodePaket)) {
      tx = tenderMap.get(kodePaket) || null;
      if (tx) {
        txType = 'tender';
        tglTransaksi = tx.tgl_buat_paket || tx.tgl_pengumuman_tender || '';
        sortDate = parseTimestamp(tglTransaksi);
        const peserta = pesertaByTenderMap.get(kodePaket) || [];
        pesertaCount = peserta.length;
        const winner = peserta.find((p: any) => p.pemenang_terverifikasi === 1 || p.pemenang === 1) || null;
        if (winner) {
          pemenangDetail = {
            nama_penyedia: winner.nama_penyedia || '',
            kd_penyedia: winner.kd_penyedia || '',
            npwp_penyedia: winner.npwp_penyedia || winner.npwp_penyedia_16 || '',
            nilai_penawaran: Number(winner.nilai_penawaran) || 0,
            nilai_terkoreksi: Number(winner.nilai_terkoreksi) || 0
          };
          kodePenyediaTx = winner.kd_penyedia ? String(winner.kd_penyedia) : '';
          npwpPenyediaTx = winner.npwp_penyedia || winner.npwp_penyedia_16 || '';
        }
      }
    } else if (sumber === 'Pencatatan Swakelola' || pctSwakelolaMap.has(kodePaket)) {
      tx = pctSwakelolaMap.get(kodePaket) || null;
      if (tx) {
        txType = 'pencatatan_swakelola';
        tglTransaksi = tx.tgl_buat_paket || tx.tgl_mulai_paket || '';
        sortDate = parseTimestamp(tglTransaksi);
        realisasiList = pctSwakelolaRealMap.get(kodePaket) || [];
      }
    }

    if (tx) txMatchedCount++;

    // Fallback sortDate from RUP if transaction lacked date
    if (!sortDate && rup) {
      const rupDate = rup.tgl_pengumuman_paket || rup.tgl_buat_paket || '';
      if (rupDate) {
        sortDate = parseTimestamp(rupDate);
        if (!tglTransaksi) tglTransaksi = rupDate;
      }
    }

    // Resolve PPK
    const ppkNip = tx?.rup_nip_ppk || tx?.nip_ppk || tx?.ppk_nip || rup?.nip_ppk || '';
    const ppkNama = tx?.rup_nama_ppk || tx?.nama_ppk || rup?.nama_ppk || tx?.jabatan_ppk || '';
    const ppkRawMasked = tx?.nip_nama_ppk || '';
    const ppkInfo = resolvePpk(ppkNip, ppkNama, ppkRawMasked, kodeRup);
    if (ppkInfo._ppk_completed) ppkCompletedCount++;

    // Resolve Penyedia (only when nama_penyedia isn't empty/dash or we have tx kode/npwp)
    const namaPenyediaCanonical = item.nama_penyedia ? String(item.nama_penyedia) : '-';
    const penyediaInfo = resolvePenyedia(
      kodePenyediaTx,
      npwpPenyediaTx,
      namaPenyediaCanonical !== '-' && namaPenyediaCanonical !== 'SWAKELOLA' ? namaPenyediaCanonical : ''
    );
    if (penyediaInfo._penyedia_completed) penyediaCompletedCount++;

    // Resolve Satker
    const kdSatker = tx?.kode_satker || tx?.kd_satker || tx?.satker_id || rup?.kd_satker || '';
    const satker =
      (kdSatker ? satkerMap.get(String(kdSatker)) : null) ||
      satkerByNameMap.get(normalizeNameKey(item.nama_satuan_kerja)) ||
      null;

    // Resolve Anggaran / MAK
    const anggarans = kodeRup ? (anggaranByRup.get(kodeRup) || []) : [];
    const makSet = new Set<string>();
    if (txMak) makSet.add(txMak);
    for (const a of anggarans) {
      if (a.mak) makSet.add(String(a.mak));
    }
    if (anggarans.length > 0 || makSet.size > 0) hasAnggaranCount++;

    // Resolve History Kaji Ulang
    const kajiList = kodeRup ? (kajiUlangByRup.get(kodeRup) || []) : [];
    const kajiSorted = [...kajiList].sort(
      (a, b) => parseTimestamp(b.tgl_kaji_ulang) - parseTimestamp(a.tgl_kaji_ulang)
    );
    if (kajiSorted.length > 0) hasKajiUlangCount++;

    // Canonical numeric values from dashboard/realisasi/table
    const nilaiPagu = Number(item.nilai_pagu) || 0;
    const totalNilai = Number(item.total_nilai) || 0;
    const nilaiPdn = Number(item.nilai_pdn) || 0;
    const nilaiUmk = Number(item.nilai_umk) || 0;

    const jenisEnriched =
      normalizeText(item.jenis_pengadaan) ||
      normalizeText(rup?.jenis_pengadaan) ||
      normalizeText(tx?.kategori_pengadaan) ||
      normalizeText(tx?.jenis_pengadaan) ||
      (sumber === 'Pencatatan Swakelola' ? (rup?.tipe_swakelola_nama || 'Swakelola') : '') ||
      '-';

    return {
      // ── 17 Canonical Columns (100% faithful to dashboard/realisasi/table & CSV) ──
      nama_instansi: item.nama_instansi || 'KEMENTERIAN PENDAYAGUNAAN APARATUR NEGARA DAN REFORMASI BIROKRASI',
      nama_satuan_kerja: item.nama_satuan_kerja || 'MENTERI NEGARA PENDAYAGUNAAN APARATUR NEGARA - 427950',
      kode_paket: kodePaket,
      kode_rup: kodeRup,
      tahun_anggaran: item.tahun_anggaran || Number(tahun) || tahun,
      sumber_transaksi: sumber || '-',
      sumber_dana: item.sumber_dana || '-',
      nama_penyedia: namaPenyediaCanonical,
      metode_pengadaan: item.metode_pengadaan || '-',
      jenis_pengadaan: item.jenis_pengadaan ?? '',
      nama_paket: item.nama_paket || '-',
      status_paket: item.status_paket || '-',
      tahapan_pengadaan: item.tahapan_pengadaan || '-',
      nilai_pagu: nilaiPagu,
      total_nilai: totalNilai,
      nilai_pdn: nilaiPdn,
      nilai_umk: nilaiUmk,

      // ── Enriched Identification & Classification ──
      _acuan_table_v2: true,
      _original_index: idx,
      _sort_date: sortDate,
      tgl_transaksi: tglTransaksi,
      jenis_pengadaan_enriched: jenisEnriched,
      realisasi_pct: nilaiPagu > 0 ? Math.round((totalNilai / nilaiPagu) * 10000) / 100 : null,
      selisih_pagu: nilaiPagu > 0 ? nilaiPagu - totalNilai : 0,

      // ── Enriched PPK ──
      ...ppkInfo,

      // ── Enriched Penyedia ──
      ...penyediaInfo,

      // ── Enriched Satker ──
      satker_kode: satker?.kd_satker_str || satker?.kd_satker || String(kdSatker || ''),
      satker_jenis: satker?.jenis_satker || '',
      satker_status: satker?.status_satker || '',
      satker_alamat: satker?.alamat || tx?.alamat_satker || '',

      // ── Enriched Transaction Details ──
      _tx_matched: Boolean(tx),
      tx_type: txType,
      tx_hps: Number(tx?.hps) || 0,
      tx_shipment_status: tx?.shipment_status || '',
      tx_count_product: Number(tx?.count_product) || (tx?.jml_jenis_produk ? Number(tx.jml_jenis_produk) : 0),
      tx_total_qty: Number(tx?.total_qty) || (tx?.kuantitas ? Number(tx.kuantitas) : 0),
      tx_shipping_fee: Number(tx?.shipping_fee) || Number(tx?.ongkos_kirim) || 0,
      tx_flag_minikom: tx?.flag_minikom || '',
      tx_is_swasta: tx?.is_swasta ?? null,
      tx_lokasi_pekerjaan: tx?.lokasi_pekerjaan || '',
      tx_kabkota: tx?.kabkota || '',
      tx_provinsi: tx?.provinsi || '',
      tx_kualifikasi_paket: tx?.kualifikasi_paket || '',
      tx_kontrak_pembayaran: tx?.kontrak_pembayaran || '',
      tx_nama_lpse: tx?.nama_lpse || '',
      tx_url_lpse: tx?.url_lpse || '',
      tx_tgl_mulai_paket: tx?.tgl_mulai_paket || '',
      tx_tgl_selesai_paket: tx?.tgl_selesai_paket || '',
      tx_uraian_pekerjaan: tx?.uraian_pekerjaan || '',
      tx_bukti_pembayaran: tx?.bukti_pembayaran || '',
      tx_peserta_count: pesertaCount,
      tx_pemenang_detail: pemenangDetail,
      tx_products: produkList.slice(0, 50),
      tx_realisasi_list: realisasiList,

      // ── Enriched RUP Details ──
      _rup_matched: Boolean(rup),
      rup_tipe_paket: rupTipePaket,
      rup_nama_paket: rup?.nama_paket || '',
      rup_pagu: Number(rup?.pagu) || 0,
      rup_jenis_pengadaan: rup?.jenis_pengadaan || '',
      rup_metode_pengadaan: rup?.metode_pengadaan || '',
      rup_status_aktif: rup?.status_aktif_rup ?? null,
      rup_status_umumkan: rup?.status_umumkan_rup || '',
      rup_status_pdn: rup?.status_pdn || '',
      rup_status_ukm: rup?.status_ukm || '',
      rup_status_pradipa: rup?.status_pradipa || '',
      rup_status_konsolidasi: rup?.status_konsolidasi || '',
      rup_uraian_pekerjaan: rup?.uraian_pekerjaan || rup?.urarian_pekerjaan || '',
      rup_spesifikasi_pekerjaan: rup?.spesifikasi_pekerjaan || '',
      rup_volume_pekerjaan: rup?.volume_pekerjaan || '',
      rup_detail_lokasi: parseDetailLokasi(rup?.detail_lokasi),
      rup_tgl_pengumuman_paket: rup?.tgl_pengumuman_paket || '',
      rup_tgl_awal_pemilihan: rup?.tgl_awal_pemilihan || '',
      rup_tgl_akhir_pemilihan: rup?.tgl_akhir_pemilihan || '',
      rup_tgl_awal_kontrak: rup?.tgl_awal_kontrak || rup?.tgl_awal_pelaksanaan_kontrak || '',
      rup_tgl_akhir_kontrak: rup?.tgl_akhir_kontrak || rup?.tgl_akhir_pelaksanaan_kontrak || '',
      rup_tgl_awal_pemanfaatan: rup?.tgl_awal_pemanfaatan || '',
      rup_tgl_akhir_pemanfaatan: rup?.tgl_akhir_pemanfaatan || '',
      rup_spp_lingkungan: Boolean(rup?.spp_aspek_lingkungan),
      rup_spp_sosial: Boolean(rup?.spp_aspek_sosial),
      rup_spp_ekonomi: Boolean(rup?.spp_aspek_ekonomi),

      // ── Enriched Anggaran / MAK ──
      _has_anggaran: anggarans.length > 0 || makSet.size > 0,
      mak_list: Array.from(makSet),
      anggaran_list: anggarans.map((a: any) => ({
        mak: a.mak || '-',
        sumber_dana: a.sumber_dana || '-',
        pagu: Number(a.pagu) || 0,
        asal_dana_satker: a.asal_dana_satker || '',
        jenis_dana_apbn: a.jenis_dana_apbn || ''
      })),

      // ── Enriched History Kaji Ulang ──
      _has_kaji_ulang: kajiSorted.length > 0,
      kaji_ulang_count: kajiSorted.length,
      kaji_ulang_terakhir: kajiSorted[0]?.tgl_kaji_ulang || '',
      kaji_ulang_jenis_revisi: kajiSorted[0]?.jenis_revisi || '',
      kaji_ulang_alasan: kajiSorted[0]?.alasan_kajiulang || '',
      kaji_ulang_list: kajiSorted.map((k: any) => ({
        tgl_kaji_ulang: k.tgl_kaji_ulang || '',
        jenis_revisi: k.jenis_revisi || '',
        alasan_kajiulang: k.alasan_kajiulang || '',
        kd_rup_lama: k.kd_rup_lama || '',
        kd_rup_baru: k.kd_rup_baru || ''
      }))
    };
  });

  // Sort by transaction date descending (preserving original index as tie-breaker)
  enrichedData.sort((a: any, b: any) => {
    const diff = (b._sort_date || 0) - (a._sort_date || 0);
    return diff !== 0 ? diff : a._original_index - b._original_index;
  });

  // Save merged output
  const mergedFilePath = path.resolve(mergedDir, `realisasi_master_${tahun}.json`);
  await fs.mkdir(mergedDir, { recursive: true });
  await fs.writeFile(mergedFilePath, JSON.stringify(enrichedData), 'utf-8');

  // Save merge history
  const historyPath = path.resolve(dataDir, 'merge_history.json');
  let history: any[] = [];
  try {
    history = JSON.parse(await fs.readFile(historyPath, 'utf-8'));
    if (!Array.isArray(history)) history = [];
  } catch {
    history = [];
  }

  const totalNilaiSum = enrichedData.reduce((s: number, r: any) => s + (Number(r.total_nilai) || 0), 0);
  const totalPaguSum = enrichedData.reduce((s: number, r: any) => s + (Number(r.nilai_pagu) || 0), 0);

  const result = {
    id: `realisasi_master_${Date.now()}`,
    type: 'realisasi-master',
    tahun,
    timestamp: new Date().toISOString(),
    trigger,
    duration_ms: Date.now() - startTime,
    status: 'success',
    result: {
      total_records: enrichedData.length,
      summary_jumlah_paket: officialSummary?.jumlah_paket ?? enrichedData.length,
      summary_total_nilai: officialSummary?.total_nilai ?? totalNilaiSum,
      total_nilai_sum: totalNilaiSum,
      total_pagu_sum: totalPaguSum,
      tx_matched: txMatchedCount,
      rup_matched: rupMatchedCount,
      ppk_completed: ppkCompletedCount,
      penyedia_completed: penyediaCompletedCount,
      has_anggaran: hasAnggaranCount,
      has_kaji_ulang: hasKajiUlangCount,
      penyedia_per_sumber_count: penyediaPerSumber.length
    }
  };

  history.unshift(result);
  if (history.length > 50) history = history.slice(0, 50);
  await fs.writeFile(historyPath, JSON.stringify(history, null, 2), 'utf-8');

  console.log(
    `[RealisasiMasterMerge] Successfully merged ${enrichedData.length} records for ${tahun} (tx: ${txMatchedCount}, rup: ${rupMatchedCount}, ppk: ${ppkCompletedCount}).`
  );

  return result;
};

export const getRealisasiMasterData = async (tahun: string): Promise<any[]> => {
  const dataDir = getDataDir();
  const mergedFilePath = path.resolve(dataDir, 'merged', `realisasi_master_${tahun}.json`);

  const sourceFiles = [
    path.join(dataDir, 'dashboard', 'realisasi', `table_${tahun}.json`),
    path.join(dataDir, 'dashboard', 'realisasi', `summary_${tahun}.json`),
    path.join(dataDir, 'dashboard', 'realisasi', 'penyedia', `per-sumber_${tahun}.json`),
    path.join(dataDir, 'ekatalog', `paket-e-purchasing_${tahun}.json`),
    path.join(dataDir, 'ekatalog-archive', `paket-e-purchasing_${tahun}.json`),
    path.join(dataDir, 'tender', `pencatatan-non-tender_${tahun}.json`),
    path.join(dataDir, 'tender', `pencatatan-non-tender-realisasi_${tahun}.json`),
    path.join(dataDir, 'tender', `non-tender-pengumuman_${tahun}.json`),
    path.join(dataDir, 'tender', `pengumuman_${tahun}.json`),
    path.join(dataDir, 'tender', `peserta-tender_${tahun}.json`),
    path.join(dataDir, 'tender', `pencatatan-swakelola_${tahun}.json`),
    path.join(dataDir, 'tender', `pencatatan-swakelola-realisasi_${tahun}.json`),
    path.join(dataDir, 'rup', `paket-penyedia_${tahun}.json`),
    path.join(dataDir, 'rup', `paket-swakelola_${tahun}.json`),
    path.join(dataDir, 'rup', `paket-anggaran-penyedia_${tahun}.json`),
    path.join(dataDir, 'rup', `history-kaji-ulang_${tahun}.json`),
    path.join(dataDir, 'rup', `master-satker_${tahun}.json`)
  ];

  let needsMerge = false;

  try {
    const mergedStat = await fs.stat(mergedFilePath);
    const mergedTime = mergedStat.mtimeMs;

    for (const file of sourceFiles) {
      try {
        const stat = await fs.stat(file);
        if (stat.mtimeMs > mergedTime) {
          needsMerge = true;
          console.log(`[RealisasiMaster] Source file ${file} is newer than merged file. Triggering re-merge.`);
          break;
        }
      } catch {
        // Source file doesn't exist, ignore
      }
    }
  } catch {
    needsMerge = true;
  }

  if (needsMerge) {
    console.log(`[RealisasiMaster] Data missing or outdated for ${tahun}, auto-triggering merge...`);
    try {
      await executeRealisasiMasterMerge(tahun, 'auto');
    } catch (e) {
      console.error('Auto-merge failed', e);
    }
  }

  let data = unwrapArray(await readJsonSafe(mergedFilePath));

  // Auto-upgrade legacy schema if existing file on disk was created before acuan table v2
  if (data.length === 0 || !data[0]?._acuan_table_v2) {
    if (!needsMerge) {
      console.log(`[RealisasiMaster] Legacy or empty merged file detected for ${tahun}, upgrading to dashboard/realisasi/table reference...`);
      try {
        await executeRealisasiMasterMerge(tahun, 'auto_upgrade');
        data = unwrapArray(await readJsonSafe(mergedFilePath));
      } catch (e) {
        console.error('Auto-upgrade merge failed', e);
      }
    }
  }

  return data;
};

export const getRealisasiMasterMergeStatus = async (tahun: string) => {
  const dataDir = getDataDir();
  const historyPath = path.resolve(dataDir, 'merge_history.json');
  let history: any[] = [];
  try {
    history = JSON.parse(await fs.readFile(historyPath, 'utf-8'));
    if (!Array.isArray(history)) history = [];
  } catch {
    history = [];
  }

  const masterHistory = history.filter((h: any) => h.id?.startsWith('realisasi_master_'));
  const lastMerge = masterHistory.find((h: any) => h.tahun === tahun) || null;

  return {
    lastMerge,
    history: masterHistory.filter((h: any) => h.tahun === tahun).slice(0, 10)
  };
};
