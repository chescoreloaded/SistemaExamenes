import { useEffect, useRef } from 'react';

// ... (comentarios JSDoc) ...
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
  const targetElement = useRef(null);

  useEffect(() => {
    const handleTouchStart = (e) => {
      // No registrar el swipe si el usuario está interactuando con un botón o scrollbar
      if (e.target.closest('button, a, [role="button"]')) {
        targetElement.current = null;
        return;
      }
      targetElement.current = e.target;
      touchStartX.current = e.changedTouches[0].screenX;
      touchStartY.current = e.changedTouches[0].screenY;
    };

    const handleTouchEnd = (e) => {
      if (!targetElement.current) return; // No se inició un swipe válido
      touchEndX.current = e.changedTouches[0].screenX;
      touchEndY.current = e.changedTouches[0].screenY;
      handleSwipe();
      targetElement.current = null; // Limpiar
    };

    const handleSwipe = () => {
      const deltaX = touchEndX.current - touchStartX.current;
      const deltaY = touchEndY.current - touchStartY.current;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      // ✅ **LA CORRECCIÓN CLAVE ESTÁ AQUÍ**
      // Para ser un swipe horizontal, el movimiento X debe ser:
      // 1. Mayor que la distancia mínima
      // 2. SIGNIFICATIVAMENTE MAYOR que el movimiento Y (ej. 1.5 veces mayor)
      //    Esto crea una "zona muerta" que prioriza el scroll vertical nativo.
      if (absDeltaX > minSwipeDistance && absDeltaX > absDeltaY * 1.5) {
        if (deltaX > 0) {
          onSwipeRight?.(); // Swipe derecha (→)
        } else {
          onSwipeLeft?.(); // Swipe izquierda (←)
        }
      } 
      // Para ser un swipe vertical
      else if (absDeltaY > minSwipeDistance && absDeltaY > absDeltaX * 1.5) {
        if (deltaY > 0) {
          onSwipeDown?.(); // Swipe abajo (↓)
        } else {
          onSwipeUp?.(); // Swipe arriba (↑)
        }
      }
      // Si no cumple ninguna, es un scroll diagonal o un tap, no hacemos nada.
    };

    // Usamos 'passive: true' para un mejor rendimiento de scroll
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, minSwipeDistance]);
}

export default useSwipe;