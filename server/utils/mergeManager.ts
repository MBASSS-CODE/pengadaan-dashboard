import fs from 'fs/promises';
import path from 'path';
import { loadPpkMaster } from './ppkManager';

// ─── In-Memory Cache ────────────────────────────────────────────────────────
let mergedCache: Record<string, any[]> = {};
let mergeHistoryCache: any[] | null = null;

// Debounce state to prevent rapid re-merges during batch sync
let mergeDebounceTimer: ReturnType<typeof setTimeout> | null = null;
const MERGE_DEBOUNCE_MS = 5000;

// ─── File Paths ─────────────────────────────────────────────────────────────
const dataDir = path.resolve(process.cwd(), 'server/data');
const mergedDir = path.resolve(dataDir, 'merged');
const mergeHistoryPath = path.resolve(dataDir, 'merge_history.json');

// ─── Sources that trigger auto-merge ────────────────────────────────────────
export const MERGE_SOURCE_ENDPOINTS = [
  { group: 'tender', endpoint: 'non-tender-pengumuman', label: 'Non-Tender Pengumuman', required: true },
  { group: 'rup', endpoint: 'paket-penyedia', label: 'Paket Penyedia RUP', required: true },
  { group: 'rup', endpoint: 'master-satker', label: 'Master Satker', required: false },
  { group: 'rup', endpoint: 'history-kaji-ulang', label: 'History Kaji Ulang', required: false },
  { group: 'rup', endpoint: 'paket-anggaran-penyedia', label: 'Anggaran Penyedia', required: false },
];

// ─── Helper: Read JSON safely ───────────────────────────────────────────────
export const readJsonSafe = async (filePath: string): Promise<any[] | null> => {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

// ─── Check Merge Prerequisites ──────────────────────────────────────────────
export const checkMergePrerequisites = async (tahun: string) => {
  const results: any[] = [];

  for (const src of MERGE_SOURCE_ENDPOINTS) {
    const filePath = path.resolve(dataDir, src.group, `${src.endpoint}_${tahun}.json`);
    let found = false;
    let count = 0;
    try {
      const stat = await fs.stat(filePath);
      found = stat.isFile();
      if (found) {
        const data = await readJsonSafe(filePath);
        count = data?.length || 0;
      }
    } catch { /* file not found */ }

    results.push({
      group: src.group,
      endpoint: src.endpoint,
      label: src.label,
      required: src.required,
      found,
      count,
      filePath
    });
  }

  // Check PPK master
  const ppkData = await loadPpkMaster();
  results.push({
    group: 'admin',
    endpoint: 'ppk-master',
    label: 'Data PPK (Manual)',
    required: false,
    found: true,
    count: ppkData.length,
    filePath: path.resolve(dataDir, 'ppk_master.json')
  });

  const allRequiredFound = results.filter(r => r.required).every(r => r.found);

  return { sources: results, allRequiredFound };
};

export const checkRupPenyediaPrerequisites = async (tahun: string) => {
  const sources = [
    { group: 'rup', endpoint: 'paket-penyedia', label: 'RUP Penyedia', required: true },
    { group: 'rup', endpoint: 'master-satker', label: 'Master Satker', required: false },
    { group: 'rup', endpoint: 'history-kaji-ulang', label: 'History Kaji Ulang', required: false },
    { group: 'rup', endpoint: 'paket-anggaran-penyedia', label: 'Anggaran Penyedia', required: false },
    { group: 'tender', endpoint: 'non-tender-pengumuman', label: 'Non-Tender', required: false },
    { group: 'rup', endpoint: 'paket-swakelola', label: 'Paket Swakelola', required: false }
  ];

  const results = [];
  let allRequiredFound = true;

  for (const src of sources) {
    const filePath = path.resolve(dataDir, `${src.group}/${src.endpoint}_${tahun}.json`);
    let found = false;
    let count = 0;
    try {
      const stats = await fs.stat(filePath);
      if (stats.isFile()) {
        found = true;
        const data = await readJsonSafe(filePath);
        if (data && Array.isArray(data)) count = data.length;
      }
    } catch (e) {
      // file not found
    }

    if (src.required && !found) allRequiredFound = false;

    results.push({ ...src, found, count });
  }

  // Check PPK Master
  let ppkFound = false;
  let ppkCount = 0;
  try {
    const ppkData = await loadPpkMaster();
    if (ppkData && ppkData.length > 0) {
      ppkFound = true;
      ppkCount = ppkData.length;
    }
  } catch (e) {}

  results.push({ group: 'master', endpoint: 'ppk-master', label: 'Master PPK', required: false, found: ppkFound, count: ppkCount });

  return { sources: results, allRequiredFound };
};

// ─── Execute Merge ──────────────────────────────────────────────────────────
export const executeMerge = async (tahun: string, trigger: string = 'manual'): Promise<any> => {
  const startTime = Date.now();

  // 1. Check prerequisites
  const prereq = await checkMergePrerequisites(tahun);
  if (!prereq.allRequiredFound) {
    const missing = prereq.sources.filter(s => s.required && !s.found).map(s => s.label);
    const result = {
      id: `merge_${Date.now()}`,
      tahun,
      timestamp: new Date().toISOString(),
      trigger,
      duration_ms: Date.now() - startTime,
      status: 'failed',
      error: `Data wajib belum tersedia: ${missing.join(', ')}`,
      sources: {},
      result: {},
      anomalies: []
    };
    await appendMergeHistory(result);
    return result;
  }

  // 2. Load all data sources
  const nonTenderData: any[] = (await readJsonSafe(path.resolve(dataDir, `tender/non-tender-pengumuman_${tahun}.json`))) || [];
  const paketPenyediaData: any[] = (await readJsonSafe(path.resolve(dataDir, `rup/paket-penyedia_${tahun}.json`))) || [];
  const masterSatkerData: any[] = (await readJsonSafe(path.resolve(dataDir, `rup/master-satker_${tahun}.json`))) || [];
  const kajiUlangData: any[] = (await readJsonSafe(path.resolve(dataDir, `rup/history-kaji-ulang_${tahun}.json`))) || [];
  const anggaranData: any[] = (await readJsonSafe(path.resolve(dataDir, `rup/paket-anggaran-penyedia_${tahun}.json`))) || [];
  const ppkData: any[] = await loadPpkMaster();

  // 3. Build lookup maps for O(1) access
  const rupMap = new Map<string, any>();
  for (const item of paketPenyediaData) {
    if (item.kd_rup) rupMap.set(String(item.kd_rup), item);
  }

  const satkerMap = new Map<string, any>();
  for (const item of masterSatkerData) {
    if (item.kd_satker) satkerMap.set(String(item.kd_satker), item);
  }

  // Kaji ulang: group by kd_rup_baru and kd_rup_lama
  const kajiUlangByRup = new Map<string, any[]>();
  for (const item of kajiUlangData) {
    const keys = [String(item.kd_rup_baru), String(item.kd_rup_lama)].filter(Boolean);
    for (const key of keys) {
      if (!kajiUlangByRup.has(key)) kajiUlangByRup.set(key, []);
      kajiUlangByRup.get(key)!.push(item);
    }
  }

  const anggaranMap = new Map<string, any>();
  for (const item of anggaranData) {
    if (item.kd_rup) anggaranMap.set(String(item.kd_rup), item);
  }

  const ppkMap = new Map<string, any>();
  for (const item of ppkData) {
    if (item.nip_nama_masked) ppkMap.set(item.nip_nama_masked, item);
  }

  // 4. Merge each non-tender record
  const anomalies: string[] = [];
  let rupMatched = 0, rupUnmatched = 0;
  let satkerMatched = 0;
  let ppkCompleted = 0, ppkIncomplete = 0;
  let hasKajiUlang = 0;
  let anggaranMatched = 0;

  const mergedData = nonTenderData.map(item => {
    const enriched = { ...item };
    const kdRup = String(item.kd_rup || '');
    const kdSatker = String(item.kd_satker || '');

    // ── Merge: Paket Penyedia (RUP) ──
    const rup = rupMap.get(kdRup);
    if (rup) {
      enriched.rup_status_aktif = rup.status_aktif_rup;
      enriched.rup_status_delete = rup.status_delete_rup;
      enriched.rup_status_umumkan = rup.status_umumkan_rup;
      enriched.rup_pagu = rup.pagu;
      enriched.rup_jenis_pengadaan = rup.jenis_pengadaan;
      enriched.rup_metode_pengadaan = rup.metode_pengadaan;
      enriched.rup_uraian_pekerjaan = rup.urarian_pekerjaan;
      
      // Atribut Ekstra: Timeline & Jadwal
      enriched.rup_tgl_awal_pemilihan = rup.tgl_awal_pemilihan;
      enriched.rup_tgl_akhir_kontrak = rup.tgl_akhir_kontrak;
      enriched.rup_tgl_buat_paket = rup.tgl_buat_paket;
      enriched.rup_tgl_pengumuman_paket = rup.tgl_pengumuman_paket;
      
      // Atribut Ekstra: Kebijakan (PDN, UKM, SPP)
      enriched.rup_status_pdn = rup.status_pdn;
      enriched.rup_status_ukm = rup.status_ukm;
      enriched.rup_spp_lingkungan = rup.spp_aspek_lingkungan;
      enriched.rup_spp_sosial = rup.spp_aspek_sosial;
      enriched.rup_spp_ekonomi = rup.spp_aspek_ekonomi;
      
      // Atribut Ekstra: Lainnya
      enriched.rup_spesifikasi_pekerjaan = rup.spesifikasi_pekerjaan;
      enriched.rup_kd_swakelola = rup.kd_rup_swakelola;

      enriched._rup_matched = true;
      rupMatched++;
    } else {
      enriched._rup_matched = false;
      rupUnmatched++;
      if (kdRup) anomalies.push(`Paket "${item.nama_paket}" (kd_rup: ${kdRup}) tidak ditemukan di RUP`);
    }

    // ── Merge: Master Satker ──
    const satker = satkerMap.get(kdSatker);
    if (satker) {
      enriched.satker_status = satker.status_satker;
      enriched.satker_jenis = satker.jenis_satker;
      enriched.satker_alamat = satker.alamat;
      enriched._satker_matched = true;
      satkerMatched++;
    } else {
      enriched._satker_matched = false;
    }

    // ── Merge: History Kaji Ulang ──
    const kajiList = kajiUlangByRup.get(kdRup);
    if (kajiList && kajiList.length > 0) {
      // Sort by date desc, get latest
      const sorted = kajiList.sort((a, b) => new Date(b.tgl_kaji_ulang).getTime() - new Date(a.tgl_kaji_ulang).getTime());
      enriched.kaji_ulang_count = kajiList.length;
      enriched.kaji_ulang_terakhir = sorted[0].tgl_kaji_ulang;
      enriched.kaji_ulang_jenis_revisi = sorted[0].jenis_revisi;
      enriched.kaji_ulang_alasan = sorted[0].alasan_kajiulang;
      enriched._has_kaji_ulang = true;
      hasKajiUlang++;
    } else {
      enriched._has_kaji_ulang = false;
    }

    // ── Merge: Anggaran Penyedia ──
    const anggaran = anggaranMap.get(kdRup);
    if (anggaran) {
      enriched.anggaran_total = anggaran.pagu;
      enriched.anggaran_sumber_dana = anggaran.sumber_dana;
      enriched._anggaran_matched = true;
      anggaranMatched++;
    } else {
      enriched._anggaran_matched = false;
    }

    // ── Merge: PPK Master ──
    const ppk = ppkMap.get(item.nip_nama_ppk);
    if (ppk && ppk.nama_lengkap) {
      enriched.ppk_nama_lengkap = ppk.nama_lengkap;
      enriched.ppk_nip_asli = ppk.nip_asli;
      enriched.ppk_jabatan = ppk.jabatan;
      enriched.ppk_unit_kerja = ppk.unit_kerja;
      enriched.ppk_telepon = ppk.telepon;
      enriched.ppk_email = ppk.email;
      enriched._ppk_completed = true;
      ppkCompleted++;
    } else {
      enriched._ppk_completed = false;
      ppkIncomplete++;
    }

    return enriched;
  });

  // 5. Build anomaly summary
  if (ppkIncomplete > 0) anomalies.push(`${ppkIncomplete} PPK belum dilengkapi datanya`);
  if (rupUnmatched > 0) anomalies.push(`${rupUnmatched} paket non-tender tidak ditemukan kd_rup-nya di RUP`);

  // 6. Save merged file
  await fs.mkdir(mergedDir, { recursive: true });
  const mergedFilePath = path.resolve(mergedDir, `nontender_enriched_${tahun}.json`);
  await fs.writeFile(mergedFilePath, JSON.stringify(mergedData, null, 2), 'utf-8');

  // 7. Save to RAM cache
  const cacheKey = `nontender_enriched_${tahun}`;
  mergedCache[cacheKey] = mergedData;

  // 8. Build result log
  const mergeResult = {
    id: `merge_${Date.now()}`,
    tahun,
    timestamp: new Date().toISOString(),
    trigger,
    duration_ms: Date.now() - startTime,
    status: 'success',
    sources: {
      non_tender_pengumuman: { found: true, count: nonTenderData.length },
      paket_penyedia: { found: true, count: paketPenyediaData.length },
      master_satker: { found: masterSatkerData.length > 0, count: masterSatkerData.length },
      history_kaji_ulang: { found: kajiUlangData.length > 0, count: kajiUlangData.length },
      paket_anggaran_penyedia: { found: anggaranData.length > 0, count: anggaranData.length },
      ppk_master: { found: ppkData.length > 0, count: ppkData.length }
    },
    result: {
      total_records: mergedData.length,
      rup_matched: rupMatched,
      rup_unmatched: rupUnmatched,
      satker_matched: satkerMatched,
      ppk_completed: ppkCompleted,
      ppk_incomplete: ppkIncomplete,
      has_kaji_ulang: hasKajiUlang,
      anggaran_matched: anggaranMatched
    },
    anomalies
  };

  await appendMergeHistory(mergeResult);
  console.log(`[Merge] Selesai: ${mergedData.length} records merged dalam ${mergeResult.duration_ms}ms (trigger: ${trigger})`);

  return mergeResult;
};

// ─── Get Merged Data (from RAM or file) ─────────────────────────────────────
export const getMergedData = async (tahun: string): Promise<any[]> => {
  const cacheKey = `nontender_enriched_${tahun}`;
  if (mergedCache[cacheKey]) return mergedCache[cacheKey];

  const filePath = path.resolve(mergedDir, `nontender_enriched_${tahun}.json`);
  const data = await readJsonSafe(filePath);
  if (data) {
    mergedCache[cacheKey] = data;
    return data;
  }
  return [];
};

// ─── Merge History ──────────────────────────────────────────────────────────
const appendMergeHistory = async (entry: any) => {
  let history = await getMergeHistory();
  history.unshift(entry); // newest first
  // Keep last 50 entries
  if (history.length > 50) history = history.slice(0, 50);
  await fs.mkdir(path.dirname(mergeHistoryPath), { recursive: true });
  await fs.writeFile(mergeHistoryPath, JSON.stringify(history, null, 2), 'utf-8');
  mergeHistoryCache = history;
};

export const getMergeHistory = async (): Promise<any[]> => {
  if (mergeHistoryCache) return mergeHistoryCache;
  const data = await readJsonSafe(mergeHistoryPath);
  mergeHistoryCache = data || [];
  return mergeHistoryCache!;
};

// ─── Debounced Auto-Merge ───────────────────────────────────────────────────
export const triggerAutoMerge = (tahun: string, trigger: string) => {
  if (mergeDebounceTimer) clearTimeout(mergeDebounceTimer);
  mergeDebounceTimer = setTimeout(async () => {
    try {
      console.log(`[Auto-Merge] Triggered by: ${trigger}`);
      await executeMerge(tahun, trigger);
    } catch (error) {
      console.error('[Auto-Merge] Failed:', error);
    }
  }, MERGE_DEBOUNCE_MS);
};

// ─── Check if endpoint is a merge source ────────────────────────────────────
export const isMergeSourceEndpoint = (group: string, endpoint: string): boolean => {
  return MERGE_SOURCE_ENDPOINTS.some(s => s.group === group && s.endpoint === endpoint);
};

// ─── RUP Penyedia Master Merge ──────────────────────────────────────────────
export const executeRupPenyediaMerge = async (tahun: string, trigger: string = 'manual') => {
  const startTime = Date.now();
  
  try {
    const dataDir = path.resolve(process.cwd(), 'server', 'data');
    
    // Load all data sources
    const paketPenyediaData: any[] = (await readJsonSafe(path.resolve(dataDir, `rup/paket-penyedia_${tahun}.json`))) || [];
    const masterSatkerData: any[] = (await readJsonSafe(path.resolve(dataDir, `rup/master-satker_${tahun}.json`))) || [];
    const kajiUlangData: any[] = (await readJsonSafe(path.resolve(dataDir, `rup/history-kaji-ulang_${tahun}.json`))) || [];
    const anggaranData: any[] = (await readJsonSafe(path.resolve(dataDir, `rup/paket-anggaran-penyedia_${tahun}.json`))) || [];
    const nonTenderData: any[] = (await readJsonSafe(path.resolve(dataDir, `tender/non-tender-pengumuman_${tahun}.json`))) || [];
    const paketSwakelolaData: any[] = (await readJsonSafe(path.resolve(dataDir, `rup/paket-swakelola_${tahun}.json`))) || [];
    const ppkData: any[] = await loadPpkMaster();

    // Build lookup maps
    const satkerMap = new Map<string, any>();
    for (const item of masterSatkerData) {
      if (item.kd_satker) satkerMap.set(String(item.kd_satker), item);
    }

    const kajiUlangByRup = new Map<string, any[]>();
    for (const item of kajiUlangData) {
      const keys = [String(item.kd_rup_baru), String(item.kd_rup_lama)].filter(Boolean);
      for (const key of keys) {
        if (!kajiUlangByRup.has(key)) kajiUlangByRup.set(key, []);
        kajiUlangByRup.get(key)!.push(item);
      }
    }

    // Anggaran data can have multiple MAKs per RUP, we group them
    const anggaranByRup = new Map<string, any[]>();
    for (const item of anggaranData) {
      if (item.kd_rup) {
        const key = String(item.kd_rup);
        if (!anggaranByRup.has(key)) anggaranByRup.set(key, []);
        anggaranByRup.get(key)!.push(item);
      }
    }

    const nonTenderMap = new Map<string, any>();
    for (const item of nonTenderData) {
      if (item.kd_rup) nonTenderMap.set(String(item.kd_rup), item);
    }

    const swakelolaMap = new Map<string, any>();
    for (const item of paketSwakelolaData) {
      if (item.kd_rup) swakelolaMap.set(String(item.kd_rup), item);
    }

    const ppkMap = new Map<string, any>();
    for (const item of ppkData) {
      if (item.nip_nama_masked) ppkMap.set(item.nip_nama_masked, item);
      // Fallback matching logic by NIP or Name if needed
    }

    // Merge each RUP Penyedia record
    const anomalies: string[] = [];
    
    const mergedData = paketPenyediaData.map(item => {
      const enriched = { ...item };
      const kdRup = String(item.kd_rup || '');
      const kdSatker = String(item.kd_satker || '');
      const kdRupSwakelola = String(item.kd_rup_swakelola || '');

      // 1. Merge: Master Satker
      const satker = satkerMap.get(kdSatker);
      if (satker) {
        enriched.satker_status = satker.status_satker;
        enriched.satker_jenis = satker.jenis_satker;
        enriched.satker_alamat = satker.alamat;
      }

      // 2. Merge: PPK Master
      // Construct nip_nama_masked similar to what we did before
      const nip = item.nip_ppk || '';
      const nama = item.nama_ppk || '';
      let maskedKey = '';
      if (nip && nama) {
        maskedKey = `${nip} - ${nama}`;
      } else {
        maskedKey = nip || nama || '';
      }

      const ppk = ppkMap.get(maskedKey);
      if (ppk) {
        enriched.ppk_nama_lengkap = ppk.nama_lengkap;
        enriched.ppk_nip_asli = ppk.nip_asli; // Note: using nip_asli instead of nip based on ppk_master.json structure
        enriched.ppk_jabatan = ppk.jabatan;
        enriched._ppk_completed = true;
      } else {
        enriched._ppk_completed = false;
      }

      // 3. Merge: Anggaran Penyedia
      const anggarans = anggaranByRup.get(kdRup);
      if (anggarans && anggarans.length > 0) {
        enriched.anggaran_list = anggarans;
        enriched.sumber_dana_list = [...new Set(anggarans.map(a => a.sumber_dana))].join(', ');
        enriched._has_anggaran = true;
      } else {
        enriched._has_anggaran = false;
      }

      // 4. Merge: History Kaji Ulang
      const kajiList = kajiUlangByRup.get(kdRup);
      if (kajiList && kajiList.length > 0) {
        const sorted = kajiList.sort((a, b) => new Date(b.tgl_kaji_ulang).getTime() - new Date(a.tgl_kaji_ulang).getTime());
        enriched.kaji_ulang_count = kajiList.length;
        enriched.kaji_ulang_terakhir = sorted[0].tgl_kaji_ulang;
        enriched.kaji_ulang_jenis_revisi = sorted[0].jenis_revisi;
        enriched.kaji_ulang_alasan = sorted[0].alasan_kajiulang;
        enriched._has_kaji_ulang = true;
      } else {
        enriched._has_kaji_ulang = false;
      }

      // 5. Merge: Paket Swakelola
      if (kdRupSwakelola) {
        const swakelola = swakelolaMap.get(kdRupSwakelola);
        if (swakelola) {
          enriched.swakelola_nama = swakelola.nama_paket;
          enriched.swakelola_pagu = swakelola.pagu;
          enriched._has_swakelola_induk = true;
        } else {
          enriched._has_swakelola_induk = false;
        }
      }

      // 6. Merge: Realisasi Pelaksanaan (Non-Tender)
      const nontender = nonTenderMap.get(kdRup);
      if (nontender) {
        enriched.realisasi_status = nontender.status_nontender;
        enriched.realisasi_hps = nontender.hps;
        enriched.realisasi_tgl_mulai = nontender.tgl_mulai_nontender;
        enriched.realisasi_metode = nontender.mtd_pemilihan;
        enriched._has_realisasi = true;
      } else {
        enriched._has_realisasi = false;
      }

      return enriched;
    });

    // Save to disk
    await fs.mkdir(mergedDir, { recursive: true });
    const outputPath = path.resolve(mergedDir, `rup-penyedia-enriched_${tahun}.json`);
    await fs.writeFile(outputPath, JSON.stringify(mergedData, null, 2), 'utf-8');

    const duration = Date.now() - startTime;
    const result = {
      id: crypto.randomUUID(),
      type: 'rup-penyedia',
      timestamp: new Date().toISOString(),
      tahun,
      trigger,
      status: 'success',
      duration_ms: duration,
      result: {
        total_records: mergedData.length
      },
      anomalies
    };

    // We can use the same history log, but mark it with type
    await appendMergeHistory(result);
    return result;

  } catch (error: any) {
    console.error('[Merge RUP Penyedia] Error:', error);
    const result = {
      id: crypto.randomUUID(),
      type: 'rup-penyedia',
      timestamp: new Date().toISOString(),
      tahun,
      trigger,
      status: 'failed',
      duration_ms: Date.now() - startTime,
      error: error.message,
      anomalies: []
    };
    await appendMergeHistory(result);
    return result;
  }
};
