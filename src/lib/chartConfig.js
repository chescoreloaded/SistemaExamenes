import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

/**
 * Configuración global de Chart.js
 * Registra todos los componentes necesarios y establece defaults
 */

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * Configurar defaults globales
 */
export function setupChartDefaults() {
  // Font defaults
  ChartJS.defaults.font.family = "'Inter', 'system-ui', 'sans-serif'";
  ChartJS.defaults.font.size = 12;

  // Layout defaults
  ChartJS.defaults.layout.padding = 10;

  // Animation defaults
  ChartJS.defaults.animation.duration = 750;
  ChartJS.defaults.animation.easing = 'easeInOutQuart';

  // Responsive defaults
  ChartJS.defaults.responsive = true;
  ChartJS.defaults.maintainAspectRatio = true;

  // Interaction defaults
  ChartJS.defaults.interaction = {
    mode: 'index',
    intersect: false
  };

  // Plugin defaults
  ChartJS.defaults.plugins.legend.display = true;
  ChartJS.defaults.plugins.legend.position = 'top';
  ChartJS.defaults.plugins.tooltip.enabled = true;
  ChartJS.defaults.plugins.tooltip.mode = 'index';
  ChartJS.defaults.plugins.tooltip.intersect = false;
}

/**
 * Configuración para dark mode
 */
export function getChartTheme(isDark = false) {
  return {
    textColor: isDark ? '#f9fafb' : '#1f2937',
    gridColor: isDark ? '#374151' : '#e5e7eb',
    borderColor: isDark ? '#4b5563' : '#d1d5db',
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    
    colors: {
      primary: isDark ? '#60a5fa' : '#3b82f6',
      secondary: isDark ? '#a78bfa' : '#8b5cf6',
      success: isDark ? '#34d399' : '#10b981',
      danger: isDark ? '#f87171' : '#ef4444',
      warning: isDark ? '#fbbf24' : '#f59e0b',
      info: isDark ? '#38bdf8' : '#0ea5e9'
    }
  };
}

/**
 * Paleta de colores para múltiples datasets
 */
export const colorPalette = {
  light: [
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#06b6d4', // cyan
    '#ec4899', // pink
    '#f97316', // orange
    '#14b8a6', // teal
    '#a855f7'  // violet
  ],
  dark: [
    '#60a5fa', // blue
    '#a78bfa', // purple
    '#34d399', // green
    '#fbbf24', // amber
    '#f87171', // red
    '#22d3ee', // cyan
    '#f472b6', // pink
    '#fb923c', // orange
    '#2dd4bf', // teal
    '#c084fc'  // violet
  ]
};

/**
 * Obtener colores de la paleta
 */
export function getChartColors(count = 1, isDark = false) {
  const palette = isDark ? colorPalette.dark : colorPalette.light;
  
  if (count === 1) {
    return palette[0];
  }
  
  // Si necesitamos más colores que los disponibles, repetir la paleta
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(palette[i % palette.length]);
  }
  
  return colors;
}

/**
 * Opciones comunes para Line Charts
 */
export function getLineChartOptions(isDark = false) {
  const theme = getChartTheme(isDark);
  
  return {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: theme.textColor,
          usePointStyle: true,
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: isDark ? '#374151' : '#ffffff',
        titleColor: theme.textColor,
        bodyColor: theme.textColor,
        borderColor: theme.borderColor,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        grid: {
          color: theme.gridColor,
          display: true
        },
        ticks: {
          color: theme.textColor
        },
        border: {
          color: theme.borderColor
        }
      },
      y: {
        grid: {
          color: theme.gridColor,
          display: true
        },
        ticks: {
          color: theme.textColor
        },
        border: {
          color: theme.borderColor
        }
      }
    }
  };
}

/**
 * Opciones comunes para Bar Charts
 */
export function getBarChartOptions(isDark = false) {
  const theme = getChartTheme(isDark);
  
  return {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: theme.textColor,
          usePointStyle: true,
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: isDark ? '#374151' : '#ffffff',
        titleColor: theme.textColor,
        bodyColor: theme.textColor,
        borderColor: theme.borderColor,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: theme.textColor
        },
        border: {
          color: theme.borderColor
        }
      },
      y: {
        grid: {
          color: theme.gridColor,
          display: true
        },
        ticks: {
          color: theme.textColor
        },
        border: {
          color: theme.borderColor
        }
      }
    }
  };
}

/**
 * Opciones comunes para Doughnut Charts
 */
export function getDoughnutChartOptions(isDark = false) {
  const theme = getChartTheme(isDark);
  
  return {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1.5,
    cutout: '60%',
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: theme.textColor,
          usePointStyle: true,
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: isDark ? '#374151' : '#ffffff',
        titleColor: theme.textColor,
        bodyColor: theme.textColor,
        borderColor: theme.borderColor,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };
}

/**
 * Plugin personalizado: Texto central en Doughnut
 */
export const centerTextPlugin = {
  id: 'centerText',
  beforeDraw: (chart) => {
    if (chart.config.options.plugins.centerText?.display) {
      const { ctx, chartArea: { width, height } } = chart;
      const centerX = width / 2;
      const centerY = height / 2;
      
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Texto principal
      ctx.font = 'bold 28px Inter';
      ctx.fillStyle = chart.config.options.plugins.centerText.color || '#000';
      ctx.fillText(
        chart.config.options.plugins.centerText.text || '',
        centerX,
        centerY - 10
      );
      
      // Texto secundario
      if (chart.config.options.plugins.centerText.subtext) {
        ctx.font = '14px Inter';
        ctx.fillStyle = chart.config.options.plugins.centerText.subtextColor || '#666';
        ctx.fillText(
          chart.config.options.plugins.centerText.subtext,
          centerX,
          centerY + 20
        );
      }
      
      ctx.restore();
    }
  }
};

// Registrar plugin personalizado
ChartJS.register(centerTextPlugin);

/**
 * Inicializar configuración al importar
 */
setupChartDefaults();

export default ChartJS;