import { useEffect, useRef, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import PropTypes from 'prop-types';
import { useLanguage } from '@/context/LanguageContext'; // ✅ Import hook i18n

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * PerformanceChart - Gráfico de rendimiento a lo largo del tiempo (Internacionalizado)
 */
export function PerformanceChart({ data, isDark = false, id = "chart-performance" }) {
  const chartRef = useRef(null);
  const { t } = useLanguage(); // ✅ Usar hook para traducciones

  // ✅ Preparar datos traducidos internamente
  // Esto asegura que la leyenda se actualice al cambiar de idioma
  const translatedData = useMemo(() => {
    if (!data || !data.datasets) return null;
    return {
      ...data,
      datasets: data.datasets.map(dataset => ({
        ...dataset,
        // Usa la clave de traducción para la leyenda del dataset
        label: t('analytics.charts.performance.scoreLegend')
      }))
    };
  }, [data, t]);

  if (!translatedData || !translatedData.labels || !translatedData.datasets) {
    return (
      <div id={id} className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">{t('analytics.noData.chart')}</p>
      </div>
    );
  }

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: isDark ? '#e5e7eb' : '#374151',
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          },
          usePointStyle: true,
          padding: 15
        }
      },
      title: {
        display: true,
        text: `📈 ${t('analytics.charts.performance.title')}`, // ✅ Título traducido
        color: isDark ? '#f9fafb' : '#111827',
        font: {
          size: 16,
          weight: 'bold',
          family: "'Inter', sans-serif"
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        titleColor: isDark ? '#f9fafb' : '#111827',
        bodyColor: isDark ? '#e5e7eb' : '#374151',
        borderColor: isDark ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(1) + '%';
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          },
          color: isDark ? '#9ca3af' : '#6b7280',
          font: {
            size: 11
          }
        },
        grid: {
          color: isDark ? '#374151' : '#e5e7eb',
          drawBorder: false
        }
      },
      x: {
        ticks: {
          color: isDark ? '#9ca3af' : '#6b7280',
          font: {
            size: 11
          },
          maxRotation: 45,
          minRotation: 0
        },
        grid: {
          display: false
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    },
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 3
      },
      point: {
        radius: 4,
        hoverRadius: 6,
        borderWidth: 2
      }
    }
  };

  return (
    <div id={id} className="w-full h-full p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <Line ref={chartRef} data={translatedData} options={options} />
    </div>
  );
}

PerformanceChart.propTypes = {
  data: PropTypes.shape({
    labels: PropTypes.arrayOf(PropTypes.string).isRequired,
    datasets: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        data: PropTypes.arrayOf(PropTypes.number).isRequired,
        borderColor: PropTypes.string,
        backgroundColor: PropTypes.string,
        fill: PropTypes.bool
      })
    ).isRequired
  }),
  isDark: PropTypes.bool,
  id: PropTypes.string
};

export default PerformanceChart;