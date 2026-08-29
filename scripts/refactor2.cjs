const fs = require('fs');
const files = [
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
  'server/api/admin/merge-pencatatan-swakelola-status.get.ts'
];
for(const f of files) {
  try {
    let content = fs.readFileSync(f, 'utf8');
    let original = content;
    
    const re6 = /path\.resolve\(process\.cwd\(\),\s*['"]server['"],\s*['"]data['"],/g;
    
    if(re6.test(content)) {
      content = content.replace(re6, 'path.resolve(getDataDir(),');
      
      if(!content.includes('getDataDir')) {
        let importStmt = '';
        if(f.includes('server/api/summary-table/')) importStmt = "import { getDataDir } from '../../utils/dataDir';\n";
        else if(f.includes('server/api/admin/')) importStmt = "import { getDataDir } from '../../utils/dataDir';\n";
        else if(f.includes('server/api/data/merged/')) importStmt = "import { getDataDir } from '../../../utils/dataDir';\n";
        
        content = importStmt + content;
      }
      fs.writeFileSync(f, content);
      console.log('Updated ' + f);
    }
  } catch(e) {
    console.error(e);
  }
}
