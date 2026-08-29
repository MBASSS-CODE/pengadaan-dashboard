const fs = require('fs');
const files = [
  'server/utils/mergeManager.ts',
  'server/utils/dataManager.ts',
  'server/utils/ppkManager.ts',
  'server/utils/penyediaManager.ts',
  'server/utils/cronManager.ts',
  'server/api/summary-table/analytics-summary.get.ts',
  'server/api/summary-table/epurchasing.get.ts',
  'server/api/summary-table/epurchasing-analytics-summary.get.ts',
  'server/api/summary-table/nontender-analytics-summary.get.ts',
  'server/api/summary-table/pencatatan-analytics-summary.get.ts',
  'server/api/summary-table/rup-penyedia-enriched.get.ts',
  'server/api/summary-table/rup-swakelola-analytics-summary.get.ts',
  'server/api/summary-table/swakelola-analytics-summary.get.ts',
  'server/api/data/merged/pencatatan-swakelola-enriched.get.ts',
  'server/api/data/merged/pencatatan-nontender-enriched.get.ts',
  'server/api/admin/merge-pencatatan-swakelola-status.get.ts',
  'server/api/admin/data-import.post.ts',
  'server/api/admin/data-backup.get.ts'
];
for(const f of files) {
  try {
    let content = fs.readFileSync(f, 'utf8');
    if (content.includes('getDataDir()') && !content.includes('import { getDataDir }')) {
        let importStmt = '';
        if(f.includes('server/utils/')) importStmt = "import { getDataDir } from './dataDir';\n";
        else if(f.includes('server/api/summary-table/')) importStmt = "import { getDataDir } from '../../utils/dataDir';\n";
        else if(f.includes('server/api/admin/')) importStmt = "import { getDataDir } from '../../utils/dataDir';\n";
        else if(f.includes('server/api/data/merged/')) importStmt = "import { getDataDir } from '../../../utils/dataDir';\n";
        
        fs.writeFileSync(f, importStmt + content);
        console.log('Added import to ' + f);
    }
  } catch(e) {
    console.error(e);
  }
}
