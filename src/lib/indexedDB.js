/**
 * IndexedDB Wrapper para persistencia local
 * Guarda estado de exámenes, flashcards y gamificación
 */

const DB_NAME = 'InovaCodeDB';
const DB_VERSION = 2; // ✅ Incrementado para agregar nuevos stores
const STORE_EXAM_SESSIONS = 'examSessions';
const STORE_FLASHCARD_PROGRESS = 'flashcardProgress';
const STORE_ACHIEVEMENTS = 'achievements'; // ✅ NUEVO
const STORE_USER_POINTS = 'userPoints'; // ✅ NUEVO
const STORE_STREAKS = 'streaks'; // ✅ NUEVO
const STORE_STATS = 'stats'; // ✅ NUEVO

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
        const oldVersion = event.oldVersion;

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

        // ✅ NUEVO: Store para logros desbloqueados
        if (!db.objectStoreNames.contains(STORE_ACHIEVEMENTS)) {
          const achievementStore = db.createObjectStore(STORE_ACHIEVEMENTS, { 
            keyPath: 'achievementId' 
          });
          achievementStore.createIndex('unlockedAt', 'unlockedAt', { unique: false });
          achievementStore.createIndex('category', 'category', { unique: false });
        }

        // ✅ NUEVO: Store para puntos y XP del usuario
        if (!db.objectStoreNames.contains(STORE_USER_POINTS)) {
          db.createObjectStore(STORE_USER_POINTS, { 
            keyPath: 'id' // Solo habrá un registro con id='user'
          });
        }

        // ✅ NUEVO: Store para rachas (streaks)
        if (!db.objectStoreNames.contains(STORE_STREAKS)) {
          const streakStore = db.createObjectStore(STORE_STREAKS, { 
            keyPath: 'type' // 'daily', 'correct_answers', etc
          });
          streakStore.createIndex('lastUpdate', 'lastUpdate', { unique: false });
        }

        // ✅ NUEVO: Store para estadísticas históricas
        if (!db.objectStoreNames.contains(STORE_STATS)) {
          const statsStore = db.createObjectStore(STORE_STATS, { 
            keyPath: 'id',
            autoIncrement: true
          });
          statsStore.createIndex('date', 'date', { unique: false });
          statsStore.createIndex('subjectId', 'subjectId', { unique: false });
          statsStore.createIndex('type', 'type', { unique: false }); // 'exam' | 'study'
        }
      };
    });
  }

  // ==========================================
  // MÉTODOS EXISTENTES (Exámenes y Flashcards)
  // ==========================================

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
   * Obtener todas las sesiones de examen (para Analytics)
   */
  async getAllExamSessions() {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_EXAM_SESSIONS], 'readonly');
      const store = transaction.objectStore(STORE_EXAM_SESSIONS);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
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
          if (cursor.value.synced === false) {
            results.push(cursor.value);
          }
          cursor.continue();
        } else {
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
   * Obtener historial completo de exámenes
   */
  async getExamHistory() {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_EXAM_SESSIONS], 'readonly');
      const store = transaction.objectStore(STORE_EXAM_SESSIONS);
      const request = store.getAll();

      request.onsuccess = () => {
        const sessions = request.result || [];
        // Ordenar por fecha descendente
        sessions.sort((a, b) => (b.date || b.timestamp || 0) - (a.date || a.timestamp || 0));
        resolve(sessions);
      };
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

  // ==========================================
  // ✅ NUEVOS MÉTODOS - GAMIFICACIÓN
  // ==========================================

  /**
   * Desbloquear logro
   */
  async unlockAchievement(achievementData) {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_ACHIEVEMENTS], 'readwrite');
      const store = transaction.objectStore(STORE_ACHIEVEMENTS);
      
      const data = {
        ...achievementData,
        unlockedAt: Date.now()
      };

      const request = store.put(data);
      request.onsuccess = () => {
        console.log('🏆 Logro desbloqueado:', achievementData.achievementId);
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Obtener todos los logros desbloqueados
   */
  async getUnlockedAchievements() {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_ACHIEVEMENTS], 'readonly');
      const store = transaction.objectStore(STORE_ACHIEVEMENTS);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Verificar si un logro está desbloqueado
   */
  async isAchievementUnlocked(achievementId) {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_ACHIEVEMENTS], 'readonly');
      const store = transaction.objectStore(STORE_ACHIEVEMENTS);
      const request = store.get(achievementId);

      request.onsuccess = () => resolve(!!request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Obtener o crear puntos del usuario
   */
  async getUserPoints() {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_USER_POINTS], 'readonly');
      const store = transaction.objectStore(STORE_USER_POINTS);
      const request = store.get('user');

      request.onsuccess = () => {
        const data = request.result || {
          id: 'user',
          totalXP: 0,
          level: 1,
          currentLevelXP: 0,
          totalCorrectAnswers: 0,
          totalWrongAnswers: 0,
          totalExamsCompleted: 0,
          totalStudySessions: 0,
          lastUpdated: Date.now()
        };
        resolve(data);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Actualizar puntos del usuario
   */
  async updateUserPoints(pointsData) {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_USER_POINTS], 'readwrite');
      const store = transaction.objectStore(STORE_USER_POINTS);
      
      const data = {
        id: 'user',
        ...pointsData,
        lastUpdated: Date.now()
      };

      const request = store.put(data);
      request.onsuccess = () => {
        console.log('💎 Puntos actualizados:', data.totalXP, 'XP');
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Agregar XP al usuario
   */
  async addXP(xpAmount, reason = '') {
    const currentPoints = await this.getUserPoints();
    const newTotalXP = currentPoints.totalXP + xpAmount;
    
    // Calcular nivel y XP del nivel actual
    const { level, currentLevelXP } = this.calculateLevel(newTotalXP);
    
    const updatedPoints = {
      ...currentPoints,
      totalXP: newTotalXP,
      level,
      currentLevelXP
    };

    await this.updateUserPoints(updatedPoints);
    
    console.log(`✨ +${xpAmount} XP ${reason ? `(${reason})` : ''}`);
    
    return {
      xpGained: xpAmount,
      totalXP: newTotalXP,
      level,
      leveledUp: level > currentPoints.level
    };
  }

  /**
   * Calcular nivel basado en XP total
   */
  calculateLevel(totalXP) {
    // Fórmula: Cada nivel requiere level * 100 XP
    // Nivel 1: 0-100 XP
    // Nivel 2: 100-300 XP (necesitas 200 XP más)
    // Nivel 3: 300-600 XP (necesitas 300 XP más)
    let level = 1;
    let xpNeeded = 0;
    let currentLevelXP = totalXP;

    while (currentLevelXP >= level * 100) {
      currentLevelXP -= level * 100;
      xpNeeded += level * 100;
      level++;
    }

    return { 
      level, 
      currentLevelXP, 
      xpForNextLevel: level * 100,
      totalXPForNextLevel: xpNeeded + (level * 100)
    };
  }

  /**
   * Obtener o crear racha
   */
  async getStreak(type = 'daily') {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_STREAKS], 'readonly');
      const store = transaction.objectStore(STORE_STREAKS);
      const request = store.get(type);

      request.onsuccess = () => {
        const data = request.result || {
          type,
          current: 0,
          best: 0,
          lastUpdate: null
        };
        resolve(data);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Actualizar racha
   */
  async updateStreak(type, count) {
    await this.ensureDB();
    const currentStreak = await this.getStreak(type);
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_STREAKS], 'readwrite');
      const store = transaction.objectStore(STORE_STREAKS);
      
      const data = {
        type,
        current: count,
        best: Math.max(count, currentStreak.best),
        lastUpdate: Date.now()
      };

      const request = store.put(data);
      request.onsuccess = () => {
        console.log(`🔥 Racha ${type}: ${count}`);
        resolve(data);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Guardar estadística de sesión
   */
  async saveStats(statsData) {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_STATS], 'readwrite');
      const store = transaction.objectStore(STORE_STATS);
      
      const data = {
        ...statsData,
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        timestamp: Date.now()
      };

      const request = store.add(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Obtener estadísticas por rango de fechas
   */
  async getStatsByDateRange(startDate, endDate) {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_STATS], 'readonly');
      const store = transaction.objectStore(STORE_STATS);
      const index = store.index('date');
      const range = IDBKeyRange.bound(startDate, endDate);
      const request = index.getAll(range);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Obtener estadísticas por materia
   */
  async getStatsBySubject(subjectId) {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_STATS], 'readonly');
      const store = transaction.objectStore(STORE_STATS);
      const index = store.index('subjectId');
      const request = index.getAll(subjectId);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // ==========================================
  // UTILIDADES
  // ==========================================

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

  /**
   * Resetear toda la gamificación (útil para testing)
   */
  async resetGamification() {
    await this.ensureDB();
    
    const transaction = this.db.transaction(
      [STORE_ACHIEVEMENTS, STORE_USER_POINTS, STORE_STREAKS], 
      'readwrite'
    );
    
    transaction.objectStore(STORE_ACHIEVEMENTS).clear();
    transaction.objectStore(STORE_USER_POINTS).clear();
    transaction.objectStore(STORE_STREAKS).clear();
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        console.log('🗑️ Gamificación reseteada');
        resolve(true);
      };
      transaction.onerror = () => reject(transaction.error);
    });
  }
}

// Singleton instance
export const dbManager = new IndexedDBManager();

// Exportar funciones individuales para conveniencia
export const getExamHistory = () => dbManager.getExamHistory();

// Auto-inicializar
dbManager.init().catch(err => {
  console.error('❌ Error inicializando IndexedDB:', err);
});