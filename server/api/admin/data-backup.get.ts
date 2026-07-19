import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';

export default defineEventHandler(async (event) => {
  try {
    const dataDir = path.resolve(process.cwd(), 'server/data');
    
    // Pastikan direktori ada
    if (!fs.existsSync(dataDir)) {
      throw new Error('Direktori data tidak ditemukan');
    }

    const zip = new AdmZip();
    zip.addLocalFolder(dataDir);
    
    const zipBuffer = zip.toBuffer();
    
    // Set header agar browser men-download file ini
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    setResponseHeader(event, 'Content-Type', 'application/zip');
    setResponseHeader(event, 'Content-Disposition', `attachment; filename="backup-data-${timestamp}.zip"`);
    
    return zipBuffer;
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    });
  }
});
