import { useEffect, useRef, useCallback, useState } from 'react';
import { dbManager } from '@/lib/indexedDB';
import { retryQueue } from '@/utils/retryQueue';

/**
 * Hook de persistencia para autosave
 * Guarda automáticamente el estado cada N segundos
 */
export function usePersistence({
  sessionId,
  data,
  saveInterval = 30000, // 30 segundos
  onSave = null,
  enabled = true,
  type = 'exam' // 'exam' o 'flashcard'
}) {
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const [lastSaved, setLastSaved] = useState(null);
  const saveTimeoutRef = useRef(null);
  const lastDataRef = useRef(null);
  const isMountedRef = useRef(true);
  const saveRef = useRef(null); // ✅ NUEVO: Ref para save actualizado

  /**
   * Guardar en IndexedDB
   */
  const saveLocal = useCallback(async () => {
    if (!enabled || !sessionId) {
      console.log('⏭️ Skip saveLocal - disabled or no sessionId');
      return;
    }

    try {
      const saveData = {
        sessionId,
        ...data,
        savedAt: new Date().toISOString()
      };

      console.log('💾 Intentando guardar localmente...', { sessionId, type });

      if (type === 'exam') {
        await dbManager.saveExamSession(saveData);
      } else {
        await dbManager.saveFlashcardProgress(saveData);
      }

      console.log(`✅ Guardado local exitoso (${type}):`, sessionId);
      return true;
    } catch (error) {
      console.error('❌ Error guardando localmente:', error);
      return false;
    }
  }, [sessionId, data, enabled, type]);

  /**
   * Sincronizar con Supabase
   */
  const syncToSupabase = useCallback(async () => {
    if (!enabled || !sessionId || !onSave) return;

    try {
      // Agregar a retry queue
      retryQueue.add(async () => {
        await onSave(data);
        
        // Marcar como sincronizado en IndexedDB
        if (type === 'exam') {
          await dbManager.markExamSessionAsSynced(sessionId);
        }
        
        console.log(`☁️ Sincronizado con Supabase (${type}):`, sessionId);
      });

      return true;
    } catch (error) {
      console.error('Error sincronizando con Supabase:', error);
      return false;
    }
  }, [sessionId, data, enabled, type, onSave]);

  /**
   * Guardar (local + cloud)
   */
  const save = useCallback(async () => {
    if (!enabled || !sessionId) {
      console.log('⏭️ Skip save - disabled or no sessionId', { enabled, sessionId });
      return;
    }

    console.log('🔄 Iniciando guardado...', { sessionId, type });

    // Evitar guardados duplicados con los mismos datos
    const dataString = JSON.stringify(data);
    if (dataString === lastDataRef.current) {
      console.log('⏭️ Skip save - datos sin cambios');
      return;
    }
    lastDataRef.current = dataString;

    setSaveStatus('saving');
    console.log('💾 Estado: SAVING');

    try {
      // 1. Guardar localmente (siempre)
      await saveLocal();

      // 2. Intentar sincronizar con Supabase
      if (onSave) {
        await syncToSupabase();
      }

      if (isMountedRef.current) {
        setSaveStatus('saved');
        setLastSaved(new Date());
        console.log('✅ Estado: SAVED');
        
        // Reset a 'idle' después de 2 segundos
        setTimeout(() => {
          if (isMountedRef.current) {
            setSaveStatus('idle');
            console.log('🔄 Estado: IDLE');
          }
        }, 2000);
      }
    } catch (error) {
      console.error('❌ Error guardando:', error);
      if (isMountedRef.current) {
        setSaveStatus('error');
      }
    }
  }, [enabled, sessionId, data, saveLocal, syncToSupabase, onSave]);

  // ✅ Mantener saveRef actualizado
  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  /**
   * Autosave automático con intervalo fijo
   */
  useEffect(() => {
    if (!enabled) {
      console.log('⏭️ Autosave deshabilitado');
      return;
    }

    console.log('⏰ Iniciando autosave cada', saveInterval / 1000, 'segundos');

    // Establecer intervalo usando saveRef para tener siempre la versión actualizada
    const intervalId = setInterval(() => {
      console.log('⏰ Tick de autosave...');
      if (saveRef.current) {
        saveRef.current();
      }
    }, saveInterval);

    return () => {
      console.log('🧹 Limpiando intervalo de autosave');
      clearInterval(intervalId);
    };
  }, [enabled, saveInterval]); // Solo depende de enabled y saveInterval

  /**
   * Guardar antes de cerrar/recargar página
   */
  useEffect(() => {
    const handleBeforeUnload = async (e) => {
      if (enabled && sessionId) {
        // Guardar localmente de forma síncrona
        await saveLocal();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [enabled, sessionId, saveLocal]);

  /**
   * Cleanup
   */
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Recuperar datos al montar
   */
  const recover = useCallback(async () => {
    if (!sessionId) return null;

    try {
      let recoveredData;
      if (type === 'exam') {
        recoveredData = await dbManager.getExamSession(sessionId);
      } else {
        recoveredData = await dbManager.getFlashcardProgress(sessionId);
      }

      if (recoveredData) {
        console.log(`🔄 Datos recuperados (${type}):`, sessionId);
        return recoveredData;
      }
    } catch (error) {
      console.error('Error recuperando datos:', error);
    }

    return null;
  }, [sessionId, type]);

  /**
   * Forzar guardado manual
   */
  const forceSave = useCallback(() => {
    return save();
  }, [save]);

  return {
    save: forceSave,
    recover,
    saveStatus,
    lastSaved,
    isSaving: saveStatus === 'saving',
    isSaved: saveStatus === 'saved',
    hasError: saveStatus === 'error'
  };
}

/**
 * Hook para sincronizar sesiones no sincronizadas
 */
export function useSyncUnsynced(onSync) {
  useEffect(() => {
    const syncUnsynced = async () => {
      try {
        const unsyncedSessions = await dbManager.getUnsyncedExamSessions();
        
        if (unsyncedSessions.length > 0) {
          console.log(`🔄 Sincronizando ${unsyncedSessions.length} sesiones pendientes...`);
          
          for (const session of unsyncedSessions) {
            retryQueue.add(async () => {
              await onSync(session);
              await dbManager.markExamSessionAsSynced(session.sessionId);
              console.log(`✅ Sesión ${session.sessionId} sincronizada`);
            });
          }
        }
      } catch (error) {
        console.error('Error sincronizando sesiones:', error);
      }
    };

    // Sincronizar al montar y cuando se restaure la conexión
    syncUnsynced();

    const handleOnline = () => {
      console.log('🌐 Conexión restaurada - sincronizando sesiones pendientes');
      syncUnsynced();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [onSync]);
}
