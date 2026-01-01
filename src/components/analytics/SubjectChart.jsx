import { useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import PropTypes from 'prop-types';
import { useLanguage } from '@/context/LanguageContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function SubjectChart({ data, isDark = false, id = "chart-subject" }) {
  const chartRef = useRef(null);
  const { t } = useLanguage();

  if (!data) return null;

  // Paleta de colores
  const mainTextColor = isDark ? '#F3F4F6' : '#111827';
  const subTextColor = isDark ? '#9CA3AF' : '#4B5563';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';

  const chartData = {
    ...data,
    datasets: data.datasets.map(ds => ({
      ...ds,
      backgroundColor: isDark ? '#34D399' : '#10B981',
      borderRadius: 4,
      barPercentage: 0.7,
      categoryPercentage: 0.8
    }))
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y', // Gráfica horizontal
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: t('analytics.charts.subject.title'),
        align: 'start',
        color: mainTextColor,
        font: { size: 16, weight: '700', family: "'Inter', sans-serif" },
        padding: { bottom: 20 }
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: mainTextColor,
        bodyColor: mainTextColor,
        borderColor: isDark ? '#374151' : '#E5E7EB',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        grid: { color: gridColor },
        ticks: { 
          color: subTextColor, 
          callback: v => v + '%',
          font: { weight: '500' }
        }
      },
      y: {
        grid: { display: false },
        ticks: { 
          color: mainTextColor,
          font: { size: 11, weight: '600' },
          autoSkip: false,
          // ✅ FIX: Limpiador de texto inteligente
          callback: function(value) {
            // Obtenemos el texto original de la etiqueta
            const label = this.getLabelForValue(value);
            
            // Si el texto es muy largo (más de 25 caracteres), lo cortamos con ...
            // Si tiene dos puntos (:), mostramos solo la parte derecha para que se vea limpio
            if (typeof label === 'string') {
              if (label.includes(':')) {
                return label.split(':')[1].trim(); // "Materia..." en lugar de ": Materia..."
              }
              return label.length > 30 ? label.substr(0, 30) + '...' : label;
            }
            return label;
          }
        }
      }
    }
  };

  return (
    <div id={id} className="w-full h-80 p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transition-colors duration-300">
      <Bar 
        ref={chartRef} 
        data={chartData} 
        options={options}
        // Clave dinámica para repintado
        key={isDark ? 'dark-subj' : 'light-subj'}
      />
    </div>
  );
}

SubjectChart.propTypes = { data: PropTypes.object, isDark: PropTypes.bool, id: PropTypes.string };
export default SubjectChart;