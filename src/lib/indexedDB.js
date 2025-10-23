/**
 * IndexedDB Wrapper para persistencia local
 * Guarda estado de exámenes y flashcards localmente
 */

const DB_NAME = 'InovaCodeDB';
const DB_VERSION = 1;
const STORE_EXAM_SESSIONS = 'examSessions';
const STORE_FLASHCARD_PROGRESS = 'flashcardProgress';

class IndexedDBManager {
  constructor() {
    this.db = null;
  }

  /**
   * Inicializar la base de datos
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Store para sesiones de examen
        if (!db.objectStoreNames.contains(STORE_EXAM_SESSIONS)) {
          const examStore = db.createObjectStore(STORE_EXAM_SESSIONS, { 
            keyPath: 'sessionId' 
          });
          examStore.createIndex('subjectId', 'subjectId', { unique: false });
          examStore.createIndex('timestamp', 'timestamp', { unique: false });
          examStore.createIndex('synced', 'synced', { unique: false });
        }

        // Store para progreso de flashcards
        if (!db.objectStoreNames.contains(STORE_FLASHCARD_PROGRESS)) {
          const flashcardStore = db.createObjectStore(STORE_FLASHCARD_PROGRESS, { 
            keyPath: 'sessionId' 
          });
          flashcardStore.createIndex('subjectId', 'subjectId', { unique: false });
          flashcardStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * Guardar sesión de examen
   */
  async saveExamSession(sessionData) {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_EXAM_SESSIONS], 'readwrite');
      const store = transaction.objectStore(STORE_EXAM_SESSIONS);
      
      const data = {
        ...sessionData,
        timestamp: Date.now(),
        synced: false
      };

      const request = store.put(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Obtener sesión de examen
   */
  async getExamSession(sessionId) {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_EXAM_SESSIONS], 'readonly');
      const store = transaction.objectStore(STORE_EXAM_SESSIONS);
      const request = store.get(sessionId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Obtener sesiones no sincronizadas
   */
  async getUnsyncedExamSessions() {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_EXAM_SESSIONS], 'readonly');
      const store = transaction.objectStore(STORE_EXAM_SESSIONS);
      const index = store.index('synced');
      const request = index.openCursor();
      
      const results = [];
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          // Solo agregar si synced === false
          if (cursor.value.synced === false) {
            results.push(cursor.value);
          }
          cursor.continue();
        } else {
          // Terminó de iterar
          resolve(results);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Marcar sesión como sincronizada
   */
  async markExamSessionAsSynced(sessionId) {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_EXAM_SESSIONS], 'readwrite');
      const store = transaction.objectStore(STORE_EXAM_SESSIONS);
      
      const getRequest = store.get(sessionId);
      getRequest.onsuccess = () => {
        const data = getRequest.result;
        if (data) {
          data.synced = true;
          data.syncedAt = Date.now();
          const putRequest = store.put(data);
          putRequest.onsuccess = () => resolve(true);
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve(false);
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  /**
   * Guardar progreso de flashcards
   */
  async saveFlashcardProgress(progressData) {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_FLASHCARD_PROGRESS], 'readwrite');
      const store = transaction.objectStore(STORE_FLASHCARD_PROGRESS);
      
      const data = {
        ...progressData,
        timestamp: Date.now()
      };

      const request = store.put(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Obtener progreso de flashcards
   */
  async getFlashcardProgress(sessionId) {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_FLASHCARD_PROGRESS], 'readonly');
      const store = transaction.objectStore(STORE_FLASHCARD_PROGRESS);
      const request = store.get(sessionId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Limpiar sesiones antiguas (más de 7 días)
   */
  async cleanOldSessions() {
    await this.ensureDB();
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_EXAM_SESSIONS], 'readwrite');
      const store = transaction.objectStore(STORE_EXAM_SESSIONS);
      const index = store.index('timestamp');
      const request = index.openCursor(IDBKeyRange.upperBound(sevenDaysAgo));

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          // Solo eliminar si está sincronizada
          if (cursor.value.synced) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve(true);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Eliminar sesión
   */
  async deleteExamSession(sessionId) {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_EXAM_SESSIONS], 'readwrite');
      const store = transaction.objectStore(STORE_EXAM_SESSIONS);
      const request = store.delete(sessionId);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Asegurar que la DB esté inicializada
   */
  async ensureDB() {
    if (!this.db) {
      await this.init();
    }
  }

  /**
   * Cerrar conexión
   */
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Singleton instance
export const dbManager = new IndexedDBManager();

// Auto-inicializar
dbManager.init().catch(err => {
  console.error('Error inicializando IndexedDB:', err);
});
