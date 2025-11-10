export const TRANSLATIONS = {
  es: {
    app: {
      title: 'Sistema de Exámenes',
      subtitle: 'Selecciona una materia para comenzar 🚀'
    },
    common: {
      loading: 'Cargando...',
      error: 'Error',
      retry: 'Reintentar',
      subjects: 'Materias',
      start: 'Comenzar',
      continue: 'Continuar',
      results: 'Resultados',
      home: 'Inicio',
      yes: 'Sí',
      no: 'No',
      cancel: 'Cancelar',
      exit: 'Salir',
      submit: 'Terminar',
      back: 'Anterior',
      next: 'Siguiente',
      finish: 'Finalizar',
      total: 'Total',
      difficulty: {
        basico: 'Básico',
        intermedio: 'Intermedio',
        avanzado: 'Avanzado'
      },
      filters: {
            academicLevel: 'Nivel Académico',
            difficulty: 'Dificultad',
            allOptions: 'Todas las opciones',
            year: 'Año / Grado',  // ✅ NUEVO
            period: 'Periodo'     // ✅ NUEVO
        },
        pagination: {
            previous: 'Anterior',
            next: 'Siguiente',
            pageOf: 'Página {current} de {total}', // Usaremos reemplazo simple
            showing: 'Mostrando {start}-{end} de {total} resultados'
        }
    },
    navigation: { // ✅ NUEVA SECCIÓN
      home: 'Mis Cursos',
      explorer: 'Explorar',
      analytics: 'Progreso'
    },
    home: {
      noSubjects: 'No hay materias disponibles',
      noSubjectsSub: 'Agrega materias para comenzar a crear exámenes',
      modes: {
        exam: {
          title: 'Modo Examen',
          desc: 'Practica con tiempo límite y obtén tu calificación final',
          features: '⏱️ Cronómetro • 📊 Calificación'
        },
        practice: {
          title: 'Modo Práctica',
          desc: 'Aprende con feedback instantáneo y sin presión de tiempo',
          features: '✅ Respuestas inmediatas • 💡 Explicaciones'
        },
        study: {
          title: 'Modo Estudio',
          desc: 'Repasa con flashcards interactivas y memoriza conceptos clave',
          features: '🔄 Flip animado • 🎲 Aleatorio'
        }
      },
      actions: {
        examBtn: 'Modo Examen',
        practiceBtn: 'Práctica',
        studyBtn: 'Estudio'
      },
      stats: {
        baseXp: 'XP Base',
        hours: 'Horas',
        level: 'Nivel'
      }
    },
    search: {
      placeholder: 'Buscar por nombre o descripción...'
    },
explorer: {
      title: 'Explorar Cursos',
      subtitle: 'Descubre todo nuestro catálogo académico',
      resultsFound: 'cursos encontrados',
      noResults: 'No encontramos cursos',
      tryChangingFilters: 'Intenta ajustar tus filtros o términos de búsqueda'
    },
    exam: {
      modes: {
        exam: 'Modo Examen',
        practice: 'Modo Práctica'
      },
      ui: {
        navigator: 'Navegador',
        hide: 'Ocultar',
        tipMobile: 'Tip: Desliza ← → para navegar, ↓ para navegador',
        exitBtn: 'Salir',
        legend: {
          current: 'Actual',
          answered: 'Respondida',
          marked: 'Marcada',
          unanswered: 'Sin responder'
        }
      },
      stats: {
        title: 'Estadísticas',
        accuracy: 'Precisión',
        streak: 'Racha Diaria',
        totalXp: 'XP Total',
        days: 'días',
        correctCount: 'correctas'
      },
      modals: {
        finish: {
          title: '⚠️ Confirmar Envío',
          prefix: 'Tienes',
          suffix: 'pregunta(s) sin responder.',
          confirm: '¿Estás seguro de que quieres terminar el examen?',
          btn: 'Sí, Terminar'
        },
        exit: {
          title: '⚠️ Salir del Examen',
          examWarning: 'Si sales ahora, tu progreso se guardará localmente pero no podrás reanudar este examen.',
          practiceWarning: 'Si sales ahora, perderás el progreso de esta sesión.',
          confirm: '¿Estás seguro de que quieres salir?',
          btn: 'Sí, Salir'
        }
      },
      shortcuts: {
        title: 'Atajos de Teclado',
        nav: 'Navegar',
        select: 'Seleccionar Opción',
        mark: 'Marcar Revisión',
        next: 'Siguiente (Práctica)'
      },
      feedback: {
        correct: {
          title: '¡Correcto!',
          subtitle: '¡Excelente trabajo! Sigue así 💪'
        },
        incorrect: {
          title: 'Incorrecto',
          subtitle: 'No te preocupes, ¡de los errores se aprende! 🧠'
        },
        labels: {
          question: 'PREGUNTA',
          yourAnswer: 'Tu respuesta:',
          correctAnswer: 'Respuesta correcta:',
          yourCorrectAnswer: 'Tu respuesta correcta:'
        },
        actions: {
          seeExplanation: 'Ver explicación detallada',
          hideExplanation: 'Ocultar explicación',
          continue: 'Continuar'
        }
      }
    },
    study: {
      title: 'Modo Estudio',
      ui: {
        navigatorTitle: 'Navegación de Tarjetas',
        shuffle: 'Mezclar',
        reset: 'Reiniciar',
        mark: 'Marcar',
        flip: 'Girar',
        cardCurrent: 'Tarjeta actual',
        cardStudied: 'Estudiada',
        cardMarked: 'Marcada',
        cardPending: 'Sin estudiar',
        progress: 'tarjetas estudiadas',
        tip: 'Tip: Usa Espacio/Enter para girar, ← → para navegar'
      },
      modals: {
        exit: {
          title: '⚠️ Salir del modo estudio',
          text: 'Tu progreso se guardará automáticamente.\n¿Estás seguro de que quieres salir?',
          confirm: 'Sí, salir',
          cancel: 'Cancelar'
        }
      }
    },
    results: {
      breadcrumb: 'Resultados',
      success: '¡Felicidades! Has aprobado',
      fail: 'Sigue practicando',
      scoreLabel: 'Puntuación final',
      stats: {
        correct: 'Correctas',
        incorrect: 'Incorrectas',
        time: 'Tiempo'
      },
      actions: {
        review: 'Ver revisión detallada de todas las preguntas',
        home: 'Volver al inicio',
        retry: 'Intentar de nuevo'
      }
    },
    review: {
      title: 'Revisión Detallada',
      score: 'Calificación',
      filters: {
        all: 'Todas',
        correct: 'Correctas',
        incorrect: 'Incorrectas',
        unanswered: 'Sin responder'
      },
      legend: {
        correct: 'Correcta',
        incorrect: 'Incorrecta',
        unanswered: 'Sin responder'
      },
      question: {
        title: 'Pregunta',
        unansweredLabel: 'No respondiste esta pregunta',
        explanation: 'Explicación',
        yourAnswer: 'Tu respuesta',
        correctAnswer: 'Respuesta correcta'
      },
      nav: {
        title: 'Navegación',
        pregs: 'pregs.'
      }
    },
    gamification: {
      streak: {
        dailyTitle: 'Racha Diaria',
        currentTitle: 'Racha Actual',
        best: 'Mejor racha',
        days: 'días',
        correct: 'correctas',
        consecutiveDays: 'días consecutivos',
        consecutiveAnswers: 'respuestas seguidas',
        encouragement: '💪 ¡No te rindas! Tu récord es de',
        messages: {
          daily: {
            start: '¡Empieza tu racha hoy!',
            keepGoing: '¡Sigue así!',
            great: '¡Gran racha!',
            unstoppable: '¡Imparable!',
            legendary: '¡LEGENDARIO!'
          },
          correct: {
            start: 'Responde correctamente',
            good: '¡Buena racha!',
            onFire: '¡En fuego!',
            incredible: '¡Increíble!',
            perfect: '¡PERFECTO!'
          }
        }
      },
      level: {
        level: 'Nivel',
        nextLevel: 'Próximo nivel',
        progress: 'Progreso al siguiente nivel',
        remaining: 'Faltan',
        forNext: 'para el siguiente nivel'
      }
    },
    analytics: {
      title: 'Panel de Rendimiento',
      subtitle: 'Análisis completo de tu rendimiento y progreso',
      noData: {
        title: '¡Comienza tu viaje de aprendizaje!',
        subtitle: 'Completa tu primer examen para ver estadísticas y análisis detallados',
        titleFiltered: 'Sin resultados para estos filtros',
        subtitleFiltered: 'Intenta cambiar los filtros para ver más datos',
        chart: 'No hay datos disponibles para este gráfico'
      },
      stats: {
        totalExams: 'Total Exámenes',
        averageScore: 'Promedio General'
      },
      charts: {
        performance: {
          title: 'Rendimiento a lo Largo del Tiempo',
          scoreLegend: 'Puntuación (%)'
        },
        subject: {
          title: 'Rendimiento por Materia'
        },
        distribution: {
          title: 'Distribución de Resultados',
          correct: 'Correctas',
          incorrect: 'Incorrectas'
        }
      },
      filters: {
        clear: 'Limpiar filtros',
        allTime: 'Todo el tiempo',
        lastWeek: 'Últimos 7 días',
        lastMonth: 'Último mes',
        last3Months: 'Últimos 3 meses',
        lastYear: 'Último año',
        subjectPlaceholder: 'Seleccionar materia',
        allSubjects: 'Todas las materias'
      },
      history: {
        title: 'Historial de Exámenes',
        columns: {
          date: 'Fecha',
          subject: 'Materia',
          score: 'Puntuación',
          answers: 'Respuestas',
          time: 'Tiempo',
          status: 'Estado'
        },
        status: {
          passed: 'Aprobado',
          failed: 'Reprobado'
        },
        footer: {
          totalExams: 'Total exámenes',
          passed: 'Aprobados',
          average: 'Promedio'
        }
      },
      export: {
        button: 'Exportar PDF',
        generating: 'Generando...'
      }
    },
    footer: {
      tipPrefix: 'Tip:',
      tipText: 'Usa los atajos de teclado para navegar más rápido',
      shortcuts: {
        nav: 'Navegar',
        answer: 'Responder',
        mark: 'Marcar',
        flip: 'Voltear',
        exit: 'Salir'
      }
    }
  },
  //****************************************************************************************************************************************** */
   //****************************************************************************************************************************************** */
  en: {
    app: {
      title: 'Exam System',
      subtitle: 'Select a subject to start 🚀'
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      retry: 'Retry',
      subjects: 'Subjects',
      start: 'Start',
      continue: 'Continue',
      results: 'Results',
      home: 'Home',
      yes: 'Yes',
      no: 'No',
      cancel: 'Cancel',
      exit: 'Exit',
      submit: 'Submit',
      back: 'Previous',
      next: 'Next',
      finish: 'Finish',
      total: 'Total',
      difficulty: {
        basico: 'Basic',
        intermedio: 'Intermediate',
        avanzado: 'Advanced'
      },
      filters: {
            academicLevel: 'Academic Level',
            difficulty: 'Difficulty',
            allOptions: 'All options',
            year: 'Year / Grade', // ✅ NUEVO
            period: 'Period'      // ✅ NUEVO
        },
        pagination: {
            previous: 'Previous',
            next: 'Next',
            pageOf: 'Page {current} of {total}',
            showing: 'Showing {start}-{end} of {total} results'
        }
    },
    navigation: { // ✅ NUEVA SECCIÓN
      home: 'My Courses',
      explorer: 'Explore',
      analytics: 'Progress'
    },
    home: {
      noSubjects: 'No subjects available',
      noSubjectsSub: 'Add subjects to start creating exams',
      modes: {
        exam: {
          title: 'Exam Mode',
          desc: 'Practice with time limit and get your final score',
          features: '⏱️ Timer • 📊 Grading'
        },
        practice: {
          title: 'Practice Mode',
          desc: 'Learn with instant feedback and no time pressure',
          features: '✅ Instant answers • 💡 Explanations'
        },
        study: {
          title: 'Study Mode',
          desc: 'Review with interactive flashcards and memorize key concepts',
          features: '🔄 Animated flip • 🎲 Random'
        }
      },
      actions: {
        examBtn: 'Exam Mode',
        practiceBtn: 'Practice',
        studyBtn: 'Study'
      },
      stats: {
        baseXp: 'Base XP',
        hours: 'Hours',
        level: 'Level'
      }
    },
    search: {
      placeholder: 'Search by name or description...'
    },
    explorer: {
      title: 'Explore Courses',
      subtitle: 'Discover our full academic catalog',
      resultsFound: 'courses found',
      noResults: 'No courses found',
      tryChangingFilters: 'Try adjusting filters or search terms'
    },
    exam: {
      modes: {
        exam: 'Exam Mode',
        practice: 'Practice Mode'
      },
      ui: {
        navigator: 'Navigator',
        hide: 'Hide',
        tipMobile: 'Tip: Swipe ← → to navigate, ↓ for navigator',
        exitBtn: 'Exit',
        legend: {
          current: 'Current',
          answered: 'Answered',
          marked: 'Marked',
          unanswered: 'Unanswered'
        }
      },
      stats: {
        title: 'Statistics',
        accuracy: 'Accuracy',
        streak: 'Daily Streak',
        totalXp: 'Total XP',
        days: 'days',
        correctCount: 'correct'
      },
      modals: {
        finish: {
          title: '⚠️ Confirm Submission',
          prefix: 'You have',
          suffix: 'unanswered question(s).',
          confirm: 'Are you sure you want to submit the exam?',
          btn: 'Yes, Submit'
        },
        exit: {
          title: '⚠️ Exit Exam',
          examWarning: 'If you exit now, your progress will be saved locally, but you cannot resume this exam.',
          practiceWarning: 'If you exit now, your practice progress will be lost.',
          confirm: 'Are you sure you want to exit?',
          btn: 'Yes, Exit'
        }
      },
      shortcuts: {
        title: 'Keyboard Shortcuts',
        nav: 'Navigate',
        select: 'Select Option',
        mark: 'Mark for Review',
        next: 'Next (Practice)'
      },
      feedback: {
        correct: {
          title: 'Correct!',
          subtitle: 'Excellent work! Keep it up 💪'
        },
        incorrect: {
          title: 'Incorrect',
          subtitle: 'Don\'t worry, we learn from mistakes! 🧠'
        },
        labels: {
          question: 'QUESTION',
          yourAnswer: 'Your answer:',
          correctAnswer: 'Correct answer:',
          yourCorrectAnswer: 'Your correct answer:'
        },
        actions: {
          seeExplanation: 'See detailed explanation',
          hideExplanation: 'Hide explanation',
          continue: 'Continue'
        }
      }
    },
    study: {
      title: 'Study Mode',
      ui: {
        navigatorTitle: 'Card Navigator',
        shuffle: 'Shuffle',
        reset: 'Reset',
        mark: 'Mark',
        flip: 'Flip',
        cardCurrent: 'Current card',
        cardStudied: 'Studied',
        cardMarked: 'Marked',
        cardPending: 'To study',
        progress: 'cards studied',
        tip: 'Tip: Use Space/Enter to flip, ← → to navigate'
      },
      modals: {
        exit: {
          title: '⚠️ Exit study mode',
          text: 'Your progress will be saved automatically.\nAre you sure you want to exit?',
          confirm: 'Yes, exit',
          cancel: 'Cancel'
        }
      }
    },
    results: {
      breadcrumb: 'Results',
      success: 'Congratulations! You passed',
      fail: 'Keep practicing',
      scoreLabel: 'Final Score',
      stats: {
        correct: 'Correct',
        incorrect: 'Incorrect',
        time: 'Time'
      },
      actions: {
        review: 'See detailed review of all questions',
        home: 'Back to Home',
        retry: 'Try again'
      }
    },
    review: {
      title: 'Detailed Review',
      score: 'Score',
      filters: {
        all: 'All',
        correct: 'Correct',
        incorrect: 'Incorrect',
        unanswered: 'Unanswered'
      },
      legend: {
        correct: 'Correct',
        incorrect: 'Incorrect',
        unanswered: 'Unanswered'
      },
      question: {
        title: 'Question',
        unansweredLabel: 'You did not answer this question',
        explanation: 'Explanation',
        yourAnswer: 'Your answer',
        correctAnswer: 'Correct answer'
      },
      nav: {
        title: 'Navigation',
        pregs: 'qs.'
      }
    },
    gamification: {
      streak: {
        dailyTitle: 'Daily Streak',
        currentTitle: 'Current Streak',
        best: 'Best Streak',
        days: 'days',
        correct: 'correct',
        consecutiveDays: 'consecutive days',
        consecutiveAnswers: 'answers in a row',
        encouragement: '💪 Don\'t give up! Your record is',
        messages: {
          daily: {
            start: 'Start your streak today!',
            keepGoing: 'Keep it up!',
            great: 'Great streak!',
            unstoppable: 'Unstoppable!',
            legendary: 'LEGENDARY!'
          },
          correct: {
            start: 'Answer correctly',
            good: 'Good streak!',
            onFire: 'On fire!',
            incredible: 'Incredible!',
            perfect: 'PERFECT!'
          }
        }
      },
      level: {
        level: 'Level',
        nextLevel: 'Next Level',
        progress: 'Progress to next level',
        remaining: 'Remaining',
        forNext: 'for next level'
      }
    },
    analytics: {
      title: 'Performance Dashboard',
      subtitle: 'Complete analysis of your performance and progress',
      noData: {
        title: 'Start your learning journey!',
        subtitle: 'Complete your first exam to see detailed statistics and analysis',
        titleFiltered: 'No results for these filters',
        subtitleFiltered: 'Try changing filters to see more data',
        chart: 'No data available for this chart'
      },
      stats: {
        totalExams: 'Total Exams',
        averageScore: 'Average Score'
      },
      charts: {
        performance: {
          title: 'Performance Over Time',
          scoreLegend: 'Score (%)'
        },
        subject: {
          title: 'Performance by Subject'
        },
        distribution: {
          title: 'Result Distribution',
          correct: 'Correct',
          incorrect: 'Incorrect'
        }
      },
      filters: {
        clear: 'Clear filters',
        allTime: 'All time',
        lastWeek: 'Last 7 days',
        lastMonth: 'Last month',
        last3Months: 'Last 3 months',
        lastYear: 'Last year',
        subjectPlaceholder: 'Select Subject',
        allSubjects: 'All Subjects'
      },
      history: {
        title: 'Exam History',
        columns: {
          date: 'Date',
          subject: 'Subject',
          score: 'Score',
          answers: 'Answers',
          time: 'Time',
          status: 'Status'
        },
        status: {
          passed: 'Passed',
          failed: 'Failed'
        },
        footer: {
          totalExams: 'Total exams',
          passed: 'Passed',
          average: 'Average'
        }
      },
      export: {
        button: 'Export PDF',
        generating: 'Generating...'
      }
    },
    footer: {
      tipPrefix: 'Tip:',
      tipText: 'Use keyboard shortcuts to navigate faster',
      shortcuts: {
        nav: 'Navigate',
        answer: 'Answer',
        mark: 'Mark',
        flip: 'Flip',
        exit: 'Exit'
      }
    }
  }
};