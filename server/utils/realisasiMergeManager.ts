import fs from 'fs/promises';
import path from 'path';
import { loadPpkMaster } from './ppkManager';
import { loadPenyediaMaster } from './penyediaManager';

const dataDir = path.resolve(process.cwd(), 'server/data');
const cacheDir = path.resolve(dataDir, 'cache');

// In-memory cache
let realisasiCache: Record<string, any[]> = {};

export const readJsonSafe = async (filePath: string): Promise<any[]> => {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw) || [];
  } catch {
    return [];
  }
};

export const getRealisasiData = async (tahun: string, forceRefresh: boolean = false): Promise<any[]> => {
  const cacheKey = `realisasi_${tahun}`;
  const cacheFile = path.resolve(cacheDir, `${cacheKey}.json`);

  // 1. Check in-memory cache
  if (!forceRefresh && realisasiCache[cacheKey]) {
    return realisasiCache[cacheKey];
  }

  // 2. Check disk cache
  if (!forceRefresh) {
    try {
      const stat = await fs.stat(cacheFile);
      if (stat.isFile()) {
        const diskCache = await readJsonSafe(cacheFile);
        if (diskCache.length > 0) {
          realisasiCache[cacheKey] = diskCache;
          return diskCache;
        }
      }
    } catch {
      // file not found, proceed to generate
    }
  }

  console.log(`[RealisasiMergeManager] Generating merged realisasi data for ${tahun}...`);

  // 3. Load all raw files
  const ekatalog = await readJsonSafe(path.join(dataDir, 'ekatalog', `paket-e-purchasing_${tahun}.json`));
  const pctNonTender = await readJsonSafe(path.join(dataDir, 'tender', `pencatatan-non-tender_${tahun}.json`));
  const pctNonTenderReal = await readJsonSafe(path.join(dataDir, 'tender', `pencatatan-non-tender-realisasi_${tahun}.json`));
  const nonTenderPengumuman = await readJsonSafe(path.join(dataDir, 'tender', `non-tender-pengumuman_${tahun}.json`));
  const pengumuman = await readJsonSafe(path.join(dataDir, 'tender', `pengumuman_${tahun}.json`));
  const pctSwakelola = await readJsonSafe(path.join(dataDir, 'tender', `pencatatan-swakelola_${tahun}.json`));
  const pctSwakelolaReal = await readJsonSafe(path.join(dataDir, 'tender', `pencatatan-swakelola-realisasi_${tahun}.json`));
  const rupPenyedia = await readJsonSafe(path.join(dataDir, 'rup', `paket-penyedia_${tahun}.json`));
  const rupSwakelola = await readJsonSafe(path.join(dataDir, 'rup', `paket-swakelola_${tahun}.json`));
  const masterSatker = await readJsonSafe(path.join(dataDir, 'rup', `master-satker_${tahun}.json`));

  // Load masters
  const ppkMaster = await loadPpkMaster();
  const penyediaMaster = await loadPenyediaMaster();

  // 4. Build lookup maps
  const rupPenyediaMap = new Map();
  rupPenyedia.forEach(r => rupPenyediaMap.set(String(r.kd_rup), r));

  const rupSwakelolaMap = new Map();
  rupSwakelola.forEach(r => rupSwakelolaMap.set(String(r.kd_rup), r));

  const satkerMap = new Map();
  masterSatker.forEach(s => satkerMap.set(String(s.kd_satker), s));

  const ppkMap = new Map();
  ppkMaster.forEach(p => {
    if (p.nip_nama_masked) ppkMap.set(p.nip_nama_masked, p);
    if (p.nip_asli) ppkMap.set(p.nip_asli, p);
  });

  const penyediaMap = new Map();
  penyediaMaster.forEach(p => {
    if (p.kode_penyedia) penyediaMap.set(String(p.kode_penyedia), p);
    if (p.npwp) penyediaMap.set(String(p.npwp).replace(/[^a-zA-Z0-9]/g, ''), p);
  });

  const pctNonTenderRealMap = new Map();
  pctNonTenderReal.forEach(r => {
    const key = String(r.kd_nontender_pct);
    if (!pctNonTenderRealMap.has(key)) pctNonTenderRealMap.set(key, []);
    pctNonTenderRealMap.get(key).push(r);
  });

  const pctSwakelolaRealMap = new Map();
  pctSwakelolaReal.forEach(r => {
    const key = String(r.kd_swakelola_pct);
    if (!pctSwakelolaRealMap.has(key)) pctSwakelolaRealMap.set(key, []);
    pctSwakelolaRealMap.get(key).push(r);
  });

  // Helpers
  const getSatkerName = (kdSatker: string, defaultName: string) => {
    const s = satkerMap.get(String(kdSatker));
    return s ? s.nama_satker : defaultName;
  };

  const getPpkName = (nip: string, nama: string, fallback: string) => {
    const maskedKey = nip && nama ? `${nip} - ${nama}` : nip || nama;
    const p = ppkMap.get(maskedKey) || ppkMap.get(nip);
    return p ? p.nama_lengkap : fallback;
  };

  const getPenyediaDetails = (kode: string, npwp: string, fallbackName: string) => {
    const p = penyediaMap.get(String(kode)) || (npwp ? penyediaMap.get(String(npwp).replace(/[^a-zA-Z0-9]/g, '')) : null);
    return {
      nama_penyedia: p ? p.nama_penyedia || fallbackName : fallbackName,
      status_umkk: p ? p.status_umkk : null
    };
  };

  const unifiedData: any[] = [];

  // E-Katalog
  ekatalog.forEach(item => {
    if (!['COMPLETED', 'ON_PROCESS', 'PAYMENT_OUTSIDE_SYSTEM'].includes(item.status)) return;
    
    const rup = rupPenyediaMap.get(String(item.rup_code)) || {};
    const penyedia = getPenyediaDetails(item.kode_penyedia, '', '');
    
    let isPdn = false, isUmk = false;
    if (String(item.flag_minikom).toLowerCase() === 'ya' || String(item.flag_minikom).toLowerCase() === 'true') isPdn = true;
    if (penyedia.status_umkk && penyedia.status_umkk !== 'Non-UMKM' && penyedia.status_umkk !== 'Tidak Diketahui') isUmk = true;

    unifiedData.push({
      nama_instansi: 'KEMENTERIAN PENDAYAGUNAAN APARATUR NEGARA DAN REFORMASI BIROKRASI',
      nama_satuan_kerja: getSatkerName(item.kode_satker, item.nama_satker || 'MENTERI NEGARA PENDAYAGUNAAN APARATUR NEGARA - 427950'),
      kode_paket: item.order_id,
      kode_rup: item.rup_code,
      tahun_anggaran: item.fiscal_year,
      sumber_transaksi: 'E-Katalog Versi 6.0',
      sumber_dana: item.funding_source || '-',
      nama_penyedia: penyedia.nama_penyedia || '-',
      nama_ppk: getPpkName(item.rup_nip_ppk || rup.nip_ppk, item.rup_nama_ppk || rup.nama_ppk, item.rup_nama_ppk || '-'),
      metode_pengadaan: rup.metode_pengadaan || 'E-Purchasing',
      jenis_pengadaan: rup.jenis_pengadaan || '-',
      nama_paket: rup.nama_paket || item.rup_name || '-',
      status_paket: item.status === 'COMPLETED' ? 'COMPLETED' : (item.status === 'ON_PROCESS' ? 'ON PROCESS' : 'PAYMENT OUTSIDE SYSTEM'),
      tahapan_pengadaan: item.status === 'ON_PROCESS' ? 'Kontrak' : 'Serah Terima',
      total_nilai: Number(item.total) || 0,
      nilai_pdn: isPdn ? (Number(item.total) || 0) : 0,
      nilai_umk: isUmk ? (Number(item.total) || 0) : 0,
      _sort_date: item.order_date ? new Date(item.order_date).getTime() : 0
    });
  });

  // Pencatatan Non Tender
  pctNonTender.forEach(item => {
    const rup = rupPenyediaMap.get(String(item.kd_rup)) || {};
    const reals = pctNonTenderRealMap.get(String(item.kd_nontender_pct)) || [];
    
    const realisasiNilai = Number(item.total_realisasi) || 0;
    
    // Attempt to get penyedia from realisasi
    let namaPenyedia = '-';
    let isUmk = (item.nilai_umk_pct > 0 || rup.status_ukm === 'UKM' || rup.status_ukm === 'Ya');
    
    if (reals.length > 0) {
       const real = reals[0];
       const p = getPenyediaDetails('', real.npwp_penyedia, real.nama_penyedia);
       namaPenyedia = p.nama_penyedia || real.nama_penyedia || '-';
       if (p.status_umkk && p.status_umkk !== 'Non-UMKM') isUmk = true;
    }

    const isPdn = (item.nilai_pdn_pct > 0 || rup.status_pdn === 'PDN' || rup.status_pdn === 'Ya');

    unifiedData.push({
      nama_instansi: 'KEMENTERIAN PENDAYAGUNAAN APARATUR NEGARA DAN REFORMASI BIROKRASI',
      nama_satuan_kerja: getSatkerName(item.kd_satker, item.nama_satker || 'MENTERI NEGARA PENDAYAGUNAAN APARATUR NEGARA - 427950'),
      kode_paket: item.kd_nontender_pct,
      kode_rup: item.kd_rup,
      tahun_anggaran: item.tahun_anggaran,
      sumber_transaksi: 'Pencatatan Non Tender',
      sumber_dana: item.sumber_dana || '-',
      nama_penyedia: namaPenyedia,
      nama_ppk: getPpkName(item.nip_ppk, item.nama_ppk, item.nama_ppk || '-'),
      metode_pengadaan: item.mtd_pemilihan || '-',
      jenis_pengadaan: item.kategori_pengadaan || rup.jenis_pengadaan || '-',
      nama_paket: item.nama_paket || '-',
      status_paket: (item.status_nontender_pct_ket || item.status_nontender_pct || '-').toUpperCase(),
      tahapan_pengadaan: (item.status_nontender_pct_ket || '-').toUpperCase(),
      total_nilai: realisasiNilai || Number(item.pagu) || 0,
      nilai_pdn: isPdn ? (realisasiNilai || Number(item.pagu) || 0) : 0,
      nilai_umk: isUmk ? (realisasiNilai || Number(item.pagu) || 0) : 0,
      _sort_date: item.tgl_buat_paket ? new Date(item.tgl_buat_paket).getTime() : 0
    });
  });

  // Non Tender Pengumuman
  nonTenderPengumuman.forEach(item => {
    if (item.status_nontender !== 'Selesai') return;
    const rup = rupPenyediaMap.get(String(item.kd_rup)) || {};
    const nilai = Number(item.pagu) || Number(item.anggaran_total) || 0;
    const isPdn = (rup.status_pdn === 'PDN' || rup.status_pdn === 'Ya');
    const isUmk = (rup.status_ukm === 'UKM' || rup.status_ukm === 'Ya');

    unifiedData.push({
      nama_instansi: 'KEMENTERIAN PENDAYAGUNAAN APARATUR NEGARA DAN REFORMASI BIROKRASI',
      nama_satuan_kerja: getSatkerName(item.kd_satker, item.nama_satker || 'MENTERI NEGARA PENDAYAGUNAAN APARATUR NEGARA - 427950'),
      kode_paket: item.kd_nontender,
      kode_rup: item.kd_rup,
      tahun_anggaran: item.tahun_anggaran,
      sumber_transaksi: 'Non Tender',
      sumber_dana: item.sumber_dana || '-',
      nama_penyedia: item.nama_penyedia || item.pemenang || '-',
      nama_ppk: getPpkName(item.nip_ppk, item.nama_ppk, item.nama_ppk || '-'),
      metode_pengadaan: item.mtd_pemilihan || '-',
      jenis_pengadaan: item.jenis_pengadaan || rup.jenis_pengadaan || '-',
      nama_paket: item.nama_paket || '-',
      status_paket: 'SELESAI',
      tahapan_pengadaan: 'SELESAI',
      total_nilai: nilai,
      nilai_pdn: isPdn ? nilai : 0,
      nilai_umk: isUmk ? nilai : 0,
      _sort_date: item.tgl_buat_paket ? new Date(item.tgl_buat_paket).getTime() : 0
    });
  });

  // Pengumuman (Tender)
  pengumuman.forEach(item => {
    if (item.status_tender !== 'Selesai') return;
    const rup = rupPenyediaMap.get(String(item.kd_rup)) || {};
    const nilai = Number(item.pagu) || Number(item.hps) || 0;
    const isPdn = (rup.status_pdn === 'PDN' || rup.status_pdn === 'Ya');
    const isUmk = (rup.status_ukm === 'UKM' || rup.status_ukm === 'Ya');

    unifiedData.push({
      nama_instansi: 'KEMENTERIAN PENDAYAGUNAAN APARATUR NEGARA DAN REFORMASI BIROKRASI',
      nama_satuan_kerja: getSatkerName(item.kd_satker, item.nama_satker || 'MENTERI NEGARA PENDAYAGUNAAN APARATUR NEGARA - 427950'),
      kode_paket: item.kd_tender,
      kode_rup: item.kd_rup,
      tahun_anggaran: item.tahun_anggaran,
      sumber_transaksi: 'Tender',
      sumber_dana: item.sumber_dana || '-',
      nama_penyedia: '-',
      nama_ppk: getPpkName(item.nip_ppk, item.nama_ppk, item.nama_ppk || '-'),
      metode_pengadaan: item.mtd_pemilihan || 'Tender',
      jenis_pengadaan: item.jenis_pengadaan || rup.jenis_pengadaan || '-',
      nama_paket: item.nama_paket || '-',
      status_paket: 'SELESAI',
      tahapan_pengadaan: 'SELESAI',
      total_nilai: nilai,
      nilai_pdn: isPdn ? nilai : 0,
      nilai_umk: isUmk ? nilai : 0,
      _sort_date: item.tgl_buat_paket ? new Date(item.tgl_buat_paket).getTime() : 0
    });
  });

  // Pencatatan Swakelola excluded to match CSV

  // Sort descending by date
  unifiedData.sort((a, b) => b._sort_date - a._sort_date);
  
  // Remove _sort_date excluded, keep it for analytics
  const finalData = unifiedData;

  // Cache to disk and memory
  await fs.mkdir(cacheDir, { recursive: true });
  await fs.writeFile(cacheFile, JSON.stringify(finalData), 'utf-8');
  realisasiCache[cacheKey] = finalData;

  console.log(`[RealisasiMergeManager] Successfully merged ${finalData.length} records for ${tahun}.`);

  return finalData;
};
