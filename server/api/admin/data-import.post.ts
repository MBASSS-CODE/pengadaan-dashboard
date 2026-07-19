import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';
import { invalidatePpkCache } from '../../utils/ppkManager';

export default defineEventHandler(async (event) => {
  try {
    const formData = await readMultipartFormData(event);
    if (!formData || formData.length === 0) {
      throw new Error('Tidak ada file yang diunggah');
    }

    const file = formData.find(f => f.name === 'file');
    if (!file || !file.data) {
      throw new Error('File backup tidak ditemukan dalam form');
    }

    if (file.filename && !file.filename.endsWith('.zip')) {
      throw new Error('File harus berekstensi .zip');
    }

    const zip = new AdmZip(file.data);
    const dataDir = path.resolve(process.cwd(), 'server/data');
    
    // Pastikan direktori ada
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Ekstrak isi ZIP dan timpa (overwrite) isi lama
    zip.extractAllTo(dataDir, true);

    // Invalidate caches so the app reads fresh data from files
    invalidatePpkCache();

    return {
      success: true,
      message: 'Data berhasil di-import dan diperbarui'
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Gagal melakukan import data'
    };
  }
});
