import { useState, useEffect } from 'react';
// ✅ FIX: Renombrar la importación para evitar conflicto
import useSoundPackage from 'use-sound'; 

// Importa tus 11 archivos de sonido desde la carpeta 'public'
import clickSfx from '/sounds/1_playClick.mp3';
import transitionSfx from '/sounds/2_playPageTransition.mp3';
import testSfx from '/sounds/3_playTest.mp3';
import correctSfx from '/sounds/4_playCorrect.mp3';
import incorrectSfx from '/sounds/5_playIncorrect.mp3';
import achievementSfx from '/sounds/6_playAchievement.mp3';
import levelUpSfx from '/sounds/7_playLevelUp.mp3';
import streakSfx from '/sounds/8_playStreak.mp3';
import examSuccessSfx from '/sounds/9_playExamComplete.mp3';
import examFailSfx from '/sounds/10_playFailedExam.mp3';
import flipSfx from '/sounds/11_playFlashcardFlip.mp3'; // Asumiendo este nombre

/**
 * Hook de sonido global que carga todos los archivos de audio de la app
 * y los provee a través del SoundContext.
 */
export function useSound() { // <-- Este nombre está bien
  // Estado de mute y volumen
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);

  // Cargar estado desde localStorage
  useEffect(() => {
    const savedMuted = localStorage.getItem('soundMuted');
    if (savedMuted !== null) setIsMuted(JSON.parse(savedMuted));
    
    const savedVolume = localStorage.getItem('soundVolume');
    if (savedVolume !== null) setVolume(parseFloat(savedVolume));
  }, []);

  // Opciones comunes para todos los sonidos
  const soundOptions = {
    volume,
    interrupt: true, // Permite que un sonido corte a otro
  };

  // ✅ FIX: Usar el hook renombrado 'useSoundPackage'
  const [playClick] = useSoundPackage(clickSfx, soundOptions);
  const [playPageTransition] = useSoundPackage(transitionSfx, soundOptions);
  const [playTest] = useSoundPackage(testSfx, soundOptions);
  const [playCorrect] = useSoundPackage(correctSfx, soundOptions);
  const [playIncorrect] = useSoundPackage(incorrectSfx, soundOptions);
  const [playAchievement] = useSoundPackage(achievementSfx, soundOptions);
  const [playLevelUp] = useSoundPackage(levelUpSfx, soundOptions);
  const [playStreak] = useSoundPackage(streakSfx, soundOptions);
  const [playExamCompleteSuccess] = useSoundPackage(examSuccessSfx, soundOptions);
  const [playExamCompleteFail] = useSoundPackage(examFailSfx, soundOptions);
  const [playFlashcardFlip] = useSoundPackage(flipSfx, soundOptions);

  // --- Controles de Mute y Volumen ---
  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    localStorage.setItem('soundMuted', JSON.stringify(newMuted));
  };

  const changeVolume = (newVolume) => {
    setVolume(newVolume);
    localStorage.setItem('soundVolume', newVolume.toString());
  };
  
  // --- Wrapper para Mute ---
  const playWrapper = (playFn) => {
    // 'playFn' puede ser null si el audio aún no se ha cargado
    if (!isMuted && playFn) { 
      playFn();
    }
  };

  // Exportar todo lo que la app necesita
  return {
    isMuted,
    volume,
    toggleMute,
    changeVolume,
    
    // Exportar las funciones envueltas
    playClick: () => playWrapper(playClick),
    playPageTransition: () => playWrapper(playPageTransition),
    playTest: () => playWrapper(playTest),
    playCorrect: () => playWrapper(playCorrect),
    playIncorrect: () => playWrapper(playIncorrect),
    playAchievement: () => playWrapper(playAchievement),
    playLevelUp: () => playWrapper(playLevelUp),
    playStreak: () => playWrapper(playStreak),
    playExamCompleteSuccess: () => playWrapper(playExamCompleteSuccess),
    playExamCompleteFail: () => playWrapper(playExamCompleteFail),
    playFlashcardFlip: () => playWrapper(playFlashcardFlip),
  };
}

// El export default no es necesario si usas export nombrado
// export default useSound;