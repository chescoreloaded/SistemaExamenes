import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { useSoundContext } from '@/context/SoundContext';
import { captureFullDashboard } from '@/utils/chartToImage';
// ✅ CORRECCIÓN: Importamos el ThemeContext en lugar del hook eliminado
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';

/**
 * ExportButton - Botón para exportar dashboard a PDF (Internacionalizado)
 */
export function ExportButton({ analyticsData, onExportStart, onExportComplete, onExportError, className = '' }) {
  const { playClick, playCorrect } = useSoundContext();
  
  // ✅ Usamos el hook correcto del contexto global
  const { isDark } = useTheme();
  
  const { t } = useLanguage();
  
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleExport = async () => {
    playClick();
    
    try {
      setStatus('capturing');
      setProgress(0);
      if (onExportStart) onExportStart();

      // Paso 1: Capturar gráficos
      setProgress(10);
      await new Promise(resolve => setTimeout(resolve, 200));

      setProgress(30);
      // Pasamos el isDark real del tema
      const captured = await captureFullDashboard(isDark);

      if (!captured.success) {
        throw new Error('Error al capturar los gráficos');
      }

      // Paso 2: Generar PDF
      setStatus('generating');
      setProgress(50);
      
      // Importar dinámicamente react-pdf
      const [
        { saveAs },
        { Document, Page, Text, View, Image, StyleSheet, pdf }
      ] = await Promise.all([
        import('file-saver'),
        import('@react-pdf/renderer')
      ]);

      setProgress(70);

      // Definir estilos
      const styles = StyleSheet.create({
        page: {
          padding: 30,
          backgroundColor: '#ffffff',
          fontFamily: 'Helvetica'
        },
        header: {
          marginBottom: 20,
          borderBottom: 2,
          borderBottomColor: '#3b82f6',
          paddingBottom: 10
        },
        title: {
          fontSize: 24,
          fontWeight: 'bold',
          color: '#2563eb',
          marginBottom: 5
        },
        subtitle: {
          fontSize: 12,
          color: '#6b7280'
        },
        section: {
          marginBottom: 15
        },
        statsImage: {
          width: '100%',
          height: 'auto',
          marginBottom: 15
        },
        chartSection: {
          marginBottom: 15
        },
        chartTitle: {
          fontSize: 14,
          fontWeight: 'bold',
          color: '#374151',
          marginBottom: 8
        },
        chartTitleSmall: {
          fontSize: 12,
          fontWeight: 'bold',
          color: '#374151',
          marginBottom: 6
        },
        chartImage: {
          width: '100%',
          height: 180
        },
        chartsRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 15
        },
        chartHalf: {
          width: '48%'
        },
        chartImageSmall: {
          width: '100%',
          height: 140
        },
        tableImage: {
          width: '100%',
          height: 'auto'
        },
        footer: {
          position: 'absolute',
          bottom: 20,
          left: 30,
          right: 30,
          textAlign: 'center',
          borderTop: 1,
          borderTopColor: '#e5e7eb',
          paddingTop: 10
        },
        footerText: {
          fontSize: 10,
          color: '#9ca3af'
        }
      });

      // Crear documento PDF
      const PDFDocument = () => (
        <Document>
          <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Analytics Dashboard</Text>
              <Text style={styles.subtitle}>
                Generado el {new Date().toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </Text>
            </View>

            {/* Stats Cards */}
            {captured.statsCards && (
              <View style={styles.section}>
                <Image src={captured.statsCards} style={styles.statsImage} />
              </View>
            )}

            {/* Gráficos */}
            {captured.charts && (
              <>
                {/* Performance Chart */}
                {captured.charts['chart-performance'] && (
                  <View style={styles.chartSection}>
                    <Text style={styles.chartTitle}>Rendimiento a lo Largo del Tiempo</Text>
                    <Image src={captured.charts['chart-performance']} style={styles.chartImage} />
                  </View>
                )}

                {/* Subject and Distribution Charts */}
                <View style={styles.chartsRow}>
                  {captured.charts['chart-subject'] && (
                    <View style={styles.chartHalf}>
                      <Text style={styles.chartTitleSmall}>Por Materia</Text>
                      <Image src={captured.charts['chart-subject']} style={styles.chartImageSmall} />
                    </View>
                  )}
                  
                  {captured.charts['chart-distribution'] && (
                    <View style={styles.chartHalf}>
                      <Text style={styles.chartTitleSmall}>Distribución</Text>
                      <Image src={captured.charts['chart-distribution']} style={styles.chartImageSmall} />
                    </View>
                  )}
                </View>
              </>
            )}

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                InovaCode - Sistema de Exámenes y Estudio
              </Text>
            </View>
          </Page>

          {/* Página 2 - Tabla de histórico */}
          {captured.historyTable && (
            <Page size="A4" style={styles.page}>
              <View style={styles.header}>
                <Text style={styles.title}>Histórico Detallado</Text>
              </View>

              <View style={styles.section}>
                <Image src={captured.historyTable} style={styles.tableImage} />
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Página 2 de 2</Text>
              </View>
            </Page>
          )}
        </Document>
      );

      setProgress(85);

      // Generar blob del PDF
      const blob = await pdf(<PDFDocument />).toBlob();

      setProgress(95);

      // Descargar
      const fileName = `analytics-${new Date().toISOString().split('T')[0]}.pdf`;
      saveAs(blob, fileName);

      // Completado
      setProgress(100);
      setStatus('success');
      playCorrect();
      
      if (onExportComplete) onExportComplete(fileName);

      setTimeout(() => {
        setStatus('idle');
        setProgress(0);
      }, 3000);

    } catch (err) {
      console.error('Error exportando PDF:', err);
      setError(err.message);
      setStatus('error');
      
      if (onExportError) onExportError(err);

      setTimeout(() => {
        setStatus('idle');
        setProgress(0);
        setError(null);
      }, 5000);
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'capturing':
        return (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="text-2xl"
            >
              📸
            </motion.div>
            <span>Capturando gráficos...</span>
          </>
        );

      case 'generating':
        return (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="text-2xl"
            >
              ⚙️
            </motion.div>
            <span>{t('analytics.export.generating')}</span>
          </>
        );

      case 'success':
        return (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5 }}
              className="text-2xl"
            >
              ✅
            </motion.div>
            <span>¡PDF descargado!</span>
          </>
        );

      case 'error':
        return (
          <>
            <span className="text-2xl">❌</span>
            <span>Error al exportar</span>
          </>
        );

      default:
        return (
          <>
            <span className="text-2xl">📄</span>
            <span>{t('analytics.export.button')}</span>
          </>
        );
    }
  };

  const isDisabled = status !== 'idle' && status !== 'success';

  return (
    <div className={`relative ${className}`}>
      <motion.button
        whileHover={!isDisabled ? { scale: 1.05 } : {}}
        whileTap={!isDisabled ? { scale: 0.95 } : {}}
        onClick={handleExport}
        disabled={isDisabled}
        className={`
          flex items-center gap-3 px-6 py-3
          rounded-xl font-semibold shadow-lg
          transition-all duration-300
          ${status === 'success' 
            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
            : status === 'error'
            ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
            : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white'
          }
          ${isDisabled && status !== 'success' ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {renderContent()}
      </motion.button>

      {/* Progress Bar */}
      <AnimatePresence>
        {(status === 'capturing' || status === 'generating') && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full mt-2 left-0 right-0"
          >
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
              />
            </div>
            <p className="text-xs text-center text-gray-600 dark:text-gray-400 mt-1">
              {progress}%
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {status === 'error' && error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full mt-2 left-0 right-0 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg"
          >
            <p className="text-xs text-red-700 dark:text-red-400">
              {error}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

ExportButton.propTypes = {
  analyticsData: PropTypes.object,
  onExportStart: PropTypes.func,
  onExportComplete: PropTypes.func,
  onExportError: PropTypes.func,
  className: PropTypes.string
};

export default ExportButton;