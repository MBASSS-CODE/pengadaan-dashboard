import { getDataDir } from './dataDir';
import fs from 'fs/promises';
import path from 'path';
import * as cron from 'node-cron';
import { syncEndpointData } from './dataManager';
import { processPenyediaQueue } from './penyediaManager';

// ─── Master Registry: Daftar SEMUA endpoint yang tersedia ─────────────────────
// Ini adalah "katalog" lengkap. Admin bisa mengaktifkan/menonaktifkan masing-masing.
export const endpointRegistry: Record<string, { endpoint: string; label: string; description: string }[]> = {
  tender: [
    { endpoint: 'pengumuman', label: 'Pengumuman Tender', description: 'Pengumuman paket tender' },
    { endpoint: 'peserta-tender', label: 'Peserta Tender', description: 'Daftar peserta dan pemenang tender' },
    { endpoint: 'non-tender-pengumuman', label: 'Pengumuman Non-Tender', description: 'Pengumuman paket non-tender' },
    { endpoint: 'pencatatan-non-tender', label: 'Pencatatan Non-Tender', description: 'Daftar pencatatan paket pengadaan non-tender' },
    { endpoint: 'pencatatan-non-tender-realisasi', label: 'Realisasi Non-Tender', description: 'Realisasi pencatatan non-tender' },
    { endpoint: 'pencatatan-swakelola', label: 'Pencatatan Swakelola', description: 'Daftar pencatatan paket pengadaan swakelola' },
    { endpoint: 'pencatatan-swakelola-realisasi', label: 'Realisasi Swakelola', description: 'Realisasi pencatatan pengadaan swakelola' }
  ],
  ekatalog: [
    { endpoint: 'paket-e-purchasing', label: 'Paket E-Purchasing', description: 'Paket e-Purchasing e-Katalog' },
  ],
  rup: [
    { endpoint: 'history-kaji-ulang', label: 'History Kaji Ulang', description: 'Riwayat kaji ulang paket RUP' },
    { endpoint: 'master-satker', label: 'Master Satker', description: 'Daftar satuan kerja' },
    { endpoint: 'paket-anggaran-penyedia', label: 'Anggaran Penyedia', description: 'Pagu anggaran paket penyedia' },
    { endpoint: 'paket-anggaran-swakelola', label: 'Anggaran Swakelola', description: 'Pagu anggaran paket swakelola' },
    { endpoint: 'paket-penyedia', label: 'Paket Penyedia', description: 'Detail paket penyedia, PPK, dan metode' },
    { endpoint: 'paket-swakelola', label: 'Paket Swakelola', description: 'Detail paket swakelola' },
    { endpoint: 'paket-swakelola-terumumkan', label: 'Swakelola Terumumkan', description: 'Paket swakelola yang sudah diumumkan' },
    { endpoint: 'program-master', label: 'Program Master', description: 'Daftar program master RUP' },
  ],
};

// Daftar endpoint aktif per grup (akan di-load dari file config)
let activeEndpoints: Record<string, string[]> = {};

const configPath = path.resolve(getDataDir(), 'cron_config.json');
const logsPath = path.resolve(getDataDir(), 'endpoint_logs.json');
const endpointsConfigPath = path.resolve(getDataDir(), 'endpoints_config.json');

// ─── Endpoints Config (Persistence) ───────────────────────────────────────────

/**
 * Load active endpoints config from file, or generate default (all enabled)
 */
export const loadEndpointsConfig = async (): Promise<Record<string, string[]>> => {
  try {
    const data = await fs.readFile(endpointsConfigPath, 'utf-8');
    activeEndpoints = JSON.parse(data);
    return activeEndpoints;
  } catch (e) {
    // File doesn't exist yet — default: semua endpoint di registry aktif
    const defaultConfig: Record<string, string[]> = {};
    for (const [group, items] of Object.entries(endpointRegistry)) {
      defaultConfig[group] = items.map(i => i.endpoint);
    }
    activeEndpoints = defaultConfig;
    // Persist default config
    await saveEndpointsConfig(defaultConfig);
    return defaultConfig;
  }
};

/**
 * Save active endpoints config to file
 */
export const saveEndpointsConfig = async (config: Record<string, string[]>): Promise<void> => {
  const dir = path.dirname(endpointsConfigPath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(endpointsConfigPath, JSON.stringify(config, null, 2), 'utf-8');
  activeEndpoints = config;
};

/**
 * Get the currently active endpoints (from memory, loaded at startup)
 */
export const getActiveEndpoints = (): Record<string, string[]> => {
  return activeEndpoints;
};

// Default config
let currentScheduleStr = '0 6,12 * * *';
let currentTask: cron.ScheduledTask | null = null;
let penyediaTask: cron.ScheduledTask | null = null;

export const getCronConfig = async () => {
  try {
    const data = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return { schedule: '0 6,12 * * *' };
  }
};

export const saveCronConfig = async (newConfig: { schedule?: string, enablePenyedia?: boolean, enableMainCron?: boolean }) => {
  const currentConfig = await getCronConfig();
  const config = { ...currentConfig, ...newConfig };
  const dir = path.dirname(configPath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
  await reloadCronJob();
  return config;
};

export const getEndpointLogs = async () => {
  try {
    const data = await fs.readFile(logsPath, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

export const logEndpointActivity = async (group: string, endpoint: string, status: string, count: number, year: string = 'N/A') => {
  const logs = await getEndpointLogs();
  const timestamp = new Date().toISOString();
  
  const existingIdx = logs.findIndex((l: any) => l.group === group && l.endpoint === endpoint && l.year === year);
  const newLog = { group, endpoint, year, status, count, lastUpdated: timestamp };
  
  if (existingIdx !== -1) {
    logs[existingIdx] = newLog;
  } else {
    logs.push(newLog);
  }
  
  const dir = path.dirname(logsPath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(logsPath, JSON.stringify(logs, null, 2), 'utf-8');
};

export const triggerSyncAll = async () => {
  const currentYear = new Date().getFullYear();
  const yearsToSync = [currentYear.toString(), (currentYear - 1).toString()];
  
  // Do not block the caller, run in background
  setTimeout(async () => {
    for (const year of yearsToSync) {
      for (const [group, endpoints] of Object.entries(activeEndpoints)) {
        if (!endpoints) continue;
        for (const endpoint of endpoints) {
          try {
            const data = await syncEndpointData(group, endpoint, year);
            await logEndpointActivity(group, endpoint, `Success`, data.length, year);
          } catch (error) {
            console.error(`[${new Date().toLocaleString('id-ID')}] [Manual Sync] Gagal melakukan sinkronisasi ${group}/${endpoint} tahun ${year}:`, error);
            await logEndpointActivity(group, endpoint, `Error`, 0, year);
          }
        }
      }
    }
  }, 100);
};

export const reloadCronJob = async () => {
  const config = await getCronConfig();
  if (currentTask) {
    currentTask.stop();
  }
  
  currentScheduleStr = config.schedule || '0 6,12 * * *';
  const isPenyediaEnabled = config.enablePenyedia !== false;
  const isMainCronEnabled = config.enableMainCron !== false;
  
  if (isMainCronEnabled) {
    currentTask = cron.schedule(currentScheduleStr, async () => {
      console.log(`[${new Date().toLocaleString('id-ID')}] [Cron Job] Memulai sinkronisasi data otomatis dengan jadwal:`, currentScheduleStr);
      const currentYear = new Date().getFullYear();
      const yearsToSync = [currentYear.toString(), (currentYear - 1).toString()];

      for (const year of yearsToSync) {
        for (const [group, endpoints] of Object.entries(activeEndpoints)) {
          if (!endpoints) continue;
          for (const endpoint of endpoints) {
            try {
              const data = await syncEndpointData(group, endpoint, year);
              await logEndpointActivity(group, endpoint, `Success`, data.length, year);
            } catch (error) {
              console.error(`[${new Date().toLocaleString('id-ID')}] [Cron Job] Gagal melakukan sinkronisasi ${group}/${endpoint} tahun ${year}:`, error);
              await logEndpointActivity(group, endpoint, `Error`, 0, year);
            }
          }
        }
      }
    });
    console.log(`[${new Date().toLocaleString('id-ID')}] [Cron Job] Diperbarui dengan jadwal:`, currentScheduleStr, '(Status: Aktif)');
  } else {
    console.log(`[${new Date().toLocaleString('id-ID')}] [Cron Job] Sinkronisasi otomatis (Main) dimatikan.`);
  }

  if (penyediaTask) {
    penyediaTask.stop();
  }
  
  // Run processPenyediaQueue every 15 minutes
  penyediaTask = cron.schedule('*/15 * * * *', async () => {
    if (!isPenyediaEnabled) {
      console.log(`[${new Date().toLocaleString('id-ID')}] [Cron Job] Antrean penyedia dilewati (Cron dimatikan).`);
      return;
    }
    try {
      await processPenyediaQueue();
    } catch (error) {
      console.error(`[${new Date().toLocaleString('id-ID')}] [Cron Job] Gagal menjalankan queue penyedia:`, error);
    }
  });
  console.log(`[${new Date().toLocaleString('id-ID')}] [Cron Job] Penyedia queue diset jadwal: */15 * * * * (Status: ${isPenyediaEnabled ? 'Aktif' : 'Mati'})`);
};
