import { memo } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext'; // ✅ Import hook

const FlashcardNavigator = memo(function FlashcardNavigator({
  cards,
  currentIndex,
  markedCards,
  studiedCards,
  onGoToCard
}) {
  const { t } = useLanguage(); // ✅ Usar hook

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
        return 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white ring-4 ring-indigo-300 dark:ring-indigo-600 scale-110 shadow-lg';
      case 'marked':
        return 'bg-gradient-to-br from-yellow-400 to-orange-400 text-white hover:scale-105 shadow-md';
      case 'studied':
        return 'bg-gradient-to-br from-green-500 to-emerald-500 text-white hover:scale-105 shadow-md';
      default:
        return 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 border-2 border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
          🗂️ {t('study.ui.navigatorTitle')} {/* ✅ Traducido */}
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
          {currentIndex + 1} / {cards.length}
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {cards.map((card, index) => {
          const status = getCardStatus(card, index);
          return (
            <motion.button
              key={card.id}
              onClick={() => onGoToCard(index)}
              className={`relative min-h-[44px] rounded-lg font-bold text-sm transition-all duration-200 flex flex-col items-center justify-center ${getStatusStyles(status)}`}
              whileHover={{ scale: status === 'current' ? 1.1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {markedCards.has(card.id) && status !== 'current' && (
                <span className="absolute -top-1 -right-1 text-xs">⭐</span>
              )}
              {studiedCards.has(card.id) && status !== 'current' && !markedCards.has(card.id) && (
                <span className="absolute -top-1 -right-1 text-[10px]">✓</span>
              )}
              <span>{index + 1}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Leyenda traducida */}
      <div className="mt-4 pt-3 border-t-2 border-gray-100 dark:border-gray-700 space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500" />
          <span className="text-gray-600 dark:text-gray-400">{t('study.ui.cardCurrent')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-green-500 to-emerald-500" />
          <span className="text-gray-600 dark:text-gray-400">{t('study.ui.cardStudied')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400" />
          <span className="text-gray-600 dark:text-gray-400">{t('study.ui.cardMarked')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600" />
          <span className="text-gray-600 dark:text-gray-400">{t('study.ui.cardPending')}</span>
        </div>
      </div>
    </div>
  );
});

export default FlashcardNavigator;