import { LegalDocument } from '../types';

const DB_NAME = 'LegalAIDB';
const DB_VERSION = 1;
const STORE_NAME = 'documents';

// --- IndexedDB Helpers ---

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("IndexedDB error:", request.error);
      reject("Không thể mở cơ sở dữ liệu.");
    };

    request.onsuccess = (event) => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

// --- Documents Storage (Async) ---

export const saveDocument = async (doc: LegalDocument): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(doc); // put acts as upsert

    request.onsuccess = () => resolve();
    request.onerror = () => reject("Lỗi khi lưu văn bản.");
  });
};

export const saveDocuments = async (newDocs: LegalDocument[]): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    if (newDocs.length === 0) {
        resolve();
        return;
    }

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject("Lỗi khi lưu danh sách văn bản.");

    newDocs.forEach(doc => {
      store.put(doc);
    });
  });
};

export const getDocuments = async (): Promise<LegalDocument[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
        // Sort by createdAt desc manually since we used getAll
        const docs = request.result as LegalDocument[];
        docs.sort((a, b) => b.createdAt - a.createdAt);
        resolve(docs);
    };
    request.onerror = () => reject("Lỗi khi tải văn bản.");
  });
};

export const deleteDocument = async (id: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject("Lỗi khi xóa văn bản.");
  });
};

export const clearAllDocuments = async (): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject("Lỗi khi xóa toàn bộ dữ liệu.");
  });
};

// --- Backup & Restore Utils ---

export const exportData = async (): Promise<void> => {
    const docs = await getDocuments();
    const dataStr = JSON.stringify(docs, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `DINHNV_LegalAI_Backup_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export const importData = async (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const json = e.target?.result as string;
                const docs = JSON.parse(json) as LegalDocument[];
                
                if (!Array.isArray(docs)) throw new Error("File backup không hợp lệ.");
                
                // Validate structure briefly
                if (docs.length > 0 && (!docs[0].id || !docs[0].content)) {
                    throw new Error("Cấu trúc dữ liệu không khớp.");
                }

                await saveDocuments(docs);
                resolve(docs.length);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = () => reject("Không thể đọc file backup.");
        reader.readAsText(file);
    });
};