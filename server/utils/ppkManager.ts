import fs from 'fs/promises';
import path from 'path';
import { pool } from './db';

// In-memory cache for PPK data
let ppkCache: any[] | null = null;

/**
 * Load PPK master data from Database
 */
export const loadPpkMaster = async (): Promise<any[]> => {
  try {
    const [rows] = await pool.query('SELECT * FROM ppk_master');
    ppkCache = rows as any[];
    return ppkCache;
  } catch (e) {
    console.error('Failed to load PPK Master from DB:', e);
    return [];
  }
};

/**
 * Upsert PPK master data to DB + invalidate RAM cache
 */
export const upsertPpkMaster = async (data: any): Promise<void> => {
  const query = `
    INSERT INTO ppk_master (nip_nama_masked, nama_lengkap, nip_asli, jabatan, unit_kerja, telepon, email, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      nama_lengkap = VALUES(nama_lengkap),
      nip_asli = VALUES(nip_asli),
      jabatan = VALUES(jabatan),
      unit_kerja = VALUES(unit_kerja),
      telepon = VALUES(telepon),
      email = VALUES(email),
      updated_at = VALUES(updated_at)
  `;
  const formatDateTime = (isoString: string) => {
    if (!isoString) return null;
    try {
      const d = new Date(isoString);
      return d.toISOString().slice(0, 19).replace('T', ' ');
    } catch {
      return null;
    }
  };

  const values = [
    data.nip_nama_masked,
    data.nama_lengkap || null,
    data.nip_asli || null,
    data.jabatan || null,
    data.unit_kerja || null,
    data.telepon || null,
    data.email || null,
    formatDateTime(data.created_at) || formatDateTime(new Date().toISOString()),
    formatDateTime(data.updated_at) || formatDateTime(new Date().toISOString())
  ];
  await pool.query(query, values);
  invalidatePpkCache();
};

/**
 * Delete PPK master data from DB + invalidate RAM cache
 */
export const deletePpkMaster = async (nip_nama_masked: string): Promise<void> => {
  await pool.query('DELETE FROM ppk_master WHERE nip_nama_masked = ?', [nip_nama_masked]);
  invalidatePpkCache();
};

/**
 * Get unique PPK identifiers from various data sources (RUP and Pencatatan)
 */
export const extractUniquePpk = async (tahun: string): Promise<string[]> => {
  const sources = [
    path.resolve(process.cwd(), `server/data/rup/paket-penyedia_${tahun}.json`),
    path.resolve(process.cwd(), `server/data/rup/paket-swakelola_${tahun}.json`),
    path.resolve(process.cwd(), `server/data/tender/pencatatan-non-tender_${tahun}.json`),
    path.resolve(process.cwd(), `server/data/tender/pencatatan-swakelola_${tahun}.json`)
  ];

  const allPpk = new Set<string>();

  for (const filePath of sources) {
    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      const data: any = JSON.parse(raw);
      
      // If data is an object with 'data' array (e.g. from some API responses), handle it
      const dataArray = Array.isArray(data) ? data : (data?.data && Array.isArray(data.data) ? data.data : []);

      dataArray.forEach((d: any) => {
        if (d.nip_ppk && d.nama_ppk) {
          allPpk.add(`${d.nip_ppk} - ${d.nama_ppk}`);
        } else if (d.nip_ppk || d.nama_ppk) {
          allPpk.add(d.nip_ppk || d.nama_ppk);
        }
      });
    } catch {
      // File might not exist yet, ignore
    }
  }

  return [...allPpk];
};

/**
 * Invalidate RAM cache (called when file changes externally)
 */
export const invalidatePpkCache = () => {
  ppkCache = null;
};

/**
 * Check if RUP penyedia file exists for a given year
 */
export const checkRupExists = async (tahun: string): Promise<boolean> => {
  const filePath = path.resolve(process.cwd(), `server/data/rup/paket-penyedia_${tahun}.json`);
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};
