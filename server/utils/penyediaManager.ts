import fs from 'fs/promises';
import path from 'path';
import { pool, initDB } from './db';

const formatDateTime = (date: Date) => date.toISOString().slice(0, 19).replace('T', ' ');

/**
 * Get unique kode_penyedia from ekatalog and save directly to Database as PENDING
 */
export const extractAndSavePenyedia = async (tahun: string): Promise<number> => {
  const filePath = path.resolve(process.cwd(), `server/data/ekatalog/paket-e-purchasing_${tahun}.json`);
  const allPenyedia = new Set<string>();

  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    const data: any = JSON.parse(raw);
    const dataArray = Array.isArray(data) ? data : (data?.data && Array.isArray(data.data) ? data.data : []);

    dataArray.forEach((d: any) => {
      if (d.kode_penyedia) {
        allPenyedia.add(d.kode_penyedia);
      }
    });
  } catch (e) {
    console.warn(`[PenyediaManager] Gagal membaca data e-purchasing tahun ${tahun} untuk ekstraksi:`, (e as Error).message);
    return 0;
  }

  const penyediaList = [...allPenyedia];
  if (penyediaList.length === 0) return 0;

  console.log(`[PenyediaManager] Mengekstrak ${penyediaList.length} kode_penyedia unik, memproses ke database...`);
  await initDB();

  // Bulk Insert into DB using INSERT IGNORE to skip existing records
  const connection = await pool.getConnection();
  let insertedCount = 0;
  
  try {
    await connection.beginTransaction();
    const now = formatDateTime(new Date());

    // Chunk the inserts to avoid query too large errors (max 1000 per chunk)
    const chunkSize = 1000;
    for (let i = 0; i < penyediaList.length; i += chunkSize) {
      const chunk = penyediaList.slice(i, i + chunkSize);
      
      const placeholders = chunk.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
      const values = chunk.flatMap(kode => [
        kode,
        null, // nama_penyedia
        null, // npwp
        null, // alamat
        'PENDING', // status_api
        0, // retry_count
        now, // created_at
        now  // updated_at
      ]);

      const query = `
        INSERT IGNORE INTO penyedia_master 
        (kode_penyedia, nama_penyedia, npwp, alamat, status_api, retry_count, created_at, updated_at) 
        VALUES ${placeholders}
      `;
      
      const [result]: any = await connection.query(query, values);
      insertedCount += result.affectedRows;
    }

    await connection.commit();
    console.log(`[PenyediaManager] Sukses memasukkan ${insertedCount} antrean baru penyedia.`);
  } catch (error) {
    await connection.rollback();
    console.error(`[PenyediaManager] Error saat bulk insert penyedia:`, error);
  } finally {
    connection.release();
  }

  return insertedCount;
};

/**
 * Background job to process pending API requests
 */
export const processPenyediaQueue = async (): Promise<void> => {
  const token = process.env.NUXT_API_DATA_TOKEN || process.env.API_DATA_TOKEN || ''; 
  const BASE_URL = process.env.INPROC_API || 'https://data.inaproc.id/api/v1';

  if (!token) {
    console.warn('[PenyediaManager] Token API tidak diset (process.env.API_DATA_TOKEN kosong), melewati proses antrean.');
    return;
  }

  await initDB();
  console.log(`[PenyediaManager] Menjalankan background job antrean API Penyedia...`);

  const connection = await pool.getConnection();
  try {
    // Ambil max 50 pending request (atau failed yang retry_count < 3)
    const [rows]: any = await connection.query(`
      SELECT kode_penyedia, retry_count FROM penyedia_master 
      WHERE status_api = 'PENDING' OR (status_api = 'FAILED' AND retry_count < 3)
      LIMIT 10
    `);

    if (rows.length === 0) {
      console.log(`[PenyediaManager] Tidak ada antrean penyedia.`);
      return;
    }

    console.log(`[PenyediaManager] Memproses ${rows.length} penyedia...`);

    for (const row of rows) {
      const kode = row.kode_penyedia;
      try {
        // Pemanggilan API.
        const response: any = await $fetch(`${BASE_URL}/ekatalog/penyedia-detail`, {
          params: { kode_penyedia: kode },
          headers: { 'Authorization': `Bearer ${token}` },
          retry: 1
        });
        
        if (response?.success && Array.isArray(response.data) && response.data.length > 0) {
          const detail = response.data[0];
          
          // Update DB jika sukses
          await connection.query(`
            UPDATE penyedia_master 
            SET nama_penyedia = ?, npwp = ?, alamat = ?, telepon = ?, email = ?, 
                jenis_perusahaan = ?, bentuk_usaha = ?, status_umkk = ?, status_aktif = ?, nib = ?,
                status_api = 'SUCCESS', updated_at = ?
            WHERE kode_penyedia = ?
          `, [
            detail.nama_penyedia || '',
            detail.npwp_penyedia || '',
            detail.alamat_penyedia || '',
            detail.telepon || null,
            detail.email || null,
            detail.jenis_perusahaan || null,
            detail.bentuk_usaha || null,
            detail.status_umkk !== undefined ? detail.status_umkk : null,
            detail.status_aktif || null,
            detail.nib || null,
            formatDateTime(new Date()),
            kode
          ]);
        } else {
          throw new Error('Data penyedia tidak ditemukan di API');
        }
        
      } catch (error: any) {
        console.error(`[PenyediaManager] Gagal menarik data penyedia ${kode}:`, error.message);
        
        // Update DB jika gagal
        await connection.query(`
          UPDATE penyedia_master 
          SET status_api = 'FAILED', retry_count = retry_count + 1, updated_at = ?
          WHERE kode_penyedia = ?
        `, [
          formatDateTime(new Date()),
          kode
        ]);
      }
    }

    console.log(`[PenyediaManager] Selesai memproses antrean penyedia.`);
  } catch (error) {
    console.error(`[PenyediaManager] Error saat menjalankan background job:`, error);
  } finally {
    connection.release();
  }
};

/**
 * Load all penyedia master data for the dashboard list
 */
export const loadPenyediaMaster = async (): Promise<any[]> => {
  try {
    await initDB();
    const [rows] = await pool.query('SELECT * FROM penyedia_master ORDER BY created_at DESC');
    return rows as any[];
  } catch (e) {
    console.error('Failed to load Penyedia Master from DB:', e);
    return [];
  }
};

/**
 * Check if e-purchasing file exists for a given year (legacy support)
 */
export const checkEPurchasingExists = async (tahun: string): Promise<boolean> => {
  const filePath = path.resolve(process.cwd(), `server/data/ekatalog/paket-e-purchasing_${tahun}.json`);
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};
