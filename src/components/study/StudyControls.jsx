import PropTypes from 'prop-types';
import { Button } from '@/components/common';

export default function StudyControls({ 
  onPrevious, 
  onNext, 
  onShuffle,
  onFlip,
  canGoPrevious, 
  canGoNext 
}) {
  return (
    <div className="flex flex-col items-center gap-6 mt-8">
      {/* Navegación */}
      <div className="flex items-center gap-4">
        <Button
          variant="secondary"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="w-32"
        >
          ⬅️ Anterior
        </Button>

        <Button
          variant="primary"
          onClick={onFlip}
          className="w-40 text-lg font-semibold"
        >
          🔄 Voltear
        </Button>

        <Button
          variant="secondary"
          onClick={onNext}
          disabled={!canGoNext}
          className="w-32"
        >
          Siguiente ➡️
        </Button>
      </div>

      {/* Shuffle */}
      <Button
        variant="outline"
        onClick={onShuffle}
        className="w-48"
      >
        🔀 Mezclar tarjetas
      </Button>

      {/* Atajos */}
      <div className="text-sm text-gray-500 flex flex-wrap justify-center gap-4 mt-4">
        <span className="bg-gray-100 px-3 py-1 rounded">
          <kbd className="font-mono font-bold">←</kbd> Anterior
        </span>
        <span className="bg-gray-100 px-3 py-1 rounded">
          <kbd className="font-mono font-bold">→</kbd> Siguiente
        </span>
        <span className="bg-gray-100 px-3 py-1 rounded">
          <kbd className="font-mono font-bold">Espacio</kbd> Voltear
        </span>
        <span className="bg-gray-100 px-3 py-1 rounded">
          <kbd className="font-mono font-bold">S</kbd> Mezclar
        </span>
      </div>
    </div>
  );
}

StudyControls.propTypes = {
  onPrevious: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onShuffle: PropTypes.func.isRequired,
  onFlip: PropTypes.func.isRequired,
  canGoPrevious: PropTypes.bool.isRequired,
  canGoNext: PropTypes.bool.isRequired
};