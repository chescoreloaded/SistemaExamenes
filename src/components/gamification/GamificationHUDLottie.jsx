import { useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import { useLanguage } from '../../context/LanguageContext';

import fireAnim from '@/assets/lottie/fire-anim.json';      
import chestAnim from '@/assets/lottie/chest-anim.json';    

// --- 1. NIVEL: "SOLID REACTOR" (Rediseñado para Alto Contraste) ---
const SolidLevelBadge = ({ level, t }) => {
    return (
        <div className="relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center z-20 shrink-0">
            
            {/* BASE DEL REACTOR */}
            <div className="absolute inset-1 rounded-full bg-white dark:bg-gray-900 shadow-lg border-4 border-slate-100 dark:border-gray-800 z-0" />

            {/* ANILLO EXTERIOR */}
            <motion.svg 
                className="absolute inset-0 w-full h-full text-slate-300 dark:text-cyan-900/40"
                viewBox="0 0 100 100"
            >
                <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="4" />
            </motion.svg>

            {/* ANILLO DE ENERGÍA */}
            <motion.svg 
                className="absolute inset-0 w-full h-full text-blue-500 dark:text-cyan-400"
                viewBox="0 0 100 100"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
                <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="70 220" strokeLinecap="round" />
            </motion.svg>

            {/* 🚀 FIX: Aumentamos tamaño del núcleo cambiando inset-5 a inset-3 */}
            <div className="absolute inset-3 rounded-full bg-slate-50 dark:bg-gray-950 flex flex-col items-center justify-center shadow-inner border border-slate-200 dark:border-cyan-500/30 z-10 overflow-hidden">
                
                <div className="absolute -top-6 -left-6 w-12 h-12 bg-white/40 dark:bg-white/10 blur-xl rounded-full pointer-events-none" />
                
                {/* Ajustamos un poco el margen inferior del texto NIVEL */}
                <span className="text-[8px] md:text-[9px] font-bold text-slate-500 dark:text-cyan-500 tracking-widest uppercase mb-0 relative z-10">
                    {t('gamification.level.level') || 'NIVEL'}
                </span>
                
                {/* El número ahora tiene más espacio para crecer */}
                <span className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white leading-none font-mono relative z-10 drop-shadow-sm">
                    {level}
                </span>
            </div>
            
            {/* ETIQUETA XP */}
            <div className="absolute -bottom-1 z-20">
                <div className="bg-blue-600 dark:bg-gray-900 border-2 border-white dark:border-cyan-500/50 text-white dark:text-cyan-400 text-[9px] font-black px-3 py-0.5 rounded-full shadow-md tracking-wider">
                    {t('gamification.xp')}
                </div>
            </div>
        </div>
    );
};

// --- 2. BARRA SEGMENTADA (Optimizada) ---
const SegmentedEnergyBar = ({ streak, t }) => {
    const lottieRef = useRef();

    const getComboText = () => {
        const rawText = t('gamification.combo_count') || "{count} / 5";
        return rawText.replace('{count}', streak);
    };

    const variant = useMemo(() => {
        if (streak >= 5) {
            return {
                blockActive: 'bg-gradient-to-t from-red-600 to-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]',
                blockInactive: 'bg-red-100 dark:bg-red-900/20',
                text: t('gamification.combo_max'),
                textClass: 'text-red-600 dark:text-red-400 font-black',
                filter: 'hue-rotate(0deg) saturate(1.2)',
                speed: 1.8
            };
        } else if (streak >= 3) {
            return {
                blockActive: 'bg-gradient-to-t from-orange-500 to-amber-400 shadow-[0_0_10px_rgba(249,115,22,0.5)]',
                blockInactive: 'bg-orange-100 dark:bg-orange-900/20',
                text: t('gamification.warming_up'),
                textClass: 'text-orange-600 dark:text-orange-400 font-extrabold',
                filter: 'hue-rotate(30deg)',
                speed: 1.3
            };
        } else {
            return {
                blockActive: 'bg-gradient-to-t from-cyan-600 to-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.5)]',
                blockInactive: 'bg-slate-200 dark:bg-gray-800',
                text: getComboText(),
                textClass: 'text-slate-600 dark:text-cyan-300 font-bold',
                filter: 'hue-rotate(210deg) brightness(1.2)',
                speed: 0.8
            };
        }
    }, [streak, t]);

    useEffect(() => {
        if (lottieRef.current) lottieRef.current.setSpeed(variant.speed);
    }, [variant]);

    return (
        <div className="w-full flex flex-col justify-end px-2 h-full pb-3 relative">
            
            {/* TRACK DE BLOQUES */}
            <div className="relative w-full h-5 md:h-6 flex gap-1.5 z-10 mb-2">
                {[1, 2, 3, 4, 5].map((index) => (
                    <div 
                        key={index}
                        className={`flex-1 rounded-sm transition-all duration-300 border border-black/5 dark:border-white/5 relative overflow-hidden ${
                            index <= streak ? variant.blockActive : variant.blockInactive
                        }`}
                    >
                        {/* Brillo superior para efecto 3D */}
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/30" />
                    </div>
                ))}

                {/* 🔥 FUEGO FLOTANTE */}
                {streak > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute bottom-0 pointer-events-none origin-bottom z-20"
                        style={{ 
                            left: `calc(${((streak - 0.5) / 5) * 100}% - 40px)`, 
                            width: '80px',
                            height: '90px', 
                            filter: `${variant.filter} drop-shadow(0px 2px 4px rgba(0,0,0,0.2))`, // Sombra suave para contraste
                            transform: 'translateY(14px)'
                        }}
                    >
                        <Lottie 
                            lottieRef={lottieRef}
                            animationData={fireAnim} 
                            loop={true}
                            style={{ width: '100%', height: '100%' }}
                            rendererSettings={{ preserveAspectRatio: 'xMidYMax meet' }} 
                        />
                    </motion.div>
                )}
            </div>

            {/* TEXTO DE ESTADO */}
            <div className="flex justify-center h-4 relative z-30">
                <AnimatePresence mode="wait">
                    <motion.span
                        key={variant.text}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className={`text-[10px] md:text-[11px] uppercase tracking-[0.15em] ${variant.textClass}`}
                    >
                        {variant.text}
                    </motion.span>
                </AnimatePresence>
            </div>
        </div>
    );
};

// --- 3. COFRE (Consistente) ---
const MegaLootBox = ({ streak, t }) => {
    const lottieRef = useRef();
    const isReady = streak >= 5;

    useEffect(() => {
        const interval = setInterval(() => {
            if (lottieRef.current && !isReady) lottieRef.current.goToAndPlay(0);
        }, 10000);
        return () => clearInterval(interval);
    }, [isReady]);

    useEffect(() => {
        if(isReady && lottieRef.current) lottieRef.current.play();
    }, [isReady]);

    return (
        <div className="relative w-20 h-20 md:w-24 md:h-24 flex flex-col items-center justify-center z-20 shrink-0">
            <motion.div 
                className="w-full h-full flex items-center justify-center relative mb-5"
                animate={isReady ? { y: [0, -6, 0] } : {}}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            >
                {/* Glow ajustado */}
                {isReady && (
                    <div className="absolute inset-0 bg-yellow-400/30 dark:bg-yellow-500/20 blur-2xl rounded-full" />
                )}
                
                <div className="transform scale-[1.8] origin-center">
                    <Lottie 
                        lottieRef={lottieRef}
                        animationData={chestAnim}
                        loop={false}
                        autoplay={false}
                        style={{ width: '60px', height: '60px' }}
                    />
                </div>
            </motion.div>

            {/* Etiqueta Loot - Diseño sólido */}
            <div className="absolute bottom-0 z-20">
                <div className={`px-3 py-0.5 border-2 rounded-full shadow-md tracking-wider text-[9px] font-black uppercase transition-all duration-300 ${
                    isReady 
                    ? 'bg-yellow-400 border-yellow-200 text-yellow-900 scale-110' 
                    : 'bg-slate-100 dark:bg-gray-900 border-slate-300 dark:border-gray-700 text-slate-500 dark:text-gray-500'
                }`}>
                    {isReady ? t('gamification.open') : t('gamification.loot')}
                </div>
            </div>
        </div>
    );
};

// --- HUD PRINCIPAL ---
export const GamificationHUDLottie = ({ streak, level }) => {
  const { t } = useLanguage();

  return (
    <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-2xl mx-auto h-24 md:h-28 
                   bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl 
                   border border-slate-200 dark:border-white/5 
                   rounded-[2rem] grid grid-cols-[90px_1fr_90px] gap-1 items-center px-1 
                   shadow-xl dark:shadow-2xl relative z-10 overflow-visible transition-colors duration-300"
    >
        {/* Glows ambientales (Solo dark mode) */}
        <div className="absolute top-0 left-10 w-20 h-1 bg-cyan-500/10 blur-xl hidden dark:block" />
        <div className="absolute bottom-0 right-10 w-20 h-1 bg-yellow-500/10 blur-xl hidden dark:block" />

        <div className="flex justify-center h-full items-center">
            <SolidLevelBadge level={level} t={t} />
        </div>

        <SegmentedEnergyBar streak={streak} t={t} />

        <div className="flex justify-center h-full items-center">
            <MegaLootBox streak={streak} t={t} />
        </div>
    </motion.div>
  );
};