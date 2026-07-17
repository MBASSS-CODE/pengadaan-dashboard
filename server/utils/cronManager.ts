import fs from 'fs/promises';
import path from 'path';
import * as cron from 'node-cron';
import { syncEndpointData } from './dataManager';

// ─── Master Registry: Daftar SEMUA endpoint yang tersedia ─────────────────────
// Ini adalah "katalog" lengkap. Admin bisa mengaktifkan/menonaktifkan masing-masing.
export const endpointRegistry: Record<string, { endpoint: string; label: string; description: string }[]> = {
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

const configPath = path.resolve(process.cwd(), 'server/data/cron_config.json');
const logsPath = path.resolve(process.cwd(), 'server/data/endpoint_logs.json');
const endpointsConfigPath = path.resolve(process.cwd(), 'server/data/endpoints_config.json');

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

export const getCronConfig = async () => {
  try {
    const data = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return { schedule: '0 6,12 * * *' };
  }
};

export const saveCronConfig = async (config: { schedule: string }) => {
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

export const logEndpointActivity = async (group: string, endpoint: string, status: string, count: number) => {
  const logs = await getEndpointLogs();
  const timestamp = new Date().toISOString();
  
  const existingIdx = logs.findIndex((l: any) => l.group === group && l.endpoint === endpoint);
  const newLog = { group, endpoint, status, count, lastUpdated: timestamp };
  
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
  const currentYear = new Date().getFullYear().toString();
  // Do not block the caller, run in background
  setTimeout(async () => {
    for (const [group, endpoints] of Object.entries(activeEndpoints)) {
      if (!endpoints) continue;
      for (const endpoint of endpoints) {
        try {
          const data = await syncEndpointData(group, endpoint, currentYear);
          await logEndpointActivity(group, endpoint, 'Success', data.length);
        } catch (error) {
          console.error(`[Manual Sync] Gagal melakukan sinkronisasi ${group}/${endpoint}:`, error);
          await logEndpointActivity(group, endpoint, 'Error', 0);
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
  
  currentScheduleStr = config.schedule;
  
  currentTask = cron.schedule(currentScheduleStr, async () => {
    console.log('[Cron Job] Memulai sinkronisasi data otomatis dengan jadwal:', currentScheduleStr);
    const currentYear = new Date().getFullYear().toString();

    for (const [group, endpoints] of Object.entries(activeEndpoints)) {
      if (!endpoints) continue;
      for (const endpoint of endpoints) {
        try {
          const data = await syncEndpointData(group, endpoint, currentYear);
          await logEndpointActivity(group, endpoint, 'Success', data.length);
        } catch (error) {
          console.error(`[Cron Job] Gagal melakukan sinkronisasi ${group}/${endpoint}:`, error);
          await logEndpointActivity(group, endpoint, 'Error', 0);
        }
      }
    }
  });
  console.log('[Cron Job] Diperbarui dengan jadwal:', currentScheduleStr);
};
