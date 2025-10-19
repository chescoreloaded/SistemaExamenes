import { Card } from '../common/Card';
import { ProgressBar } from '../common/ProgressBar';

export function CategoryBreakdown({ byCategory }) {
  if (!byCategory || Object.keys(byCategory).length === 0) {
    return null;
  }

  return (
    <Card>
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Resultados por Categoría
      </h3>
      <div className="space-y-4">
        {Object.entries(byCategory).map(([category, stats]) => {
          const percentage = stats.total > 0 
            ? (stats.correct / stats.total) * 100 
            : 0;

          return (
            <div key={category}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-700 capitalize">
                  {category}
                </span>
                <span className="text-sm text-gray-600">
                  {stats.correct} / {stats.total}
                </span>
              </div>
              <ProgressBar 
                progress={percentage} 
                showPercentage={true}
                color={percentage >= 70 ? 'success' : percentage >= 50 ? 'warning' : 'danger'}
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
}