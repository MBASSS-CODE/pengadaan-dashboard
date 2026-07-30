import fs from 'fs/promises';
import path from 'path';

const ppkPath = path.resolve(process.cwd(), 'server/data/ppk_master.json');

// In-memory cache for PPK data
let ppkCache: any[] | null = null;

/**
 * Load PPK master data from file (or memory cache)
 */
export const loadPpkMaster = async (): Promise<any[]> => {
  if (ppkCache) return ppkCache;
  try {
    const data = await fs.readFile(ppkPath, 'utf-8');
    ppkCache = JSON.parse(data);
    return ppkCache!;
  } catch (e) {
    ppkCache = [];
    return [];
  }
};

/**
 * Save PPK master data to file + update RAM cache
 */
export const savePpkMaster = async (data: any[]): Promise<void> => {
  const dir = path.dirname(ppkPath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(ppkPath, JSON.stringify(data, null, 2), 'utf-8');
  ppkCache = data;
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
