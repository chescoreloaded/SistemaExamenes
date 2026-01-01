import { useRef, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import PropTypes from 'prop-types';
import { useLanguage } from '@/context/LanguageContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export function PerformanceChart({ data, isDark = false, id = "chart-performance" }) {
  const chartRef = useRef(null);
  const { t } = useLanguage();

  const translatedData = useMemo(() => {
    if (!data || !data.datasets) return null;
    return {
      ...data,
      datasets: data.datasets.map(dataset => ({
        ...dataset,
        label: t('analytics.charts.performance.scoreLegend'),
        // Dark: Azul Neón | Light: Indigo Oscuro (#312e81)
        borderColor: isDark ? '#60A5FA' : '#312e81',
        backgroundColor: isDark ? 'rgba(96, 165, 250, 0.1)' : 'rgba(49, 46, 129, 0.1)',
        // Puntos: Dark -> Azul | Light -> Blanco con borde oscuro
        pointBackgroundColor: isDark ? '#1E3A8A' : '#ffffff',
        pointBorderColor: isDark ? '#60A5FA' : '#312e81',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }))
    };
  }, [data, t, isDark]);

  if (!translatedData) return null;

  // ✅ NEGRO PURO para modo claro
  const mainTextColor = isDark ? '#F3F4F6' : '#000000'; 
  const subTextColor = isDark ? '#9CA3AF' : '#111827'; // Gray-900 casi negro
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.15)';

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        align: 'end',
        labels: { 
          color: subTextColor,
          usePointStyle: true, 
          boxWidth: 8, 
          font: { family: "'Inter', sans-serif", weight: '600' } 
        }
      },
      title: {
        display: true,
        text: t('analytics.charts.performance.title'),
        align: 'start',
        color: mainTextColor,
        font: { size: 16, weight: '800', family: "'Inter', sans-serif" },
        padding: { bottom: 20 }
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDark ? '#F3F4F6' : '#000000',
        bodyColor: isDark ? '#F3F4F6' : '#000000',
        borderColor: isDark ? '#374151' : '#E5E7EB',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: { color: gridColor },
        ticks: { color: subTextColor, font: { weight: '600' }, callback: v => v + '%' }
      },
      x: {
        grid: { display: false },
        ticks: { color: subTextColor, font: { size: 11, weight: '600' }, maxRotation: 45 }
      }
    },
    elements: { line: { tension: 0.4, borderWidth: 3 } }
  };

  return (
    <div id={id} className="w-full h-80 p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <Line 
        ref={chartRef} 
        data={translatedData} 
        options={options} 
        // Forzamos repintado al cambiar tema
        key={isDark ? 'dark-perf' : 'light-perf'} 
      />
    </div>
  );
}
PerformanceChart.propTypes = { data: PropTypes.object, isDark: PropTypes.bool, id: PropTypes.string };
export default PerformanceChart;