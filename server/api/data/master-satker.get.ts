import { getDataDir } from '../../utils/dataDir';
import path from 'path';
import { readJsonSafe } from '../../utils/mergeManager';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const tahun = (query.tahun as string) || new Date().getFullYear().toString();
  
  try {
    const filePath = path.resolve(getDataDir(), 'rup', `master-satker_${tahun}.json`);
    const data = await readJsonSafe(filePath);

    if (!data || !Array.isArray(data)) {
      return { success: false, message: 'Data satker tidak ditemukan', data: [] };
    }

    const satkerMap = new Map();
    for (const item of data) {
      if (item.kd_satker && item.nama_satker) {
        satkerMap.set(String(item.kd_satker), item.nama_satker);
      }
    }

    const options = Array.from(satkerMap.entries()).map(([value, label]) => ({
      value,
      label
    })).sort((a, b) => a.label.localeCompare(b.label));

    return { success: true, data: options };
  } catch (error: any) {
    return { success: false, message: error.message, data: [] };
  }
});
