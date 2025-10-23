import { memo } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

export const FlashcardNavigator = memo(function FlashcardNavigator({
  cards,
  currentIndex,
  markedCards,
  studiedCards,
  onGoToCard
}) {
  if (!cards || cards.length === 0) return null;

  const getCardStatus = (card, index) => {
    const isStudied = studiedCards && studiedCards.has(index);
    const isMarked = markedCards && markedCards.has(card.id);
    const isCurrent = index === currentIndex;

    if (isCurrent) {
      return 'current';
    }
    if (isMarked) {
      return 'marked';
    }
    if (isStudied) {
      return 'studied';
    }
    return 'unstudied';
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'current':
        return 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white ring-4 ring-indigo-300 scale-110 shadow-lg';
      case 'marked':
        return 'bg-gradient-to-br from-yellow-400 to-orange-400 text-white hover:scale-105 shadow-md';
      case 'studied':
        return 'bg-gradient-to-br from-green-100 to-emerald-100 text-green-800 hover:bg-green-200 hover:scale-105';
      case 'unstudied':
      default:
        return 'bg-white text-gray-700 hover:bg-gray-100 hover:scale-105 border-2 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'current':
        return '📍';
      case 'marked':
        return '⭐';
      case 'studied':
        return '✓';
      case 'unstudied':
      default:
        return '';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 border-2 border-indigo-200">
      <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-indigo-100">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          🗂️ Navegación de Tarjetas
        </h3>
        <span className="text-xs text-gray-500 bg-indigo-100 px-2 py-1 rounded-full">
          {studiedCards.size} / {cards.length}
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2 max-h-[500px] overflow-y-auto pr-2">
        {cards.map((card, index) => {
          const status = getCardStatus(card, index);
          const styles = getStatusStyles(status);
          const icon = getStatusIcon(status);

          return (
            <motion.button
              key={card.id}
              onClick={() => onGoToCard(index)}
              className={`
                relative min-h-[44px] rounded-lg font-bold text-sm
                transition-all duration-200 flex flex-col items-center justify-center
                ${styles}
              `}
              whileHover={{ scale: status === 'current' ? 1.1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: status === 'current' ? 1.1 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-xs mb-0.5">{icon}</span>
              <span>{index + 1}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="mt-4 pt-3 border-t-2 border-indigo-100 space-y-1 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-purple-500" />
          <span className="text-gray-600">Tarjeta actual</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-300" />
          <span className="text-gray-600">Estudiada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-yellow-400 to-orange-400" />
          <span className="text-gray-600">Marcada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-white border-2 border-gray-300" />
          <span className="text-gray-600">Sin estudiar</span>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.currentIndex === nextProps.currentIndex &&
    prevProps.cards.length === nextProps.cards.length &&
    prevProps.markedCards.size === nextProps.markedCards.size &&
    prevProps.studiedCards.size === nextProps.studiedCards.size
  );
});

FlashcardNavigator.propTypes = {
  cards: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired
    })
  ).isRequired,
  currentIndex: PropTypes.number.isRequired,
  markedCards: PropTypes.instanceOf(Set).isRequired,
  studiedCards: PropTypes.instanceOf(Set).isRequired,
  onGoToCard: PropTypes.func.isRequired
};

FlashcardNavigator.displayName = 'FlashcardNavigator';

export default FlashcardNavigator;
