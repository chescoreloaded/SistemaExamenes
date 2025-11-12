// src/components/layout/HeaderControls.jsx
import { useDarkMode } from '@/hooks/useDarkMode';
import { useSoundContext } from '@/context/SoundContext';
import { SoundControl, DarkModeToggle } from '@/components/common';
import { LanguageSelector } from '@/components/common/LanguageSelector';

export function HeaderControls({ className = '' }) {
  const { isDark, toggle: toggleDarkMode } = useDarkMode();
  const { isMuted, volume, toggleMute, changeVolume, playTest } = useSoundContext();

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Grupo de Iconos */}
      <div className="flex items-center gap-1 bg-gray-100/80 dark:bg-gray-800/80 p-1 rounded-full border border-gray-200 dark:border-gray-700">
        <SoundControl 
          isMuted={isMuted} 
          volume={volume} 
          onToggleMute={toggleMute} 
          onVolumeChange={changeVolume} 
          onTest={playTest} 
          compact 
        />
        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" /> {/* Separador mini */}
        <DarkModeToggle isDark={isDark} toggle={toggleDarkMode} />
      </div>

      {/* Selector de Idioma */}
      <LanguageSelector variant="minimal" /> {/* Asumo que existe una variante 'minimal' o similar, si no, usar 'default' */}
    </div>
  );
}

export default HeaderControls;