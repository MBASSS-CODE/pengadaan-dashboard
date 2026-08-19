import { executeEPurchasingMerge } from './server/utils/mergeManager'; 

async function run() {
  console.log(await executeEPurchasingMerge('2025', 'manual'));
  console.log(await executeEPurchasingMerge('2026', 'manual'));
}

run().catch(console.error);
