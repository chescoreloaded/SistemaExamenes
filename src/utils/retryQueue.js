/**
 * Retry Queue para sincronización con Supabase
 * Maneja reintentos automáticos cuando falla la conexión
 */

class RetryQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5 segundos
  }

  /**
   * Agregar tarea a la cola
   */
  add(task) {
    const queueItem = {
      id: `${Date.now()}-${Math.random()}`,
      task,
      retries: 0,
      addedAt: Date.now()
    };
    
    this.queue.push(queueItem);
    console.log('📥 Tarea agregada a retry queue:', queueItem.id);
    
    // Procesar inmediatamente si no está procesando
    if (!this.processing) {
      this.process();
    }
    
    return queueItem.id;
  }

  /**
   * Procesar cola de reintentos
   */
  async process() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const item = this.queue[0];

      try {
        console.log(`🔄 Procesando tarea ${item.id} (intento ${item.retries + 1}/${this.maxRetries})`);
        
        // Ejecutar tarea
        await item.task();
        
        // Éxito - remover de la cola
        this.queue.shift();
        console.log(`✅ Tarea ${item.id} completada exitosamente`);
        
      } catch (error) {
        console.error(`❌ Error en tarea ${item.id}:`, error);
        
        item.retries++;
        
        if (item.retries >= this.maxRetries) {
          // Máximo de reintentos alcanzado - remover
          console.error(`🚫 Tarea ${item.id} falló después de ${this.maxRetries} intentos`);
          this.queue.shift();
          
          // Notificar al usuario (opcional)
          this.notifyFailure(item);
        } else {
          // Esperar antes del siguiente reintento
          console.log(`⏳ Reintentando tarea ${item.id} en ${this.retryDelay / 1000}s...`);
          await this.delay(this.retryDelay);
        }
      }
    }

    this.processing = false;
    console.log('✅ Cola de retry procesada completamente');
  }

  /**
   * Limpiar cola
   */
  clear() {
    this.queue = [];
    this.processing = false;
    console.log('🗑️ Retry queue limpiada');
  }

  /**
   * Obtener estado de la cola
   */
  getStatus() {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      items: this.queue.map(item => ({
        id: item.id,
        retries: item.retries,
        addedAt: item.addedAt
      }))
    };
  }

  /**
   * Notificar fallo al usuario
   */
  notifyFailure(item) {
    // Esto se puede conectar a un sistema de notificaciones
    console.warn('⚠️ No se pudo sincronizar. Los datos están guardados localmente.');
    
    // Disparar evento personalizado para que la UI lo capture
    const event = new CustomEvent('retryQueueFailure', {
      detail: { itemId: item.id, retries: item.retries }
    });
    window.dispatchEvent(event);
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const retryQueue = new RetryQueue();

// Auto-procesar al cargar la página (recuperar tareas pendientes)
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('🌐 Conexión restaurada - procesando retry queue');
    retryQueue.process();
  });
}
