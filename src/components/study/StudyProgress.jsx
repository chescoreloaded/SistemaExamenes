import PropTypes from 'prop-types';
import { ProgressBar } from '@/components/common';

export default function StudyProgress({ current, total, subjectName }) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="w-full bg-white shadow-md border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              📚 Modo Estudio
            </h1>
            {subjectName && (
              <p className="text-sm text-gray-600 mt-1">{subjectName}</p>
            )}
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold text-indigo-600">
              {current} / {total}
            </div>
            <div className="text-sm text-gray-500">
              {percentage}% completado
            </div>
          </div>
        </div>

        <ProgressBar 
          current={current} 
          total={total} 
          showPercentage={false}
        />

        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Estudiadas: {current}</span>
          <span>Faltan: {total - current}</span>
        </div>
      </div>
    </div>
  );
}

StudyProgress.propTypes = {
  current: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  subjectName: PropTypes.string
};