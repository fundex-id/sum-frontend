import { Big } from 'big.js';

/**
 * Mengonversi nilai mentah (string/number/Big) menjadi instance Big secara aman.
 * Jika input tidak valid atau kosong, akan mengembalikan Big("0").
 * * @param value - Nilai mentah yang ingin dikonversi
 * @returns Instance dari Big.js
 */
export function toSafeBig(value: string | number | Big | null | undefined): Big {
  // 1. Handle nilai kosong
  if (value === null || value === undefined || value === '') {
    return new Big('0');
  }

  // 2. Bypass jika value sudah berupa instance Big
  // Karena objek Big.js immutable, kita bisa langsung return tanpa harus cloning
  if (value instanceof Big) {
    return value;
  }

  // 3. Eksekusi konversi dengan error handling
  try {
    return new Big(value);
  } catch (error) {
    // Log error opsional jika ingin memantau input yang rusak di development
    // console.warn(`Invalid Big number format: "${value}". Defaulting to Big("0").`, error);
    return new Big('0');
  }
}
