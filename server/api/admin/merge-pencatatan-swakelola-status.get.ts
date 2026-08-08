import { getMergeHistory } from '~/server/utils/mergeManager';
import { loadPpkMaster } from '~/server/utils/ppkManager';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const tahun = (query.tahun as string) || new Date().getFullYear().toString();
    
    // We can use checkMergePrerequisites which checks MERGE_SOURCE_ENDPOINTS 
    // or just pass a custom one for Swakelola specifically, but for simplicity
    // we'll just check if the data exists
    
    const dataDir = 'server/data';
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const checkFile = async (filePath: string) => {
      try {
        const p = path.resolve(process.cwd(), filePath);
        const stats = await fs.stat(p);
        if (stats.isFile()) {
            const data = await fs.readFile(p, 'utf-8');
            const parsed = JSON.parse(data);
            return { found: true, count: Array.isArray(parsed) ? parsed.length : 0 };
        }
        return { found: false, count: 0 };
      } catch {
        return { found: false, count: 0 };
      }
    };

    const pencatatan = await checkFile(`${dataDir}/tender/pencatatan-swakelola_${tahun}.json`);
    const realisasi = await checkFile(`${dataDir}/tender/pencatatan-swakelola-realisasi_${tahun}.json`);
    const paketSwakelola = await checkFile(`${dataDir}/rup/paket-swakelola_${tahun}.json`);
    const satker = await checkFile(`${dataDir}/rup/master-satker_${tahun}.json`);
    
    // Gunakan loadPpkMaster dari DB, bukan file statis
    const ppkData = await loadPpkMaster();
    const ppk = { found: true, count: ppkData.length };
    
    const prerequisites = [
      { endpoint: 'pencatatan-swakelola', label: 'Pencatatan Swakelola', group: 'tender', required: true, found: pencatatan.found, count: pencatatan.count },
      { endpoint: 'pencatatan-swakelola-realisasi', label: 'Realisasi Swakelola', group: 'tender', required: false, found: realisasi.found, count: realisasi.count },
      { endpoint: 'paket-swakelola', label: 'RUP Swakelola', group: 'rup', required: false, found: paketSwakelola.found, count: paketSwakelola.count },
      { endpoint: 'master-satker', label: 'Master Satker', group: 'rup', required: false, found: satker.found, count: satker.count },
      { endpoint: 'ppk-master', label: 'Master PPK', group: 'admin', required: false, found: ppk.found, count: ppk.count }
    ];

    const allRequiredFound = prerequisites.filter(p => p.required).every(p => p.found);

    const history = await getMergeHistory();
    const myHistory = history.filter(h => h.type === 'pencatatan-swakelola' && h.tahun === tahun);

    return {
      success: true,
      data: {
        prerequisites,
        allRequiredFound,
        lastMerge: myHistory.length > 0 ? myHistory[0] : null,
        history: myHistory
      }
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Gagal memuat status'
    };
  }
});
