import { useRef, useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import PropTypes from 'prop-types';
import { useLanguage } from '@/context/LanguageContext';

ChartJS.register(ArcElement, Title, Tooltip, Legend);

export function DistributionChart({ data, isDark = false, id = "chart-distribution" }) {
  const { t } = useLanguage();

  const total = data?.datasets?.[0]?.data.reduce((a, b) => a + b, 0) || 0;

  // ✅ PALETA DE ALTO CONTRASTE
  const mainTextColor = isDark ? '#FFFFFF' : '#000000'; 
  const subTextColor = isDark ? '#9CA3AF' : '#374151';

  // Plugin de Texto Central
  const textCenterPlugin = useMemo(() => ({
    id: 'textCenter',
    beforeDraw: (chart) => {
      const { ctx } = chart;
      const { top, bottom, left, right, height } = chart.chartArea;
      const centerX = (left + right) / 2;
      const centerY = (top + bottom) / 2;

      ctx.save();
      const fontSizeNumber = height / 8; 
      const fontSizeLabel = height / 25;

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // 1. Número Total
      ctx.font = `bold ${fontSizeNumber}px 'Inter', sans-serif`;
      ctx.fillStyle = mainTextColor; 
      ctx.fillText(total.toString(), centerX, centerY - (fontSizeNumber * 0.15));

      // 2. Etiqueta TOTAL
      ctx.font = `bold ${fontSizeLabel}px 'Inter', sans-serif`;
      ctx.fillStyle = subTextColor; 
      const labelText = (t('common.total') || 'TOTAL').toUpperCase();
      ctx.fillText(labelText, centerX, centerY + (fontSizeNumber * 0.55));

      ctx.restore();
    }
  }), [total, mainTextColor, subTextColor, t]);

  if (!data) return null;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: subTextColor,
          font: { size: 12, weight: '600', family: "'Inter', sans-serif" },
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: true,
        text: `🎯 ${t('analytics.charts.distribution.title')}`,
        color: mainTextColor,
        font: { size: 16, weight: '800', family: "'Inter', sans-serif" },
        padding: { top: 10, bottom: 20 },
        align: 'start'
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDark ? '#F3F4F6' : '#000000',
        bodyColor: isDark ? '#F3F4F6' : '#000000',
        borderColor: isDark ? '#374151' : '#E5E7EB',
        borderWidth: 1
      }
    },
    cutout: '75%',
    elements: { arc: { borderWidth: 0 } }
  };

  return (
    <div id={id} className="w-full h-80 p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <Doughnut 
        data={data} 
        options={options} 
        plugins={[textCenterPlugin]} 
        // ✅ Forzar repintado con colores nuevos
        key={`${isDark ? 'dark' : 'light'}-${total}`} 
      />
    </div>
  );
}

DistributionChart.propTypes = { 
  data: PropTypes.object, 
  isDark: PropTypes.bool, 
  id: PropTypes.string 
};

export default DistributionChart;