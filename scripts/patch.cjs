const fs = require('fs');
const file = 'server/utils/ppkManager.ts';
let code = fs.readFileSync(file, 'utf8');

const target = `export const loadPpkMaster = async (): Promise<any[]> => {
  try {
    const [rows] = await pool.query('SELECT * FROM ppk_master');`;

const replacement = `export const loadPpkMaster = async (): Promise<any[]> => {
  if (process.env.USE_DEMO_DATA === 'true') {
    try {
      const raw = await fs.promises.readFile(path.resolve(getDataDir(), 'ppk_master.json'), 'utf-8');
      ppkCache = JSON.parse(raw);
      return ppkCache || [];
    } catch (e) {
      console.error('Failed to load PPK Master from JSON:', e);
      return [];
    }
  }

  try {
    const [rows] = await pool.query('SELECT * FROM ppk_master');`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync(file, code);
    console.log('ppkManager.ts updated');
} else {
    console.log('Target not found');
}
