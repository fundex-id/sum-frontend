// src/utils/url.ts

const S3_STORAGE_BASE_URL = (import.meta.env.VITE_S3_STORAGE_BASE_URL ?? '').replace(/\/+$/, '');

/**
 * Membentuk full URL file S3 dari nilai yang tersimpan di DB.
 * - Jika nilainya sudah full URL (http/https), dikembalikan apa adanya.
 * - Jika berupa key relatif (mis. "repayment_security/contract_xxx.pdf"),
 *   digabung dengan S3_STORAGE_BASE_URL.
 */
export function resolveS3Url(value: string | null | undefined): string | null {
  if (!value) return null;

  // Sudah full URL, tidak perlu digabung lagi
  if (/^https?:\/\//i.test(value)) return value;

  const key = value
    .replace(/^\/+/, '')
    .split('/')
    .map(encodeURIComponent)
    .join('/');

  return `${S3_STORAGE_BASE_URL}/${key}`;
}