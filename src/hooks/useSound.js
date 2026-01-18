import { useState, useEffect, useCallback, useRef } from 'react';
import useSoundPackage from 'use-sound';
import { Howler } from 'howler';

// Importa tus sonidos
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
  const lastPlayedRef = useRef({ id: null, time: 0 });

  useEffect(() => {
    const savedMuted = localStorage.getItem('soundMuted');
    if (savedMuted !== null) setIsMuted(JSON.parse(savedMuted));
    
    const savedVolume = localStorage.getItem('soundVolume');
    if (savedVolume !== null) setVolume(parseFloat(savedVolume));
  }, []);

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    localStorage.setItem('soundMuted', JSON.stringify(newMuted));
    Howler.mute(newMuted);
  };

  const changeVolume = (newVolume) => {
    setVolume(newVolume);
    localStorage.setItem('soundVolume', newVolume.toString());
    Howler.volume(newVolume);
  };

  const soundOptions = {
    volume: volume,
    interrupt: true,
    soundEnabled: !isMuted,
  };

  const correctOptions = {
    ...soundOptions,
    interrupt: false, 
  };

  const [playCorrectOriginal, { sound: correctSound }] = useSoundPackage(correctSfx, correctOptions);
  
  // ... resto de hooks (playClick, etc) igual que antes ...
  const [playClick] = useSoundPackage(clickSfx, soundOptions);
  const [playPageTransition] = useSoundPackage(transitionSfx, soundOptions);
  const [playTest] = useSoundPackage(testSfx, soundOptions);
  const [playIncorrect] = useSoundPackage(incorrectSfx, soundOptions);
  const [playAchievement] = useSoundPackage(achievementSfx, soundOptions);
  const [playLevelUp] = useSoundPackage(levelUpSfx, soundOptions);
  const [playStreak] = useSoundPackage(streakSfx, soundOptions);
  const [playExamCompleteSuccess] = useSoundPackage(examSuccessSfx, soundOptions);
  const [playExamCompleteFail] = useSoundPackage(examFailSfx, soundOptions);
  const [playFlashcardFlip] = useSoundPackage(flipSfx, soundOptions);

  const playWrapper = (playFn, soundId) => {
    if (isMuted) return null;
    if (Howler.ctx && Howler.ctx.state === 'suspended') {
        try { Howler.ctx.resume(); } catch (e) { console.warn(e); }
    }
    const now = Date.now();
    if (lastPlayedRef.current.id === soundId && (now - lastPlayedRef.current.time < 50)) {
      return null;
    }
    if (playFn) {
      lastPlayedRef.current = { id: soundId, time: now };
      return playFn(); 
    }
    return null;
  };

  return {
    isMuted,
    volume,
    toggleMute,
    changeVolume,
    
    playClick: () => playWrapper(playClick, 'click'),
    playPageTransition: () => playWrapper(playPageTransition, 'transition'),
    playTest: () => playWrapper(playTest, 'test'),
    
    // 🕵️‍♂️ INSTRUMENTACIÓN AQUÍ
    playCorrect: (streakInput) => {
      const streak = typeof streakInput === 'number' ? streakInput : 0;
      
      console.group('🎵 DEBUG AUDIO: PlayCorrect');
      console.log('1. Racha recibida:', streak);

      if (correctSound) {
         let pitch = 1.0 + (streak * 0.1); 
         pitch = Math.min(Math.max(pitch, 1.0), 2.0);
         
         console.log('2. Pitch calculado:', pitch);
         console.log('3. Rate ANTES del cambio:', correctSound.rate());

         if (Number.isFinite(pitch)) {
             correctSound.rate(pitch);
             console.log('4. Rate DESPUÉS del cambio:', correctSound.rate());
         }
      } else {
          console.warn('⚠️ No se encontró la instancia correctSound (Howler no está listo)');
      }
      console.groupEnd();
      
      playWrapper(playCorrectOriginal, 'correct');
    },

    playIncorrect: () => playWrapper(playIncorrect, 'incorrect'),
    playAchievement: () => playWrapper(playAchievement, 'achievement'),
    playLevelUp: () => playWrapper(playLevelUp, 'levelup'),
    playStreak: () => playWrapper(playStreak, 'streak'),
    playExamCompleteSuccess: () => playWrapper(playExamCompleteSuccess, 'exam_success'),
    playExamCompleteFail: () => playWrapper(playExamCompleteFail, 'exam_fail'),
    playFlashcardFlip: () => playWrapper(playFlashcardFlip, 'flip'),
  };
}