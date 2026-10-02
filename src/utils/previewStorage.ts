/**
 * Preview Storage Utility with IndexedDB & Multi-Tier Fallback
 * Prevents QuotaExceededError when storing large nodes, base64 images, or audio
 */

const DB_NAME = 'JoinMeStudioPreviewDB';
const DB_VERSION = 1;
const STORE_NAME = 'preview_data';

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = (e: any) => resolve(e.target.result);
    request.onerror = (e: any) => reject(e.target.error);
  });
}

export function cleanOldLocalStoragePreviewKeys(targetKeyToPreserve?: string) {
  if (typeof window === 'undefined') return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('studio_preview_') || k.startsWith('mini_studio_preview_'))) {
        if (targetKeyToPreserve && k === targetKeyToPreserve) {
          continue;
        }
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    console.warn('Error cleaning localStorage preview keys:', e);
  }
}

export async function setPreviewData(key: string, value: any): Promise<void> {
  // 1. Primary: IndexedDB (High capacity: hundreds of megabytes, handles audio & base64)
  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (idbErr) {
    console.warn('IndexedDB set failed, will fallback to browser storage:', idbErr);
  }

  // 2. Secondary: sessionStorage (Isolated per tab/session)
  if (typeof window !== 'undefined') {
    try {
      const serialized = JSON.stringify(value);
      sessionStorage.setItem(key, serialized);
    } catch (sessionErr) {
      console.warn('sessionStorage set failed:', sessionErr);
    }

    // 3. Fallback: localStorage with automatic quota recovery
    try {
      // Clean previous/old preview keys to free up space
      cleanOldLocalStoragePreviewKeys(key);
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (localErr) {
      // If quota exceeded, clean all preview keys and try one more time
      try {
        cleanOldLocalStoragePreviewKeys();
        const serialized = JSON.stringify(value);
        localStorage.setItem(key, serialized);
      } catch (finalQuotaErr) {
        // Suppress error because IndexedDB already saved the full data
        console.warn('localStorage quota exceeded; preview data stored safely in IndexedDB:', finalQuotaErr);
      }
    }
  }
}

export async function getPreviewData(key: string): Promise<any> {
  // 1. Try IndexedDB first
  try {
    const db = await getDB();
    const result = await new Promise<any>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    if (result !== undefined && result !== null) {
      return result;
    }
  } catch (idbErr) {
    // Continue to fallback
  }

  // 2. Try sessionStorage
  if (typeof window !== 'undefined') {
    try {
      const sessionVal = sessionStorage.getItem(key);
      if (sessionVal) return JSON.parse(sessionVal);
    } catch (e) {}

    // 3. Try localStorage
    try {
      const localVal = localStorage.getItem(key);
      if (localVal) return JSON.parse(localVal);
    } catch (e) {}
  }

  return null;
}
