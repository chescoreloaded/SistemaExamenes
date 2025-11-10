import { useDarkMode } from '@/hooks/useDarkMode';
import { useSoundContext } from '@/context/SoundContext';
import { SoundControl, DarkModeToggle } from '@/components/common';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import PropTypes from 'prop-types';

export function HeaderControls({ languageReadOnly = true, className = '' }) { // ✅ Default a true (más seguro)
  const { isDark, toggle: toggleDarkMode } = useDarkMode();
  const { isMuted, volume, toggleMute, changeVolume, playTest } = useSoundContext();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Controles de Sistema */}
      <SoundControl 
        isMuted={isMuted} 
        volume={volume} 
        onToggleMute={toggleMute} 
        onVolumeChange={changeVolume} 
        onTest={playTest} 
        compact 
      />
      <DarkModeToggle isDark={isDark} toggle={toggleDarkMode} />

      {/* Separador */}
      <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block"></div>
      
      {/* Selector de Idioma (a la derecha) */}
      <LanguageSelector variant={languageReadOnly ? 'readOnly' : 'default'} />
    </div>
  );
}

HeaderControls.propTypes = {
  languageReadOnly: PropTypes.bool,
  className: PropTypes.string
};

export default HeaderControls;