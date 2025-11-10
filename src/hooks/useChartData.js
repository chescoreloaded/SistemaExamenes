import { useMemo } from 'react';
import { useDarkMode } from './useDarkMode';

/**
 * Hook para preparar datos y configuraciones para Chart.js
 * Incluye soporte completo para dark mode
 */
export function useChartData(analyticsData) {
  const { isDark } = useDarkMode();

  // Colores del tema
  const colors = useMemo(() => ({
    primary: isDark ? '#60a5fa' : '#3b82f6',
    secondary: isDark ? '#a78bfa' : '#8b5cf6',
    success: isDark ? '#34d399' : '#10b981',
    danger: isDark ? '#f87171' : '#ef4444',
    warning: isDark ? '#fbbf24' : '#f59e0b',
    info: isDark ? '#38bdf8' : '#0ea5e9',
    
    // Colores de texto
    textPrimary: isDark ? '#f9fafb' : '#1f2937',
    textSecondary: isDark ? '#d1d5db' : '#6b7280',
    
    // Colores de grid
    gridColor: isDark ? '#374151' : '#e5e7eb',
    borderColor: isDark ? '#4b5563' : '#d1d5db',
    
    // Backgrounds
    bgPrimary: isDark ? '#1f2937' : '#ffffff',
    bgSecondary: isDark ? '#111827' : '#f9fafb'
  }), [isDark]);

  // Configuración base para todos los gráficos
  const baseChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: {
          color: colors.textPrimary,
          font: {
            family: "'Inter', sans-serif",
            size: 12
          },
          padding: 15,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: colors.bgSecondary,
        titleColor: colors.textPrimary,
        bodyColor: colors.textSecondary,
        borderColor: colors.borderColor,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        }
      }
    }
  }), [colors]);

  // 1. GRÁFICO DE RENDIMIENTO (LINE CHART)
  const performanceChartData = useMemo(() => {
    if (!analyticsData?.charts?.performance) {
      return null;
    }

    const perfData = analyticsData.charts.performance;

    // Manejar ambos formatos: array o objeto con labels/scores
    const labels = Array.isArray(perfData) ? perfData.map(d => d.date) : perfData.labels || [];
    const scores = Array.isArray(perfData) ? perfData.map(d => d.score) : perfData.scores || [];

    if (labels.length === 0 || scores.length === 0) {
      return null;
    }

    return {
      labels: labels,
      datasets: [
        {
          label: 'Puntuación (%)',
          data: scores,
          borderColor: colors.primary,
          backgroundColor: `${colors.primary}20`,
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: colors.primary,
          pointBorderColor: colors.bgPrimary,
          pointBorderWidth: 2,
          pointHoverBackgroundColor: colors.primary,
          pointHoverBorderColor: colors.bgPrimary,
          pointHoverBorderWidth: 3
        }
      ]
    };
  }, [analyticsData, colors]);

  const performanceChartOptions = useMemo(() => ({
    ...baseChartOptions,
    scales: {
      x: {
        grid: {
          display: true,
          color: colors.gridColor,
          lineWidth: 1
        },
        ticks: {
          color: colors.textSecondary,
          font: {
            size: 11
          }
        },
        border: {
          color: colors.borderColor
        }
      },
      y: {
        min: 0,
        max: 100,
        grid: {
          display: true,
          color: colors.gridColor,
          lineWidth: 1
        },
        ticks: {
          color: colors.textSecondary,
          font: {
            size: 11
          },
          callback: (value) => value + '%'
        },
        border: {
          color: colors.borderColor
        }
      }
    },
    plugins: {
      ...baseChartOptions.plugins,
      title: {
        display: true,
        text: 'Evolución del Rendimiento',
        color: colors.textPrimary,
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: 20
      }
    }
  }), [baseChartOptions, colors]);

  // 2. GRÁFICO POR MATERIA (BAR CHART)
  const subjectChartData = useMemo(() => {
    if (!analyticsData?.charts?.bySubject) {
      return null;
    }

    const subjectData = analyticsData.charts.bySubject;

    // Manejar ambos formatos: array o objeto con labels/scores
    const labels = Array.isArray(subjectData) 
      ? subjectData.map(s => s.subjectName) 
      : subjectData.labels || [];
    
    const scores = Array.isArray(subjectData) 
      ? subjectData.map(s => s.averageScore) 
      : subjectData.scores || [];

    if (labels.length === 0 || scores.length === 0) {
      return null;
    }

    return {
      labels: labels,
      datasets: [
        {
          label: 'Promedio (%)',
          data: scores,
          backgroundColor: labels.map((_, index) => {
            const hue = (index * 137.5) % 360; // Golden angle
            return isDark 
              ? `hsla(${hue}, 70%, 60%, 0.8)`
              : `hsla(${hue}, 70%, 50%, 0.8)`;
          }),
          borderColor: labels.map((_, index) => {
            const hue = (index * 137.5) % 360;
            return isDark 
              ? `hsla(${hue}, 70%, 70%, 1)`
              : `hsla(${hue}, 70%, 40%, 1)`;
          }),
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false
        }
      ]
    };
  }, [analyticsData, isDark]);

  const subjectChartOptions = useMemo(() => ({
    ...baseChartOptions,
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: colors.textSecondary,
          font: {
            size: 11
          }
        },
        border: {
          color: colors.borderColor
        }
      },
      y: {
        min: 0,
        max: 100,
        grid: {
          display: true,
          color: colors.gridColor
        },
        ticks: {
          color: colors.textSecondary,
          font: {
            size: 11
          },
          callback: (value) => value + '%'
        },
        border: {
          color: colors.borderColor
        }
      }
    },
    plugins: {
      ...baseChartOptions.plugins,
      title: {
        display: true,
        text: 'Rendimiento por Materia',
        color: colors.textPrimary,
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: 20
      },
      legend: {
        display: false
      }
    }
  }), [baseChartOptions, colors]);

  // 3. GRÁFICO DE DISTRIBUCIÓN (DOUGHNUT)
  const distributionChartData = useMemo(() => {
    if (!analyticsData?.charts?.distribution) {
      return null;
    }

    const { correct, incorrect } = analyticsData.charts.distribution;

    return {
      labels: ['Correctas', 'Incorrectas'],
      datasets: [
        {
          data: [correct, incorrect],
          backgroundColor: [
            isDark ? '#34d399' : '#10b981',
            isDark ? '#f87171' : '#ef4444'
          ],
          borderColor: [
            isDark ? '#6ee7b7' : '#059669',
            isDark ? '#fca5a5' : '#dc2626'
          ],
          borderWidth: 3,
          hoverOffset: 10,
          spacing: 2
        }
      ]
    };
  }, [analyticsData, isDark]);

  const distributionChartOptions = useMemo(() => ({
    ...baseChartOptions,
    cutout: '60%',
    plugins: {
      ...baseChartOptions.plugins,
      title: {
        display: true,
        text: 'Distribución de Respuestas',
        color: colors.textPrimary,
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: 20
      },
      tooltip: {
        ...baseChartOptions.plugins.tooltip,
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
  }), [baseChartOptions, colors]);

  // 4. GRÁFICO DE TIEMPO (AREA CHART)
  const timeChartData = useMemo(() => {
    if (!analyticsData?.charts?.performance) {
      return null;
    }

    const perfData = analyticsData.charts.performance;

    // Convertir a formato array si viene como objeto
    let dataArray = [];
    if (Array.isArray(perfData)) {
      dataArray = perfData;
    } else if (perfData.labels && perfData.scores && 
               Array.isArray(perfData.labels) && Array.isArray(perfData.scores)) {
      // Convertir de formato {labels, scores} a array de objetos
      dataArray = perfData.labels.map((label, index) => ({
        timestamp: new Date(label).getTime() || Date.now(),
        score: perfData.scores[index] || 0
      }));
    }

    if (dataArray.length === 0) {
      return null;
    }

    // Agrupar por semana
    const weeklyData = groupByWeek(dataArray);

    if (!Array.isArray(weeklyData) || weeklyData.length === 0) {
      return null;
    }

    return {
      labels: weeklyData.map(w => w.label),
      datasets: [
        {
          label: 'Minutos',
          data: weeklyData.map(w => w.minutes),
          borderColor: colors.secondary,
          backgroundColor: `${colors.secondary}30`,
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: colors.secondary,
          pointBorderColor: colors.bgPrimary,
          pointBorderWidth: 2
        }
      ]
    };
  }, [analyticsData, colors]);

  const timeChartOptions = useMemo(() => ({
    ...baseChartOptions,
    scales: {
      x: {
        grid: {
          display: true,
          color: colors.gridColor
        },
        ticks: {
          color: colors.textSecondary,
          font: {
            size: 11
          }
        },
        border: {
          color: colors.borderColor
        }
      },
      y: {
        min: 0,
        grid: {
          display: true,
          color: colors.gridColor
        },
        ticks: {
          color: colors.textSecondary,
          font: {
            size: 11
          },
          callback: (value) => value + ' min'
        },
        border: {
          color: colors.borderColor
        }
      }
    },
    plugins: {
      ...baseChartOptions.plugins,
      title: {
        display: true,
        text: 'Tiempo de Estudio Semanal',
        color: colors.textPrimary,
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: 20
      }
    }
  }), [baseChartOptions, colors]);

  return {
    performance: {
      data: performanceChartData,
      options: performanceChartOptions
    },
    subject: {
      data: subjectChartData,
      options: subjectChartOptions
    },
    distribution: {
      data: distributionChartData,
      options: distributionChartOptions
    },
    time: {
      data: timeChartData,
      options: timeChartOptions
    },
    colors
  };
}

// Helper: Agrupar datos por semana
function groupByWeek(data) {
  // Validar que data sea un array
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  const weeks = {};
  
  data.forEach(item => {
    const date = new Date(item.timestamp);
    const weekStart = getWeekStart(date);
    const weekKey = weekStart.toISOString().split('T')[0];
    
    if (!weeks[weekKey]) {
      weeks[weekKey] = {
        label: formatWeekLabel(weekStart),
        minutes: 0,
        exams: 0
      };
    }
    
    // Asumir tiempo promedio por examen si no está disponible
    weeks[weekKey].minutes += 20; // minutos por defecto
    weeks[weekKey].exams += 1;
  });
  
  return Object.values(weeks).sort((a, b) => 
    new Date(a.label) - new Date(b.label)
  );
}

// Helper: Obtener inicio de semana
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

// Helper: Formatear etiqueta de semana
function formatWeekLabel(date) {
  return date.toLocaleDateString('es-ES', { 
    month: 'short', 
    day: 'numeric' 
  });
}

export default useChartData;