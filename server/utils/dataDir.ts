import path from 'path';

/**
 * Mendapatkan direktori data yang aktif.
 * Jika USE_DEMO_DATA bernilai 'true' di environment variables, akan mengembalikan folder `server/data_demo`.
 * Jika tidak, akan mengembalikan folder `server/data`.
 */
export const getDataDir = (): string => {
  const isDemo = process.env.USE_DEMO_DATA === 'true';
  const folderName = isDemo ? 'data_demo' : 'data';
  return path.resolve(process.cwd(), 'server', folderName);
};
