const DB_NAME = 'personal_archive_pdfs_v1';
const STORE_NAME = 'pdfs';

function openPdfDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function savePdfBlob(id: string, file: File): Promise<void> {
  const db = await openPdfDb();
  const buffer = await file.arrayBuffer();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(
      { buffer, type: file.type || 'application/pdf', name: file.name },
      id
    );
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadPdfObjectUrl(id: string): Promise<string | null> {
  const db = await openPdfDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(id);
    req.onsuccess = () => {
      const record = req.result as
        | { buffer: ArrayBuffer; type: string; name: string }
        | undefined;
      if (!record) {
        resolve(null);
        return;
      }
      const blob = new Blob([record.buffer], { type: record.type || 'application/pdf' });
      resolve(URL.createObjectURL(blob));
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deletePdfBlob(id: string): Promise<void> {
  const db = await openPdfDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
