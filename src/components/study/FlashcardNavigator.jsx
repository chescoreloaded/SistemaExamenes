import { memo } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

const FlashcardNavigator = memo(function FlashcardNavigator({
  cards,
  currentIndex,
  markedCards,
  studiedCards,
  onGoToCard,
  variant = 'default' // 'default' | 'sidebar'
}) {
  const { t } = useLanguage();

  if (!cards || cards.length === 0) return null;

  const getCardStatus = (card, index) => {
    if (index === currentIndex) return 'current';
    if (markedCards.has(card.id)) return 'marked';
    if (studiedCards.has(card.id)) return 'studied';
    return 'pending';
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'current':
        return 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white ring-2 ring-indigo-300 dark:ring-indigo-500 shadow-md scale-105 z-10';
      case 'marked':
        return 'bg-gradient-to-br from-yellow-400 to-orange-400 text-white shadow-sm';
      case 'studied':
        return 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-sm';
      default:
        return 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700';
    }
  };

  // Clases condicionales según la variante
  const isSidebar = variant === 'sidebar';
  
  const containerClasses = isSidebar
    ? "w-full bg-transparent p-0" // Limpio para el Sheet
    : "bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 border-2 border-gray-200 dark:border-gray-700"; // Estilo tarjeta original

  const gridClasses = isSidebar
    ? "grid-cols-4 gap-2" // Más compacto para el panel lateral (380px)
    : "grid-cols-5 gap-2"; // Más amplio para modales grandes

  const titleClasses = isSidebar
    ? "text-base mb-2" // Título más discreto
    : "text-lg mb-4 pb-3 border-b-2 border-gray-100 dark:border-gray-700";

  return (
    <div className={`${containerClasses} transition-colors duration-300`}>
      {/* Header del Navegador */}
      <div className={`flex items-center justify-between ${titleClasses}`}>
        <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
          {!isSidebar && <span>🗂️</span>} 
          {t('study.ui.navigatorTitle') || "Navegador"}
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full whitespace-nowrap">
          {currentIndex + 1} / {cards.length}
        </span>
      </div>

      {/* Grilla Scrollable */}
      <div className={`grid ${gridClasses} max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar pb-2`}>
        {cards.map((card, index) => {
          const status = getCardStatus(card, index);
          return (
            <motion.button
              key={card.id}
              onClick={() => onGoToCard(index)}
              className={`relative h-10 rounded-md font-bold text-sm transition-all duration-200 flex flex-col items-center justify-center ${getStatusStyles(status)}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {markedCards.has(card.id) && status !== 'current' && (
                <span className="absolute -top-1 -right-1 text-[10px]">⭐</span>
              )}
              {studiedCards.has(card.id) && status !== 'current' && !markedCards.has(card.id) && (
                <span className="absolute -top-1 -right-1 text-[8px]">✓</span>
              )}
              <span>{index + 1}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Leyenda Compacta */}
      <div className={`mt-4 pt-3 ${!isSidebar ? 'border-t-2 border-gray-100 dark:border-gray-700' : 'border-t border-gray-200 dark:border-gray-800'} space-y-2 text-xs`}>
        <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500" />
            <span className="text-gray-600 dark:text-gray-400 truncate">{t('study.ui.cardCurrent') || "Actual"}</span>
            </div>
            <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-green-500 to-emerald-500" />
            <span className="text-gray-600 dark:text-gray-400 truncate">{t('study.ui.cardStudied') || "Estudiada"}</span>
            </div>
            <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400" />
            <span className="text-gray-600 dark:text-gray-400 truncate">{t('study.ui.cardMarked') || "Marcada"}</span>
            </div>
            <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600" />
            <span className="text-gray-600 dark:text-gray-400 truncate">{t('study.ui.cardPending') || "Pendiente"}</span>
            </div>
        </div>
      </div>
    </div>
  );
});

export default FlashcardNavigator;