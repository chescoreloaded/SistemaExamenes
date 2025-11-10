import { useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import PropTypes from 'prop-types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * TimeChart - Gráfico de tiempo de estudio
 * NUEVO: Componente creado para visualizar tiempo invertido
 */
export function TimeChart({ data, isDark = false, id = "chart-time" }) {
  const chartRef = useRef(null);

  if (!data || !data.labels || !data.datasets) {
    return (
      <div id={id} className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">No hay datos de tiempo disponibles</p>
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
        text: '⏱️ Tiempo de Estudio',
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
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            
            const minutes = context.parsed.y;
            const hours = Math.floor(minutes / 60);
            const mins = Math.round(minutes % 60);
            
            if (hours > 0) {
              label += `${hours}h ${mins}min`;
            } else {
              label += `${mins} minutos`;
            }
            
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            const hours = Math.floor(value / 60);
            const mins = Math.round(value % 60);
            
            if (hours > 0) {
              return `${hours}h ${mins}m`;
            }
            return `${mins}m`;
          },
          color: isDark ? '#9ca3af' : '#6b7280',
          font: {
            size: 11
          }
        },
        grid: {
          color: isDark ? '#374151' : '#e5e7eb',
          drawBorder: false
        },
        title: {
          display: true,
          text: 'Tiempo (minutos)',
          color: isDark ? '#9ca3af' : '#6b7280',
          font: {
            size: 12,
            weight: 'bold'
          }
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
    elements: {
      bar: {
        borderRadius: 6,
        borderWidth: 2,
        borderSkipped: false
      }
    }
  };

  return (
    <div id={id} className="w-full h-full p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <Bar ref={chartRef} data={data} options={options} />
    </div>
  );
}

TimeChart.propTypes = {
  data: PropTypes.shape({
    labels: PropTypes.arrayOf(PropTypes.string).isRequired,
    datasets: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        data: PropTypes.arrayOf(PropTypes.number).isRequired,
        backgroundColor: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.arrayOf(PropTypes.string)
        ]),
        borderColor: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.arrayOf(PropTypes.string)
        ])
      })
    ).isRequired
  }),
  isDark: PropTypes.bool,
  id: PropTypes.string
};

export default TimeChart;