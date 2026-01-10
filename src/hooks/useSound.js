import { useState, useEffect, useCallback, useRef } from 'react';
import useSoundPackage from 'use-sound';

// Importa tus archivos de sonido (Rutas corregidas basadas en tu proyecto)
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
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  // Ref para evitar que el mismo sonido se dispare múltiples veces (Debounce)
  const lastPlayedRef = useRef({ id: null, time: 0 });

  useEffect(() => {
    const savedMuted = localStorage.getItem('soundMuted');
    if (savedMuted !== null) setIsMuted(JSON.parse(savedMuted));
    
    const savedVolume = localStorage.getItem('soundVolume');
    if (savedVolume !== null) setVolume(parseFloat(savedVolume));
  }, []);

  const unlockAudio = useCallback(() => {
    if (!audioUnlocked) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        ctx.resume().then(() => {
          setAudioUnlocked(true);
          ctx.close();
        }).catch(e => console.error("Audio unlock failed", e));
      }
    }
  }, [audioUnlocked]);

  const soundOptions = {
    volume,
    interrupt: true,
    soundEnabled: !isMuted,
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
    if (!newMuted) unlockAudio();
  };

  const changeVolume = (newVolume) => {
    setVolume(newVolume);
    localStorage.setItem('soundVolume', newVolume.toString());
    unlockAudio();
  };
  
  // ✅ WRAPPER BLINDADO (Anti-Rebote / Anti-Eco)
  const playWrapper = (playFn, soundId) => {
    if (isMuted) return;

    unlockAudio();

    const now = Date.now();
    
    // 🛡️ CORRECCIÓN CRÍTICA: Aumentamos de 50ms a 250ms.
    // Esto evita que si el componente se monta dos veces rápido (React Strict Mode)
    // o si hay un conflicto entre ExamMode y el Modal, el sonido se duplique.
    if (lastPlayedRef.current.id === soundId && (now - lastPlayedRef.current.time < 250)) {
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
    unlockAudio,
    
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