import { useState, useEffect, useCallback, useRef } from 'react';
import useSoundPackage from 'use-sound'; // Asegúrate de tener instalado 'use-sound'

// Importa tus archivos de sonido
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
import flipSfx from '/sounds/11_playFlashcardFlip.mp3';

export function useSound() {
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false); // ✅ Fix para Autoplay Policy

  // Ref para evitar que el mismo sonido se dispare múltiples veces en ms (Debounce)
  const lastPlayedRef = useRef({ id: null, time: 0 });

  useEffect(() => {
    const savedMuted = localStorage.getItem('soundMuted');
    if (savedMuted !== null) setIsMuted(JSON.parse(savedMuted));
    
    const savedVolume = localStorage.getItem('soundVolume');
    if (savedVolume !== null) setVolume(parseFloat(savedVolume));
  }, []);

  // ✅ Función crítica: Desbloquea el AudioContext en la primera interacción
  const unlockAudio = useCallback(() => {
    if (!audioUnlocked) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        ctx.resume().then(() => {
          setAudioUnlocked(true);
          ctx.close(); // Solo lo queremos para despertar al navegador
        }).catch(e => console.error("Audio unlock failed", e));
      }
    }
  }, [audioUnlocked]);

  const soundOptions = {
    volume,
    interrupt: true,
    soundEnabled: !isMuted, // use-sound manejará esto, pero controlamos la llamada abajo
  };

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

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    localStorage.setItem('soundMuted', JSON.stringify(newMuted));
    // Al intentar activar sonido, aprovechamos para desbloquear
    if (!newMuted) unlockAudio();
  };

  const changeVolume = (newVolume) => {
    setVolume(newVolume);
    localStorage.setItem('soundVolume', newVolume.toString());
    unlockAudio(); // Ajustar volumen cuenta como interacción
  };
  
  // ✅ Wrapper Inteligente con Anti-Rebote y Unlock
  const playWrapper = (playFn, soundId) => {
    if (isMuted) return;

    // Intentar desbloquear siempre que se pide un sonido (por si acaso)
    unlockAudio();

    const now = Date.now();
    // Si el mismo sonido (ID) se pide en menos de 50ms, lo ignoramos (fix doble renders)
    if (lastPlayedRef.current.id === soundId && (now - lastPlayedRef.current.time < 50)) {
      return;
    }

    if (playFn) {
      playFn();
      lastPlayedRef.current = { id: soundId, time: now };
    }
  };

  return {
    isMuted,
    volume,
    toggleMute,
    changeVolume,
    unlockAudio, // Exportamos por si quieres poner un botón "Activar Audio" explícito
    
    // IDs únicos para el debounce
    playClick: () => playWrapper(playClick, 'click'),
    playPageTransition: () => playWrapper(playPageTransition, 'transition'),
    playTest: () => playWrapper(playTest, 'test'),
    playCorrect: () => playWrapper(playCorrect, 'correct'),
    playIncorrect: () => playWrapper(playIncorrect, 'incorrect'),
    playAchievement: () => playWrapper(playAchievement, 'achievement'),
    playLevelUp: () => playWrapper(playLevelUp, 'levelup'),
    playStreak: () => playWrapper(playStreak, 'streak'),
    playExamCompleteSuccess: () => playWrapper(playExamCompleteSuccess, 'exam_success'),
    playExamCompleteFail: () => playWrapper(playExamCompleteFail, 'exam_fail'),
    playFlashcardFlip: () => playWrapper(playFlashcardFlip, 'flip'),
  };
}