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

  useEffect(() => {
    const handleTouchStart = (e) => {
      touchStartX.current = e.changedTouches[0].screenX;
      touchStartY.current = e.changedTouches[0].screenY;
    };

    const handleTouchEnd = (e) => {
      touchEndX.current = e.changedTouches[0].screenX;
      touchEndY.current = e.changedTouches[0].screenY;
      handleSwipe();
    };

    const handleSwipe = () => {
      const deltaX = touchEndX.current - touchStartX.current;
      const deltaY = touchEndY.current - touchStartY.current;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      // Detectar swipe horizontal (izquierda/derecha)
      if (absDeltaX > absDeltaY && absDeltaX > minSwipeDistance) {
        if (deltaX > 0) {
          // Swipe derecha (→)
          onSwipeRight?.();
        } else {
          // Swipe izquierda (←)
          onSwipeLeft?.();
        }
      }
      // Detectar swipe vertical (arriba/abajo)
      else if (absDeltaY > absDeltaX && absDeltaY > minSwipeDistance) {
        if (deltaY > 0) {
          // Swipe abajo (↓)
          onSwipeDown?.();
        } else {
          // Swipe arriba (↑)
          onSwipeUp?.();
        }
      }
    };

    // Agregar listeners
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    // Cleanup
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, minSwipeDistance]);
}

export default useSwipe;