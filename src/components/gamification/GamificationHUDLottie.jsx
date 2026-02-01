import { useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import { useLanguage } from '../../context/LanguageContext';

import fireAnim from '@/assets/lottie/fire-anim.json';      
import chestAnim from '@/assets/lottie/chest-anim.json';    

// --- 1. NIVEL (Sin cambios) ---
const SolidLevelBadge = ({ level, t }) => {
    return (
        <div className="relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center z-20 shrink-0">
            <div className="absolute inset-1 rounded-full bg-white dark:bg-gray-900 shadow-lg border-4 border-slate-100 dark:border-gray-800 z-0" />
            <motion.svg 
                className="absolute inset-0 w-full h-full text-slate-300 dark:text-cyan-900/40"
                viewBox="0 0 100 100"
            >
                <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="4" />
            </motion.svg>
            <motion.svg 
                className="absolute inset-0 w-full h-full text-blue-500 dark:text-cyan-400"
                viewBox="0 0 100 100"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
                <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="70 220" strokeLinecap="round" />
            </motion.svg>
            <div className="absolute inset-3 rounded-full bg-slate-50 dark:bg-gray-950 flex flex-col items-center justify-center shadow-inner border border-slate-200 dark:border-cyan-500/30 z-10 overflow-hidden">
                <div className="absolute -top-6 -left-6 w-12 h-12 bg-white/40 dark:bg-white/10 blur-xl rounded-full pointer-events-none" />
                <span className="text-[8px] md:text-[9px] font-bold text-slate-500 dark:text-cyan-500 tracking-widest uppercase mb-0 relative z-10">
                    {t('gamification.level.level') || 'NIVEL'}
                </span>
                <span className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white leading-none font-mono relative z-10 drop-shadow-sm">
                    {level}
                </span>
            </div>
            <div className="absolute -bottom-1 z-20">
                <div className="bg-blue-600 dark:bg-gray-900 border-2 border-white dark:border-cyan-500/50 text-white dark:text-cyan-400 text-[9px] font-black px-3 py-0.5 rounded-full shadow-md tracking-wider">
                    {t('gamification.xp')}
                </div>
            </div>
        </div>
    );
};

// --- 2. BARRA SEGMENTADA (Soporte para 5 Tiers) ---
const SegmentedEnergyBar = ({ streak, t }) => {
    const lottieRef = useRef();
    
    // Calculamos progreso (0-5) dentro del ciclo actual
    const currentTierProgress = streak % 5; 
    const isFull = currentTierProgress === 0 && streak > 0;
    const displayCount = isFull ? 5 : currentTierProgress;

    const variant = useMemo(() => {
        // TIER 5: Emerald Bio-Matter (Racha 20-24 -> 25)
        if (streak >= 20) {
            return {
                blockActive: 'bg-gradient-to-t from-emerald-500 to-teal-400 shadow-[0_0_15px_rgba(16,185,129,0.8)]',
                blockInactive: 'bg-emerald-100 dark:bg-emerald-900/20',
                text: t('gamification.rewards.emerald_bio') || 'BIO TIER',
                textClass: 'text-emerald-600 dark:text-emerald-400 font-black tracking-widest',
                filter: 'hue-rotate(140deg) saturate(1.8) brightness(1.2)', // Verde neón
                speed: 2.5 // ¡Muy rápido!
            };
        }
        // TIER 4: Solar Gold (Racha 15-19 -> 20)
        else if (streak >= 15) {
            return {
                blockActive: 'bg-gradient-to-t from-yellow-500 to-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.7)]',
                blockInactive: 'bg-yellow-100 dark:bg-yellow-900/20',
                text: t('gamification.rewards.gold_isotope') || 'SOLAR TIER',
                textClass: 'text-yellow-600 dark:text-yellow-400 font-black',
                filter: 'hue-rotate(45deg) saturate(1.5) brightness(1.3)', // Dorado brillante
                speed: 2.2
            };
        }
        // TIER 3: Quantum Purple (Racha 10-14 -> 15)
        else if (streak >= 10) {
             return {
                blockActive: 'bg-gradient-to-t from-purple-600 to-fuchsia-500 shadow-[0_0_12px_rgba(192,38,211,0.6)]',
                blockInactive: 'bg-purple-100 dark:bg-purple-900/20',
                text: t('gamification.rewards.purple_cube') || 'QUANTUM TIER',
                textClass: 'text-purple-600 dark:text-purple-400 font-black',
                filter: 'hue-rotate(260deg) saturate(1.5)', 
                speed: 1.8
            };
        }
        // TIER 2: Plasma Red (Racha 5-9 -> 10)
        else if (streak >= 5) {
            return {
                blockActive: 'bg-gradient-to-t from-red-600 to-orange-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]',
                blockInactive: 'bg-red-100 dark:bg-red-900/20',
                text: t('gamification.rewards.red_core') || 'PLASMA TIER',
                textClass: 'text-red-600 dark:text-red-400 font-black',
                filter: 'hue-rotate(0deg) saturate(1.2)', 
                speed: 1.3
            };
        } 
        // TIER 1: Data Blue (Racha 0-4 -> 5)
        else {
            return {
                blockActive: 'bg-gradient-to-t from-cyan-600 to-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.5)]',
                blockInactive: 'bg-slate-200 dark:bg-gray-800',
                text: streak === 0 ? t('gamification.warming_up') : t('gamification.combo_count').replace('{count}', streak),
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
            <div className="relative w-full h-5 md:h-6 flex gap-1.5 z-10 mb-2">
                {[1, 2, 3, 4, 5].map((index) => (
                    <div 
                        key={index}
                        className={`flex-1 rounded-sm transition-all duration-300 border border-black/5 dark:border-white/5 relative overflow-hidden ${
                            index <= displayCount ? variant.blockActive : variant.blockInactive
                        }`}
                    >
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/30" />
                    </div>
                ))}

                {/* Fuego reactivo */}
                {streak > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute bottom-0 pointer-events-none origin-bottom z-20"
                        style={{ 
                            left: `calc(${((displayCount - 0.5) / 5) * 100}% - 40px)`, 
                            width: '80px',
                            height: '90px', 
                            filter: `${variant.filter} drop-shadow(0px 2px 4px rgba(0,0,0,0.2))`,
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

// --- 3. COFRE EVOLUTIVO (5 Tiers) ---
const MegaLootBox = ({ streak, t, onClick }) => {
    const lottieRef = useRef();
    
    // Determinar Tier (0-5)
    let tier = 0;
    if (streak >= 25) tier = 5;
    else if (streak >= 20) tier = 4;
    else if (streak >= 15) tier = 3;
    else if (streak >= 10) tier = 2;
    else if (streak >= 5) tier = 1;

    const isReady = tier > 0;

    // Configuración Visual por Tier
    const tierConfig = useMemo(() => {
        switch(tier) {
            case 1: return { 
                color: 'text-cyan-500', 
                bg: 'bg-cyan-100 dark:bg-cyan-900/30', 
                border: 'border-cyan-300', 
                glow: 'bg-cyan-400/30',
                filter: 'hue-rotate(200deg) brightness(1.2)', // Azul
                label: t('gamification.rewards.blue_shard')
            };
            case 2: return { 
                color: 'text-orange-500', 
                bg: 'bg-orange-100 dark:bg-orange-900/30', 
                border: 'border-orange-300', 
                glow: 'bg-orange-400/30',
                filter: 'hue-rotate(0deg) saturate(1.2)', // Rojo
                label: t('gamification.rewards.red_core')
            };
            case 3: return { 
                color: 'text-purple-500', 
                bg: 'bg-purple-100 dark:bg-purple-900/30', 
                border: 'border-purple-300', 
                glow: 'bg-purple-400/30',
                filter: 'hue-rotate(260deg) contrast(1.2)', // Violeta
                label: t('gamification.rewards.purple_cube')
            };
            case 4: return { 
                color: 'text-yellow-600 dark:text-yellow-400', 
                bg: 'bg-yellow-100 dark:bg-yellow-900/30', 
                border: 'border-yellow-400', 
                glow: 'bg-yellow-500/40',
                filter: 'hue-rotate(45deg) saturate(1.5) brightness(1.3)', // Dorado
                label: t('gamification.rewards.gold_isotope')
            };
            case 5: return { 
                color: 'text-emerald-500', 
                bg: 'bg-emerald-100 dark:bg-emerald-900/30', 
                border: 'border-emerald-400', 
                glow: 'bg-emerald-500/50',
                filter: 'hue-rotate(140deg) saturate(2.0) brightness(1.1)', // Verde Tóxico
                label: t('gamification.rewards.emerald_bio')
            };
            default: return { 
                color: 'text-slate-500', 
                bg: 'bg-slate-100', 
                border: 'border-slate-300', 
                glow: 'bg-transparent',
                filter: 'grayscale(1)', 
                label: t('gamification.loot')
            };
        }
    }, [tier, t]);

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
        <motion.button 
            onClick={() => isReady && onClick && onClick(tier)}
            whileTap={isReady ? { scale: 0.9 } : {}}
            whileHover={isReady ? { scale: 1.05 } : {}}
            disabled={!isReady}
            className={`relative w-20 h-20 md:w-24 md:h-24 flex flex-col items-center justify-center z-20 shrink-0 outline-none ${isReady ? 'cursor-pointer' : 'cursor-default'}`}
        >
            <motion.div 
                className="w-full h-full flex items-center justify-center relative mb-5"
                animate={isReady ? { y: [0, -6, 0] } : {}}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            >
                {isReady && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className={`absolute inset-0 blur-2xl rounded-full ${tierConfig.glow}`} 
                    />
                )}
                
                <div 
                    className="transform scale-[1.8] origin-center transition-all duration-500"
                    style={{ filter: tierConfig.filter }}
                >
                    <Lottie 
                        lottieRef={lottieRef}
                        animationData={chestAnim}
                        loop={false}
                        autoplay={false}
                        style={{ width: '60px', height: '60px' }}
                    />
                </div>
            </motion.div>

            {/* Etiqueta Loot Evolutiva */}
            <div className="absolute bottom-0 z-20 w-full flex justify-center">
                <div className={`px-2 py-0.5 border-2 rounded-full shadow-md text-[8px] font-black uppercase transition-all duration-300 whitespace-nowrap max-w-[90px] truncate ${
                    isReady 
                    ? `${tierConfig.bg} ${tierConfig.border} ${tierConfig.color} scale-110` 
                    : 'bg-slate-100 dark:bg-gray-900 border-slate-300 dark:border-gray-700 text-slate-500 dark:text-gray-500'
                }`}>
                    {tierConfig.label}
                </div>
            </div>
        </motion.button>
    );
};

// --- HUD PRINCIPAL ---
export const GamificationHUDLottie = ({ streak, level, onChestClick }) => {
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
        <div className="absolute top-0 left-10 w-20 h-1 bg-cyan-500/10 blur-xl hidden dark:block" />
        <div className="absolute bottom-0 right-10 w-20 h-1 bg-yellow-500/10 blur-xl hidden dark:block" />

        <div className="flex justify-center h-full items-center">
            <SolidLevelBadge level={level} t={t} />
        </div>

        <SegmentedEnergyBar streak={streak} t={t} />

        <div className="flex justify-center h-full items-center">
            <MegaLootBox streak={streak} t={t} onClick={onChestClick} />
        </div>
    </motion.div>
  );
};