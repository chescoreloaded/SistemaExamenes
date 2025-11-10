import { useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js';
import PropTypes from 'prop-types';
import { useLanguage } from '@/context/LanguageContext'; // ✅ Import hook

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function SubjectChart({ data, isDark = false, id = "chart-subject" }) {
  const chartRef = useRef(null);
  const { t } = useLanguage(); // ✅ Usar hook

  if (!data || !data.labels || !data.datasets) {
    return (
      <div id={id} className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">{t('analytics.noData.chart')}</p>
      </div>
    );
  }

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1.5,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: isDark ? '#e5e7eb' : '#374151', font: { size: 12, family: "'Inter', sans-serif" }, usePointStyle: true, padding: 15 }
      },
      title: {
        display: true,
        text: `📚 ${t('analytics.charts.subject.title')}`, // ✅ Título traducido
        color: isDark ? '#f9fafb' : '#111827',
        font: { size: 16, weight: 'bold', family: "'Inter', sans-serif" },
        padding: { top: 10, bottom: 20 }
      },
      tooltip: {
        // ... estilos igual ...
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) label += context.parsed.y.toFixed(1) + '%';
            return label;
          },
          // Puedes traducir también 'Exámenes' y 'Tiempo' si lo deseas
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true, max: 100,
        ticks: { callback: (value) => value + '%', color: isDark ? '#9ca3af' : '#6b7280', font: { size: 11 } },
        grid: { color: isDark ? '#374151' : '#e5e7eb', drawBorder: false }
      },
      x: {
        ticks: { color: isDark ? '#9ca3af' : '#6b7280', font: { size: 11 }, maxRotation: 45, minRotation: 0 },
        grid: { display: false }
      }
    },
    elements: { bar: { borderRadius: 6, borderWidth: 2, borderSkipped: false } }
  };

  return (
    <div id={id} className="w-full h-full p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <Bar ref={chartRef} data={data} options={options} />
    </div>
  );
}

SubjectChart.propTypes = {
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
        ]),
        additionalInfo: PropTypes.arrayOf(PropTypes.object)
      })
    ).isRequired
  }),
  isDark: PropTypes.bool,
  id: PropTypes.string
};

export default SubjectChart;