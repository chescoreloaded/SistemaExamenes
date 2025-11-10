import { useEffect, useRef } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import PropTypes from 'prop-types';
import { useLanguage } from '@/context/LanguageContext';

ChartJS.register(ArcElement, Title, Tooltip, Legend);

export function DistributionChart({ data, isDark = false, id = "chart-distribution" }) {
  const chartRef = useRef(null);
  const { t } = useLanguage();

  // ... (condiciones de !data igual) ...

  const total = data.datasets[0].data.reduce((a, b) => a + b, 0);

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1.5,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: isDark ? '#e5e7eb' : '#374151',
          font: { size: 12, family: "'Inter', sans-serif" },
          usePointStyle: true,
          padding: 15,
          generateLabels: (chart) => {
            const chartData = chart.data;
            if (chartData.labels.length && chartData.datasets.length) {
              return chartData.labels.map((label, i) => {
                const value = chartData.datasets[0].data[i];
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                
                // ✅ USAR T() PARA LAS LEYENDAS INDIVIDUALES
                let translatedLabel;
                if (label === 'Correctas' || label === 'Correct') {
                  translatedLabel = t('analytics.charts.distribution.correct');
                } else if (label === 'Incorrectas' || label === 'Incorrect') {
                  translatedLabel = t('analytics.charts.distribution.incorrect');
                } else {
                  translatedLabel = label; // Fallback
                }

                return {
                  text: `${translatedLabel}: ${percentage}%`,
                  fillStyle: chartData.datasets[0].backgroundColor[i],
                  hidden: false,
                  index: i,
                  fontColor: isDark ? '#e5e7eb' : '#374151'
                };
              });
            }
            return [];
          }
        }
      },
      title: {
        display: true,
        text: `🎯 ${t('analytics.charts.distribution.title')}`, // ✅ Título traducido
        color: isDark ? '#f9fafb' : '#111827',
        font: { size: 16, weight: 'bold', family: "'Inter', sans-serif" },
        padding: { top: 10, bottom: 20 }
      },
      tooltip: {
        // ... estilos igual ...
        callbacks: {
          label: function(context) {
            // ✅ También traducir aquí el label del tooltip si es necesario
            let label = context.label;
            if (label === 'Correctas' || label === 'Correct') {
              label = t('analytics.charts.distribution.correct');
            } else if (label === 'Incorrectas' || label === 'Incorrect') {
              label = t('analytics.charts.distribution.incorrect');
            }
            const value = context.parsed;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return [`${label}: ${value} (${percentage}%)`];
          }
        }
      }
    },
    cutout: '60%',
    elements: { arc: { borderWidth: 2, borderColor: isDark ? '#1f2937' : '#ffffff' } }
  };

  return (
    <div id={id} className="w-full h-full p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <Doughnut ref={chartRef} data={data} options={options} />
      
      {/* Centro del Doughnut - Información adicional con color corregido */}
      <div className="relative -mt-48 flex flex-col items-center justify-center pointer-events-none" style={{ height: 150 }}>
        <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
          {total}
        </p>
        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
          {t('common.total')} {/* ✅ Podrías necesitar una clave para "Total" si aún no la tienes */}
        </p>
      </div>
    </div>
  );
}
DistributionChart.propTypes = {
  data: PropTypes.shape({
    labels: PropTypes.arrayOf(PropTypes.string).isRequired,
    datasets: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        data: PropTypes.arrayOf(PropTypes.number).isRequired,
        backgroundColor: PropTypes.arrayOf(PropTypes.string).isRequired,
        borderColor: PropTypes.arrayOf(PropTypes.string),
        borderWidth: PropTypes.number
      })
    ).isRequired
  }),
  isDark: PropTypes.bool,
  id: PropTypes.string
};

export default DistributionChart;