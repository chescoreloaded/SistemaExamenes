/**
 * Polyfills para compatibilidad con librerías Node.js en el navegador
 * Específicamente para @react-pdf/renderer
 * 
 * Importar este archivo ANTES de cualquier otra cosa en main.jsx:
 * import './polyfills';
 */

import { Buffer } from 'buffer';
import process from 'process';

// ✅ Hacer Buffer disponible globalmente
window.Buffer = Buffer;
globalThis.Buffer = Buffer;

// ✅ Hacer process disponible globalmente
window.process = process;
globalThis.process = process;

// ✅ Asegurar que global apunte a globalThis
window.global = globalThis;

console.log('✅ Polyfills cargados correctamente');