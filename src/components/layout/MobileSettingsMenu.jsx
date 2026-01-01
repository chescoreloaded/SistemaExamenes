import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useSoundContext } from '@/context/SoundContext';
import { Button } from '@/components/ui/button';

// Shadcn Components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function MobileSettingsMenu({ onExit }) {
  const { t, language, changeLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme(); 
  const { isMuted, volume, toggleMute, changeVolume, playTest } = useSoundContext();
  
  const [showSoundModal, setShowSoundModal] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
            <span className="text-xl">⚙️</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
          <DropdownMenuLabel>{t('settings.title')}</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-800" />

          {/* 1. Sonido */}
          <DropdownMenuItem onSelect={() => setShowSoundModal(true)} className="cursor-pointer focus:bg-gray-100 dark:focus:bg-gray-800">
            <span className="mr-2 w-4">{isMuted ? '🔇' : '🔊'}</span>
            {t('settings.sound')}
          </DropdownMenuItem>

          {/* 2. Tema - Lógica Invertida (Muestra el destino, no el estado actual) */}
          <DropdownMenuItem onSelect={toggleTheme} className="cursor-pointer focus:bg-gray-100 dark:focus:bg-gray-800">
            {/* Si es Oscuro (isDark), mostramos Sol y "Modo Claro" */}
            {/* Si es Claro (!isDark), mostramos Luna y "Modo Oscuro" */}
            <span className="mr-2 w-4">{isDark ? '☀️' : '🌙'}</span>
            {isDark ? t('settings.lightMode') : t('settings.darkMode')}
          </DropdownMenuItem>

          {/* 3. Idioma */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="focus:bg-gray-100 dark:focus:bg-gray-800">
              <span className="mr-2 w-4">🌐</span> {t('settings.language')} ({language.toUpperCase()})
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
              <DropdownMenuRadioGroup value={language} onValueChange={changeLanguage}>
                <DropdownMenuRadioItem value="es" className="focus:bg-gray-100 dark:focus:bg-gray-800">Español</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="en" className="focus:bg-gray-100 dark:focus:bg-gray-800">English</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {onExit && (
            <>
              <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-800" />
              <DropdownMenuItem onSelect={onExit} className="text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20 cursor-pointer">
                <span className="mr-2 w-4">🚪</span> {t('common.exit')}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* --- MODAL DE SONIDO --- */}
      <Dialog open={showSoundModal} onOpenChange={setShowSoundModal}>
        <DialogContent className="max-w-[90%] w-[350px] rounded-2xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
              🎵 {t('settings.soundTitle')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-2 space-y-8 mt-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
              <span className="text-base font-medium text-gray-700 dark:text-gray-200">
                {isMuted ? t('settings.unmute') : t('settings.mute')}
              </span>
              <div 
                onClick={toggleMute}
                className={`relative w-14 h-8 rounded-full cursor-pointer transition-colors duration-300 ease-in-out ${isMuted ? 'bg-gray-300 dark:bg-gray-700' : 'bg-indigo-500 dark:bg-indigo-600'}`}
              >
                <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${isMuted ? 'translate-x-0' : 'translate-x-6'}`} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('settings.volume')}</span>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 font-mono">{Math.round(volume * 100)}%</span>
              </div>
              <div className="relative w-full h-6 flex items-center">
                <input type="range" min="0" max="1" step="0.05" value={volume} onChange={(e) => changeVolume(parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
              </div>
            </div>

            <Button onClick={playTest} className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-6 rounded-xl shadow-lg transform active:scale-95 transition-all">
              🎶 {t('settings.testSound')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}