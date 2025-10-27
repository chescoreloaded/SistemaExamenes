import { createContext, useContext } from 'react';
import { useSound } from '@/hooks/useSound';

// 1. Crear el Context
const SoundContext = createContext();

// 2. Crear el Proveedor
// Este componente llamará al hook y pasará los valores
export function SoundProvider({ children }) {
  const soundControls = useSound();

  return (
    <SoundContext.Provider value={soundControls}>
      {children}
    </SoundContext.Provider>
  );
}

// 3. Crear un hook personalizado para consumir el contexto fácilmente
export function useSoundContext() {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useSoundContext debe ser usado dentro de un SoundProvider');
  }
  return context;
}