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
    let original = content;
    
    let needsImport = false;
    
    const re1 = /path\.resolve\(process\.cwd\(\),\s*['"]server\/data['"]\)/g;
    const re2 = /path\.resolve\(process\.cwd\(\),\s*['"]server['"],\s*['"]data['"]\)/g;
    const re3 = /path\.resolve\(process\.cwd\(\),\s*`server\/data\/(.+?)`\)/g;
    const re4 = /path\.resolve\(process\.cwd\(\),\s*['"]server\/data\/(.+?)['"]\)/g;
    const re5 = /path\.resolve\(process\.cwd\(\),\s*['"]server\/data['"],/g;
    
    if(re1.test(content) || re2.test(content) || re3.test(content) || re4.test(content) || re5.test(content)) {
      needsImport = true;
      content = content.replace(re1, 'getDataDir()');
      content = content.replace(re2, 'getDataDir()');
      content = content.replace(re3, 'path.resolve(getDataDir(), `$1`)');
      content = content.replace(re4, 'path.resolve(getDataDir(), \'$1\')');
      content = content.replace(re5, 'path.resolve(getDataDir(),');
    }

    if(needsImport && original !== content) {
      if(!content.includes('getDataDir')) {
        let importStmt = '';
        if(f.includes('server/utils/')) importStmt = "import { getDataDir } from './dataDir';\n";
        else if(f.includes('server/api/summary-table/')) importStmt = "import { getDataDir } from '../../utils/dataDir';\n";
        else if(f.includes('server/api/admin/')) importStmt = "import { getDataDir } from '../../utils/dataDir';\n";
        else if(f.includes('server/api/data/merged/')) importStmt = "import { getDataDir } from '../../../utils/dataDir';\n";
        
        content = importStmt + content;
      }
      fs.writeFileSync(f, content);
      console.log('Updated ' + f);
    }
  } catch(e) {
    // console.error('Error on ' + f + ': ' + e.message);
  }
}
