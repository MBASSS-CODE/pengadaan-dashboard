import http from 'node:http';
import https from 'node:https';
import { URL } from 'node:url';

export interface InaprocFetchOptions {
  baseURL?: string;
  method?: string;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_REDIRECTS = 3;

const buildTargetUrl = (urlPath: string, baseURL?: string, params?: Record<string, any>): URL => {
  const fullUrl = baseURL
    ? new URL(urlPath.replace(/^\/+/, ''), baseURL.endsWith('/') ? baseURL : `${baseURL}/`)
    : new URL(urlPath);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        fullUrl.searchParams.set(key, String(value));
      }
    }
  }

  return fullUrl;
};

/**
 * Perform an HTTP/HTTPS request strictly over IPv4 (family: 4).
 * Prevents dual-stack servers (such as Hostinger) from routing outbound
 * INAPROC API calls through an unwhitelisted IPv6 address.
 */
export const inaprocFetch = <T = any>(
  urlPath: string,
  options: InaprocFetchOptions = {},
  redirectCount = 0
): Promise<T> => {
  const targetUrl = buildTargetUrl(urlPath, options.baseURL, options.params);
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const client = targetUrl.protocol === 'https:' ? https : http;

  return new Promise<T>((resolve, reject) => {
    const req = client.request(
      targetUrl,
      {
        method: options.method || 'GET',
        headers: options.headers,
        family: 4,
        timeout: timeoutMs,
      },
      (res) => {
        const statusCode = res.statusCode ?? 0;

        // Follow redirects over IPv4 if needed
        if ([301, 302, 307, 308].includes(statusCode) && res.headers.location && redirectCount < MAX_REDIRECTS) {
          res.resume();
          const nextUrl = new URL(res.headers.location, targetUrl).toString();
          inaprocFetch<T>(nextUrl, { ...options, baseURL: undefined, params: undefined }, redirectCount + 1)
            .then(resolve)
            .catch(reject);
          return;
        }

        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => {
          const rawBody = Buffer.concat(chunks).toString('utf-8');

          let parsed: any = rawBody;
          try {
            parsed = JSON.parse(rawBody);
          } catch {
            // Keep raw string so callers (e.g. validateJsonResponse) can inspect HTML/text responses
          }

          if (statusCode >= 400) {
            const err = new Error(
              `HTTP ${statusCode} ${res.statusMessage || ''} - ${typeof parsed === 'object' ? JSON.stringify(parsed).slice(0, 300) : rawBody.slice(0, 300)}`
            );
            (err as any).statusCode = statusCode;
            (err as any).data = parsed;
            reject(err);
            return;
          }

          resolve(parsed as T);
        });
      }
    );

    req.on('timeout', () => {
      const timeoutErr = new Error(`Request to ${targetUrl.hostname} timed out after ${timeoutMs}ms`);
      timeoutErr.name = 'TimeoutError';
      req.destroy(timeoutErr);
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
};
