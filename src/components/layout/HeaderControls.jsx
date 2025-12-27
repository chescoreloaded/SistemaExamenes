import { useDarkMode } from '@/hooks/useDarkMode';
import { useSoundContext } from '@/context/SoundContext';
import { SoundControl, DarkModeToggle } from '@/components/common';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import PropTypes from 'prop-types';

export function HeaderControls({ className = '', minimal = false }) {
  const { isDark, toggle: toggleDarkMode } = useDarkMode();
  const { isMuted, volume, toggleMute, changeVolume, playTest } = useSoundContext();

  return (
    <div className={`flex items-center gap-2 flex-shrink-0 ${className}`}>
      {/* Controles de Sistema */}
      <div className="flex items-center gap-1 bg-gray-100/80 dark:bg-gray-800/80 p-1 rounded-full border border-gray-200 dark:border-gray-700">
        <SoundControl 
          isMuted={isMuted} 
          volume={volume} 
          onToggleMute={toggleMute} 
          onVolumeChange={changeVolume} 
          onTest={playTest} 
          compact 
        />
        
        {/* En modo minimal (móvil), ocultamos el toggle de tema para ahorrar espacio */}
        {!minimal && (
          <>
            <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />
            <DarkModeToggle isDark={isDark} toggle={toggleDarkMode} />
          </>
        )}
      </div>

      {/* Selector de Idioma: Oculto en modo minimal */}
      {!minimal && (
        <>
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block"></div>
          <LanguageSelector variant="default" />
        </>
      )}
    </div>
  );
}

HeaderControls.propTypes = {
  className: PropTypes.string,
  minimal: PropTypes.bool
};

export default HeaderControls;