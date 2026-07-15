import fs from 'fs/promises';
import path from 'path';

// In-memory cache
const memoryCache: Record<string, any> = {};

// Fallback base URL for the API
const BASE_URL = process.env.INPROC_API;

/**
 * Synchronize data from external API to local file and memory cache
 */
export const syncEndpointData = async (group: string, endpoint: string, tahun: string, extraParams: any = {}) => {
  const config = useRuntimeConfig();
  const token = config.apiDataToken;
  const kodeKlpd = config.apiDataKodeKlpd;

  let hasMore = true;
  let cursor = "";
  let allData: any[] = [];

  let fetchSuccess = false;

  console.log(`Starting sync for ${group}/${endpoint}...`);

  while (hasMore) {
    try {
      // Menyusun param untuk log agar Anda bisa melihat URL aslinya
      const requestParams: any = {
        tahun,
        kode_klpd: kodeKlpd,
        ...extraParams
      };
      if (cursor) requestParams.cursor = cursor;
      
      const queryString = new URLSearchParams(requestParams).toString();
      const targetUrl = `${BASE_URL}/${group}/${endpoint}?${queryString}`;
      
      console.log(`[Backend API Hit] Menghubungi: ${targetUrl}`);

      const response: any = await $fetch(`/${group}/${endpoint}`, {
        baseURL: BASE_URL,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          tahun,
          kode_klpd: kodeKlpd,
          cursor: cursor || undefined, // Send undefined if empty so it doesn't appear in query
          ...extraParams
        }
      });
      
      console.log(`[Backend API Response] Data diterima dari ${endpoint}:`, JSON.stringify(response, null, 2).substring(0, 1000) + '... (terpotong agar terminal tidak penuh)');

      fetchSuccess = true;

      // Adjust based on the actual API structure
      const items = response.data || response.list || [];
      allData = [...allData, ...items];

      // Check has_more logic, supporting meta object from new API standard
      const isHasMore = response.meta?.has_more ?? response.has_more;
      
      if (isHasMore === false || isHasMore === 'false') {
        hasMore = false;
      } else {
        // Retrieve the next cursor
        cursor = response.meta?.cursor || response.next_cursor || response.cursor;
        if (!cursor) {
          // Fallback to prevent infinite loop if has_more is true but no cursor is returned
          hasMore = false; 
        }
      }
    } catch (error) {
      console.error(`Error fetching data for ${group}/${endpoint}:`, error);
      hasMore = false; // Stop loop on error
    }
  }

  // Only write to file if at least one fetch succeeded, to avoid wiping out cache with empty arrays
  if (fetchSuccess) {
    // Ensure directory exists
    const dirPath = path.resolve(process.cwd(), `server/data/${group}`);
    // Tambahkan tahun ke nama file agar tidak bentrok
    const filePath = path.resolve(dirPath, `${endpoint}_${tahun}.json`);
    
    await fs.mkdir(dirPath, { recursive: true });
    
    // Write to JSON file
    await fs.writeFile(filePath, JSON.stringify(allData, null, 2), 'utf-8');
    console.log(`Successfully synced ${allData.length} records to ${filePath}`);

    // Save to memory cache
    const cacheKey = `${group}_${endpoint}_${tahun}`;
    memoryCache[cacheKey] = allData;
  }

  return allData;
};

/**
 * Get endpoint data by checking RAM -> File -> API
 */
export const getEndpointData = async (group: string, endpoint: string, tahun: string, extraParams: any = {}, forceRefresh: boolean = false) => {
  const cacheKey = `${group}_${endpoint}_${tahun}`;
  const dirPath = path.resolve(process.cwd(), `server/data/${group}`);
  const filePath = path.resolve(dirPath, `${endpoint}_${tahun}.json`);
  
  if (!forceRefresh) {
    // 1. Cek RAM (In-Memory Cache)
    if (memoryCache[cacheKey]) {
      console.log(`[Cache Hit - RAM] ${cacheKey}`);
      return memoryCache[cacheKey];
    }

    // 2. Cek File JSON
    try {
      const fileData = await fs.readFile(filePath, 'utf-8');
      const parsedData = JSON.parse(fileData);
      
      // Populate RAM cache for future requests
      memoryCache[cacheKey] = parsedData; 
      console.log(`[Cache Hit - File] ${cacheKey}`);
      
      return parsedData;
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        console.error(`Error reading cache file ${filePath}:`, error);
      }
      console.log(`[Cache Miss] ${cacheKey} - File not found or invalid`);
    }
  } else {
    console.log(`[Force Refresh] Memaksa pengambilan ulang data ${cacheKey} dari API...`);
  }

  // 3. Jika kosong di RAM dan File (atau jika di-refresh paksa), jalankan syncEndpointData
  return await syncEndpointData(group, endpoint, tahun, extraParams);
};

/**
 * Get precomputed dashboard data
 */
export const getDashboardPrecomputed = async (tahun: string, instansi: string, jenis?: string, view?: string) => {
  const cacheKey = `dashboard_precomputed_${tahun}_${instansi}_${jenis}_${view}`;
  
  if (memoryCache[cacheKey]) {
    console.log(`[Cache Hit - RAM] Dashboard Precomputed ${tahun} ${instansi}`);
    return memoryCache[cacheKey];
  }

  const dirPath = path.resolve(process.cwd(), 'server/data');
  const filePath = path.resolve(dirPath, `dashboard_precomputed_${tahun}_${instansi}.json`);

  try {
    const fileData = await fs.readFile(filePath, 'utf-8');
    const parsedData = JSON.parse(fileData);
    
    memoryCache[cacheKey] = parsedData;
    console.log(`[Cache Hit - File] Dashboard Precomputed`);
    return parsedData;
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      console.error(`Error reading cache file ${filePath}:`, error);
    }
  }

  // Fetch from API
  console.log(`Fetching dashboard precomputed data for ${tahun} - ${instansi}...`);
  try {
    const response: any = await $fetch('https://data.inaproc.id/dashboard-api/profil-pengadaan/precomputed', {
      params: { tahun, instansi, jenis, view }
    });
    
    await fs.mkdir(dirPath, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(response, null, 2), 'utf-8');
    
    memoryCache[cacheKey] = response;
    return response;
  } catch (error: any) {
    console.error('Error fetching dashboard precomputed:', error);
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch dashboard data' });
  }
};
