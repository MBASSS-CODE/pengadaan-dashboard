process.env.USE_DEMO_DATA = 'true';
import { 
  executeRupPenyediaMerge, 
  executeMerge, 
  executePencatatanNonTenderMerge,
  executePencatatanSwakelolaMerge,
  executeEPurchasingMerge,
  executeRupSwakelolaMerge
} from '../server/utils/mergeManager.ts';
async function run() {
  const tahun = new Date().getFullYear().toString();
  console.log('Merging demo data...');
  try {
    await executeMerge(tahun, 'demo');
    await executeRupPenyediaMerge(tahun, 'demo');
    await executeRupSwakelolaMerge(tahun, 'demo');
    await executePencatatanNonTenderMerge(tahun, 'demo');
    await executePencatatanSwakelolaMerge(tahun, 'demo');
    await executeEPurchasingMerge(tahun, 'demo');
    console.log('Merge complete!');
  } catch(e) {
    console.error(e);
  }
}
run();
