import { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

// ✅ Componente memoizado
const FlashcardNavigator = memo(function FlashcardNavigator({ 
  cards, 
  currentIndex, 
  markedCards = new Set(),
  studiedCards = new Set(),
  onCardClick,
  onToggleMark 
}) {
  // ✅ Memoizar funciones de utilidad
  const getCardStatus = useMemo(() => (index) => {
    const cardId = cards[index]?.id;
    if (index === currentIndex) return 'current';
    if (markedCards.has(cardId)) return 'marked';
    if (studiedCards.has(index)) return 'studied';
    return 'pending';
  }, [cards, currentIndex, markedCards, studiedCards]);

  const getCardColor = (status) => {
    switch(status) {
      case 'current':
        return 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg scale-110 ring-4 ring-indigo-300';
      case 'marked':
        return 'bg-gradient-to-br from-yellow-400 to-orange-400 text-white border-2 border-yellow-500';
      case 'studied':
        return 'bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 border border-green-300';
      default:
        return 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300';
    }
  };

  // ✅ Verificar si tarjeta actual está marcada
  const isCurrentMarked = useMemo(
    () => markedCards.has(cards[currentIndex]?.id),
    [markedCards, cards, currentIndex]
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          📚 Navegación de Tarjetas
        </h3>
        {onToggleMark && (
          <button
            onClick={() => onToggleMark(cards[currentIndex]?.id)}
            className={`text-2xl transition-transform hover:scale-125 ${
              isCurrentMarked ? 'animate-bounce' : ''
            }`}
            title="Marcar tarjeta"
          >
            {isCurrentMarked ? '⭐' : '☆'}
          </button>
        )}
      </div>

      {/* Grid de tarjetas */}
      <div className="grid grid-cols-5 gap-2 max-h-96 overflow-y-auto pr-2">
        {cards.map((card, index) => {
          const status = getCardStatus(index);
          return (
            <motion.button
              key={card.id}
              onClick={() => onCardClick(index)}
              className={`
                aspect-square rounded-lg font-bold text-sm
                transition-all duration-200
                hover:scale-105 hover:shadow-md
                ${getCardColor(status)}
              `}
              whileHover={{ rotate: status === 'current' ? 0 : 5 }}
              whileTap={{ scale: 0.95 }}
            >
              {index + 1}
            </motion.button>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-indigo-500 to-purple-500"></div>
          <span className="text-gray-600">Tarjeta actual</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-green-100 to-emerald-100 border border-green-300"></div>
          <span className="text-gray-600">Estudiadas ({studiedCards.size})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-yellow-400 to-orange-400"></div>
          <span className="text-gray-600">Marcadas ({markedCards.size})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-white border border-gray-200"></div>
          <span className="text-gray-600">Sin estudiar</span>
        </div>
      </div>

      {/* Atajos */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs font-semibold text-gray-700 mb-2">⌨️ Atajos:</p>
        <div className="space-y-1 text-xs text-gray-600">
          <div>↔️ Navegar tarjetas</div>
          <div>⭐ <kbd className="bg-gray-100 px-1 rounded">M</kbd> Marcar</div>
          <div>🔄 <kbd className="bg-gray-100 px-1 rounded">Espacio</kbd> Voltear</div>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // ✅ Custom comparison
  return (
    prevProps.currentIndex === nextProps.currentIndex &&
    prevProps.cards.length === nextProps.cards.length &&
    prevProps.markedCards.size === nextProps.markedCards.size &&
    prevProps.studiedCards.size === nextProps.studiedCards.size
  );
});

FlashcardNavigator.propTypes = {
  cards: PropTypes.array.isRequired,
  currentIndex: PropTypes.number.isRequired,
  markedCards: PropTypes.instanceOf(Set),
  studiedCards: PropTypes.instanceOf(Set),
  onCardClick: PropTypes.func.isRequired,
  onToggleMark: PropTypes.func
};

FlashcardNavigator.displayName = 'FlashcardNavigator';

export default FlashcardNavigator;