// src/hooks/useSwipe.js
import { useEffect, useRef } from 'react';

/**
 * Hook para detectar gestos de swipe (deslizar) en dispositivos táctiles
 * @param {Function} onSwipeLeft - Callback cuando se desliza hacia la izquierda
 * @param {Function} onSwipeRight - Callback cuando se desliza hacia la derecha
 * @param {Function} onSwipeUp - Callback cuando se desliza hacia arriba (opcional)
 * @param {Function} onSwipeDown - Callback cuando se desliza hacia abajo (opcional)
 * @param {number} minSwipeDistance - Distancia mínima en px para detectar swipe (default: 50)
 */
export function useSwipe(
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp = null,
  onSwipeDown = null,
  minSwipeDistance = 50
) {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const touchEndY = useRef(0);
  const targetElement = useRef(null); // Para prevenir el scroll del body

  useEffect(() => {
    const handleTouchStart = (e) => {
      touchStartX.current = e.changedTouches[0].screenX;
      touchStartY.current = e.changedTouches[0].screenY;
      targetElement.current = e.target; // Guarda el elemento que se tocó
    };

    const handleTouchEnd = (e) => {
      touchEndX.current = e.changedTouches[0].screenX;
      touchEndY.current = e.changedTouches[0].screenY;
      handleSwipe(e);
    };

    const handleSwipe = (e) => {
      const deltaX = touchEndX.current - touchStartX.current;
      const deltaY = touchEndY.current - touchStartY.current;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      // ✅ **LA CORRECCIÓN CLAVE ESTÁ AQUÍ**
      // Si el movimiento vertical es MÁS GRANDE que el horizontal,
      // asumimos que es un SCROLL y NO hacemos nada.
      if (absDeltaY > absDeltaX) {
        if (absDeltaY > minSwipeDistance) {
          if (deltaY > 0) {
            onSwipeDown?.(); // Swipe abajo (↓)
          } else {
            onSwipeUp?.(); // Swipe arriba (↑)
          }
        }
        return; // ¡Importante! Salir para permitir el scroll nativo
      }

      // Si el movimiento horizontal es MÁS GRANDE, es un SWIPE.
      if (absDeltaX > minSwipeDistance) {
        // Prevenir el scroll horizontal nativo si estamos swipeando
        // Esto es útil en elementos <main> que no deberían scrollear
        if (targetElement.current) {
          // e.preventDefault(); // Descomentar si el swipe horizontal causa problemas de scroll
        }
        
        if (deltaX > 0) {
          onSwipeRight?.(); // Swipe derecha (→)
        } else {
          onSwipeLeft?.(); // Swipe izquierda (←)
        }
      }
    };

    // Agregar listeners
    // Aseguramos 'passive: true' para 'touchend' para mejor rendimiento
    // 'touchstart' NO puede ser passive si queremos usar e.preventDefault()
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Cleanup
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, minSwipeDistance]);
}

export default useSwipe;