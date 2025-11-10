import html2canvas from 'html2canvas';

/**
 * Utilidad para capturar gráficos Chart.js como imágenes
 * Para uso en exportación a PDF con react-pdf
 * MODIFICADO: Solo captura los 3 gráficos que existen
 */

/**
 * Capturar un elemento como imagen
 * @param {string} elementId - ID del elemento a capturar
 * @param {Object} options - Opciones de captura
 * @returns {Promise<string>} Data URL de la imagen
 */
export async function captureElement(elementId, options = {}) {
  const element = document.getElementById(elementId);
  
  if (!element) {
    console.error(`Elemento con ID "${elementId}" no encontrado`);
    return null;
  }

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: options.backgroundColor || null,
      scale: options.scale || 2, // 2x para mejor calidad
      logging: false,
      useCORS: true,
      allowTaint: true,
      ...options
    });

    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error(`Error capturando elemento "${elementId}":`, error);
    return null;
  }
}

/**
 * Capturar múltiples elementos
 * @param {Array<string>} elementIds - Array de IDs de elementos
 * @param {Object} options - Opciones de captura
 * @returns {Promise<Object>} Objeto con imágenes { id: dataURL }
 */
export async function captureMultiple(elementIds, options = {}) {
  const images = {};
  
  for (const id of elementIds) {
    const image = await captureElement(id, options);
    if (image) {
      images[id] = image;
    }
  }
  
  return images;
}

/**
 * Capturar todos los gráficos del dashboard
 * MODIFICADO: Solo captura los 3 gráficos que existen
 * @param {boolean} isDark - Si está en modo oscuro
 * @returns {Promise<Object>} Objeto con todas las imágenes de gráficos
 */
export async function captureAllCharts(isDark = false) {
  const chartIds = [
    'chart-performance',
    'chart-subject',
    'chart-distribution'
    // 'chart-time' removido - no existe en la UI
  ];

  const options = {
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    scale: 2
  };

  return await captureMultiple(chartIds, options);
}

/**
 * Capturar stats cards
 * @param {boolean} isDark - Si está en modo oscuro
 * @returns {Promise<string>} Data URL de la imagen
 */
export async function captureStatsCards(isDark = false) {
  return await captureElement('stats-cards-container', {
    backgroundColor: isDark ? '#111827' : '#f9fafb',
    scale: 2
  });
}

/**
 * Capturar tabla de histórico
 * @param {boolean} isDark - Si está en modo oscuro
 * @returns {Promise<string>} Data URL de la imagen
 */
export async function captureHistoryTable(isDark = false) {
  return await captureElement('history-table-container', {
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    scale: 2
  });
}

/**
 * Esperar a que un elemento esté completamente renderizado
 * @param {string} elementId - ID del elemento
 * @param {number} timeout - Timeout en ms
 * @returns {Promise<boolean>}
 */
export function waitForElement(elementId, timeout = 5000) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const checkElement = () => {
      const element = document.getElementById(elementId);
      
      if (element) {
        // Esperar un frame adicional para asegurar render completo
        requestAnimationFrame(() => {
          resolve(true);
        });
      } else if (Date.now() - startTime > timeout) {
        console.warn(`Timeout esperando elemento "${elementId}"`);
        resolve(false);
      } else {
        setTimeout(checkElement, 100);
      }
    };
    
    checkElement();
  });
}

/**
 * Esperar a que todos los gráficos estén renderizados
 * @param {Array<string>} chartIds - Array de IDs de gráficos
 * @param {number} timeout - Timeout en ms
 * @returns {Promise<boolean>}
 */
export async function waitForCharts(chartIds, timeout = 5000) {
  const promises = chartIds.map(id => waitForElement(id, timeout));
  const results = await Promise.all(promises);
  return results.every(result => result === true);
}

/**
 * Preparar el DOM para captura
 * Útil para asegurar que todo esté visible antes de capturar
 */
export function prepareForCapture() {
  // Forzar repaint
  document.body.offsetHeight;
  
  // Esperar un frame para asegurar que todos los estilos se apliquen
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    });
  });
}

/**
 * Limpiar después de captura
 */
export function cleanupAfterCapture() {
  // Forzar garbage collection si es posible
  if (window.gc) {
    window.gc();
  }
}

/**
 * Capturar dashboard completo con manejo de errores y retries
 * MODIFICADO: Solo busca los 3 gráficos que existen
 * @param {boolean} isDark - Si está en modo oscuro
 * @param {number} maxRetries - Número máximo de reintentos
 * @returns {Promise<Object>} Objeto con todas las capturas
 */
export async function captureFullDashboard(isDark = false, maxRetries = 2) {
  let attempt = 0;
  let lastError = null;

  while (attempt < maxRetries) {
    try {
      console.log(`📸 Intento ${attempt + 1} de captura de dashboard`);
      
      // Preparar DOM
      await prepareForCapture();

      // Esperar a que los 3 gráficos estén listos
      const chartsReady = await waitForCharts([
        'chart-performance',
        'chart-subject',
        'chart-distribution'
        // 'chart-time' removido
      ], 8000); // 8 segundos de timeout

      if (!chartsReady) {
        throw new Error('No todos los gráficos están disponibles');
      }

      console.log('✅ Todos los gráficos están listos, capturando...');

      // Capturar todo
      const [charts, statsCards, historyTable] = await Promise.all([
        captureAllCharts(isDark),
        captureStatsCards(isDark),
        captureHistoryTable(isDark)
      ]);

      console.log('✅ Capturas completadas:', {
        charts: Object.keys(charts).length,
        statsCards: !!statsCards,
        historyTable: !!historyTable
      });

      // Limpiar
      cleanupAfterCapture();

      return {
        charts,
        statsCards,
        historyTable,
        success: true
      };

    } catch (error) {
      lastError = error;
      attempt++;
      console.warn(`⚠️ Intento ${attempt} fallido:`, error.message);
      
      // Esperar antes de reintentar
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  // Si llegamos aquí, todos los intentos fallaron
  console.error('❌ Error capturando dashboard después de varios intentos:', lastError);
  
  return {
    charts: {},
    statsCards: null,
    historyTable: null,
    success: false,
    error: lastError
  };
}

/**
 * Obtener dimensiones óptimas para PDF
 * @param {HTMLElement} element - Elemento a medir
 * @returns {Object} Dimensiones { width, height }
 */
export function getOptimalDimensions(element) {
  if (!element) return { width: 800, height: 600 };
  
  const rect = element.getBoundingClientRect();
  
  return {
    width: Math.ceil(rect.width),
    height: Math.ceil(rect.height)
  };
}

/**
 * Convertir imagen a blob
 * @param {string} dataURL - Data URL de la imagen
 * @returns {Blob}
 */
export function dataURLtoBlob(dataURL) {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
}

/**
 * Comprimir imagen si es muy grande
 * @param {string} dataURL - Data URL de la imagen
 * @param {number} maxSize - Tamaño máximo en KB
 * @param {number} quality - Calidad de compresión (0-1)
 * @returns {Promise<string>} Data URL comprimida
 */
export async function compressImage(dataURL, maxSize = 500, quality = 0.8) {
  const blob = dataURLtoBlob(dataURL);
  
  // Si ya es menor al tamaño máximo, retornar original
  if (blob.size / 1024 < maxSize) {
    return dataURL;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = dataURL;
  });
}

export default {
  captureElement,
  captureMultiple,
  captureAllCharts,
  captureStatsCards,
  captureHistoryTable,
  captureFullDashboard,
  waitForElement,
  waitForCharts,
  prepareForCapture,
  cleanupAfterCapture,
  getOptimalDimensions,
  dataURLtoBlob,
  compressImage
};