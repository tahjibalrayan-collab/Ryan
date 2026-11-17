const DB_NAME = 'personal_archive_media_v1';
const PDF_STORE = 'pdf_files';
const AUDIO_STORE = 'audio_files';

function openMediaDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, 2);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PDF_STORE)) {
        db.createObjectStore(PDF_STORE);
      }
      if (!db.objectStoreNames.contains(AUDIO_STORE)) {
        db.createObjectStore(AUDIO_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveBlobToStore(storeName: string, id: string, file: Blob): Promise<void> {
  const db = await openMediaDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).put(file, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function loadUrlFromStore(storeName: string, id: string): Promise<string | null> {
  try {
    const db = await openMediaDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).get(id);
      req.onsuccess = () => {
        const blob = req.result as Blob | undefined;
        if (!blob) {
          resolve(null);
          return;
        }
        resolve(URL.createObjectURL(blob));
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

async function deleteBlobFromStore(storeName: string, id: string): Promise<void> {
  try {
    const db = await openMediaDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Ignore deletion failure
  }
}

export function savePdfBlob(id: string, file: Blob): Promise<void> {
  return saveBlobToStore(PDF_STORE, id, file);
}

export function loadPdfObjectUrl(id: string): Promise<string | null> {
  return loadUrlFromStore(PDF_STORE, id);
}

export function deletePdfBlob(id: string): Promise<void> {
  return deleteBlobFromStore(PDF_STORE, id);
}

export function saveAudioBlob(id: string, file: Blob): Promise<void> {
  return saveBlobToStore(AUDIO_STORE, id, file);
}

export function loadAudioObjectUrl(id: string): Promise<string | null> {
  return loadUrlFromStore(AUDIO_STORE, id);
}

export function deleteAudioBlob(id: string): Promise<void> {
  return deleteBlobFromStore(AUDIO_STORE, id);
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

async function exportAllFromStore(storeName: string): Promise<Record<string, string>> {
  try {
    const db = await openMediaDb();
    const entries: Array<{ key: string; blob: Blob }> = await new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const result: Array<{ key: string; blob: Blob }> = [];
      const cursorReq = store.openCursor();
      cursorReq.onsuccess = () => {
        const cursor = cursorReq.result;
        if (cursor) {
          if (cursor.value instanceof Blob) {
            result.push({ key: String(cursor.key), blob: cursor.value });
          }
          cursor.continue();
        } else {
          resolve(result);
        }
      };
      cursorReq.onerror = () => reject(cursorReq.error);
    });

    const out: Record<string, string> = {};
    for (const item of entries) {
      out[item.key] = await blobToDataUrl(item.blob);
    }
    return out;
  } catch {
    return {};
  }
}

async function importAllIntoStore(
  storeName: string,
  map: Record<string, string> | undefined
): Promise<number> {
  if (!map || typeof map !== 'object') return 0;
  let restored = 0;
  for (const [id, dataUrl] of Object.entries(map)) {
    if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) continue;
    try {
      const blob = await dataUrlToBlob(dataUrl);
      await saveBlobToStore(storeName, id, blob);
      restored++;
    } catch {
      // Skip malformed entry
    }
  }
  return restored;
}

export function exportAllPdfBlobs(): Promise<Record<string, string>> {
  return exportAllFromStore(PDF_STORE);
}

export function importAllPdfBlobs(map: Record<string, string> | undefined): Promise<number> {
  return importAllIntoStore(PDF_STORE, map);
}

export function exportAllAudioBlobs(): Promise<Record<string, string>> {
  return exportAllFromStore(AUDIO_STORE);
}

export function importAllAudioBlobs(map: Record<string, string> | undefined): Promise<number> {
  return importAllIntoStore(AUDIO_STORE, map);
}
