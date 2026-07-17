import fs from 'fs/promises';
import path from 'path';
import * as cron from 'node-cron';
import { syncEndpointData } from './dataManager';

// Daftar endpoint aktif per grup yang akan disinkronisasi secara otomatis
export const activeEndpoints: Record<string, string[]> = {
  rup: [
    'history-kaji-ulang',
    'master-satker',
    'paket-anggaran-penyedia',
    'paket-anggaran-swakelola',
    'paket-penyedia',
    'paket-swakelola',
    'paket-swakelola-terumumkan'
  ],
  ekatalog: [
    // contoh: 'list_produk'
  ]
};

const configPath = path.resolve(process.cwd(), 'server/data/cron_config.json');
const logsPath = path.resolve(process.cwd(), 'server/data/endpoint_logs.json');

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
