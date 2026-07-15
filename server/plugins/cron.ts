import { reloadCronJob } from '../utils/cronManager';

export default defineNitroPlugin(async (nitroApp) => {
  console.log('Mendaftarkan Cron Job Sinkronisasi Data via cronManager...');
  await reloadCronJob();
});
