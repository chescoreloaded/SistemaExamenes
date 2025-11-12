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
      start: 'Explorar',
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
      hours: 'h',
      categories: 'categorías',
      minutes: 'min',
      passingScore: 'para aprobar',
      progress: 'Progreso',
      difficulty: {
        basic: 'Básico',       // ✅ Claves normalizadas a minúsculas
        intermediate: 'Intermedio',
        advanced: 'Avanzado',
        // Fallbacks por compatibilidad
        basico: 'Básico',
        intermedio: 'Intermedio',
        avanzado: 'Avanzado'
      },
      filters: {
        academicLevel: 'Nivel Académico',
        difficulty: 'Dificultad',
        allOptions: 'Todas las opciones',
        year: 'Año / Grado',
        period: 'Periodo'
      },
      pagination: {
        previous: 'Anterior',
        next: 'Siguiente',
        pageOf: 'Página {current} de {total}',
        showing: 'Mostrando {start}-{end} de {total} resultados'
      }
    },
    navigation: {
      home: 'Mis Cursos',
      explorer: 'Explorar',
      analytics: 'Progreso'
    },
    course: {
      chooseModeTitle: '¿Cómo quieres aprender hoy?',
      categoriesTitle: 'Contenido del Curso',
      additionalInfo: 'Información Adicional',
      institution: 'Institución',
      instructor: 'Instructor',
      curriculum: 'Plan de Estudios',
      stats: {
        bestScore: 'Mejor Nota',
        attempts: 'Intentos',
        avgScore: 'Promedio',
        totalXp: 'XP Ganado'
      }
    },
    home: {
      welcomeTitle: 'Bienvenido a InovaCode',
      welcomeSubtitle: 'Tu plataforma de aprendizaje gamificado. Selecciona un curso o explora el catálogo completo.',
      noSubjects: 'No hay materias disponibles',
      noSubjectsSub: 'Agrega materias para comenzar a crear exámenes',
      exploreMore: 'Explorar Catálogo Completo',
      modes: {
        exam: {
          title: 'Modo Examen',
          desc: 'Evaluación formal con tiempo límite y calificación final.',
          features: '⏱️ Cronómetro • 📊 Resultados'
        },
        practice: {
          title: 'Modo Práctica',
          desc: 'Aprende a tu ritmo con retroalimentación inmediata.',
          features: '✅ Feedback • 💡 Sin presión'
        },
        study: {
          title: 'Modo Estudio',
          desc: 'Memoriza conceptos clave usando tarjetas interactivas.',
          features: '🔄 Flip activo • 🧠 Optimizado'
        }
      },
      actions: {
        examBtn: 'Iniciar Examen',
        practiceBtn: 'Practicar Ahora',
        studyBtn: 'Estudiar Tarjetas'
      },
      stats: {
        baseXp: 'XP',
        hours: 'H',
        stars: 'Estrellas'
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
      tryChangingFilters: 'Intenta ajustar tus filtros o términos de búsqueda',
      clearFilters: 'Limpiar Filtros'
    },
    exam: {
      modes: {
        exam: 'Modo Examen',
        practice: 'Modo Práctica'
      },
      ui: {
        navigator: 'Navegador',
        hide: 'Ocultar',
        tipMobile: 'Tip: Desliza ← → para navegar',
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
        streak: 'Racha',
        totalXp: 'XP Total',
        days: 'días',
        correctCount: 'correctas'
      },
      modals: {
        finish: {
          title: '⚠️ Confirmar Envío',
          prefix: 'Tienes',
          suffix: 'pregunta(s) sin responder.',
          confirm: '¿Seguro que quieres terminar?',
          btn: 'Sí, Terminar'
        },
        exit: {
          title: '⚠️ Salir del Examen',
          examWarning: 'Tu progreso se guardará, pero no podrás reanudar este examen.',
          practiceWarning: 'Perderás el progreso de esta sesión.',
          confirm: '¿Seguro que quieres salir?',
          btn: 'Sí, Salir'
        }
      },
      shortcuts: {
        title: 'Atajos',
        nav: 'Navegar',
        select: 'Seleccionar',
        mark: 'Marcar',
        next: 'Siguiente'
      },
      feedback: {
        correct: {
          title: '¡Correcto!',
          subtitle: '¡Sigue así! 💪'
        },
        incorrect: {
          title: 'Incorrecto',
          subtitle: '¡De los errores se aprende! 🧠'
        },
        labels: {
          question: 'PREGUNTA',
          yourAnswer: 'Tu respuesta:',
          correctAnswer: 'Respuesta correcta:'
        },
        actions: {
          seeExplanation: 'Ver explicación',
          hideExplanation: 'Ocultar',
          continue: 'Continuar'
        }
      }
    },
    study: {
      title: 'Modo Estudio',
      ui: {
        navigatorTitle: 'Navegación',
        shuffle: 'Mezclar',
        reset: 'Reiniciar',
        mark: 'Marcar',
        flip: 'Girar',
        progress: 'estudiadas',
        tip: 'Espacio/Enter para girar, ← → navegar'
      },
      modals: {
        exit: {
          title: '⚠️ Salir',
          text: '¿Seguro que quieres salir?',
          confirm: 'Sí, salir',
          cancel: 'Cancelar'
        }
      }
    },
    results: {
      breadcrumb: 'Resultados',
      success: '¡Aprobado!',
      fail: 'Sigue practicando',
      scoreLabel: 'Calificación Final',
      stats: {
        correct: 'Correctas',
        incorrect: 'Incorrectas',
        time: 'Tiempo'
      },
      actions: {
        review: 'Revisión detallada',
        home: 'Ir al Inicio',
        retry: 'Intentar de nuevo'
      }
    },
    review: {
      title: 'Revisión',
      score: 'Calificación',
      filters: {
        all: 'Todas',
        correct: 'Correctas',
        incorrect: 'Incorrectas',
        unanswered: 'Sin responder'
      },
      question: {
        title: 'Pregunta',
        explanation: 'Explicación',
        yourAnswer: 'Tu respuesta',
        correctAnswer: 'Respuesta correcta'
      }
    },
    gamification: {
      streak: {
        dailyTitle: 'Racha Diaria',
        currentTitle: 'Racha Actual',
        best: 'Mejor',
        days: 'días',
        messages: {
          daily: {
            keepGoing: '¡Sigue así!',
            great: '¡Gran racha!',
            legendary: '¡LEGENDARIO!'
          }
        }
      },
      level: {
        level: 'Nivel',
        nextLevel: 'Siguiente Nivel',
        progress: 'Progreso',
        remaining: 'Faltan'
      }
    },
    analytics: {
      title: 'Panel de Rendimiento',
      subtitle: 'Tus estadísticas de aprendizaje',
      noData: {
        title: '¡Comienza a aprender!',
        subtitle: 'Completa exámenes para ver tus estadísticas',
        titleFiltered: 'Sin datos',
        subtitleFiltered: 'Ajusta los filtros'
      },
      stats: {
        totalExams: 'Total Exámenes',
        averageScore: 'Promedio'
      },
      charts: {
        performance: { title: 'Rendimiento', scoreLegend: 'Puntuación (%)' },
        subject: { title: 'Por Materia' },
        distribution: { title: 'Distribución', correct: 'Correctas', incorrect: 'Incorrectas' }
      },
      filters: {
        clear: 'Limpiar',
        allTime: 'Todo el tiempo',
        lastWeek: '7 días',
        lastMonth: '30 días'
      },
      history: {
        title: 'Historial',
        columns: { date: 'Fecha', subject: 'Materia', score: 'Nota', status: 'Estado' },
        status: { passed: 'Aprobado', failed: 'Reprobado' }
      },
      export: {
        button: 'Exportar PDF',
        generating: 'Generando...'
      }
    },
    footer: {
      tipPrefix: 'Tip:',
      tipText: 'Usa atajos de teclado',
      shortcuts: { nav: 'Navegar', answer: 'Responder', exit: 'Salir' }
    }
  },
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
      start: 'Explore',
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
      hours: 'h',
      categories: 'categories',
      minutes: 'min',
      passingScore: 'to pass',
      progress: 'Progress',
      difficulty: {
        basic: 'Basic',        // ✅ Normalized keys
        intermediate: 'Intermediate',
        advanced: 'Advanced'
      },
      filters: {
        academicLevel: 'Academic Level',
        difficulty: 'Difficulty',
        allOptions: 'All options',
        year: 'Year / Grade',
        period: 'Period'
      },
      pagination: {
        previous: 'Previous',
        next: 'Next',
        pageOf: 'Page {current} of {total}',
        showing: 'Showing {start}-{end} of {total} results'
      }
    },
    navigation: {
      home: 'My Courses',
      explorer: 'Explore',
      analytics: 'Progress'
    },
    course: {
      chooseModeTitle: 'How do you want to learn today?',
      categoriesTitle: 'Course Content',
      additionalInfo: 'Additional Information',
      institution: 'Institution',
      instructor: 'Instructor',
      curriculum: 'Curriculum',
      stats: {
        bestScore: 'Best Score',
        attempts: 'Attempts',
        avgScore: 'Average',
        totalXp: 'XP Earned'
      }
    },
    home: {
      welcomeTitle: 'Welcome to InovaCode',
      welcomeSubtitle: 'Your gamified learning platform. Select a course or explore the full catalog.',
      noSubjects: 'No subjects available',
      noSubjectsSub: 'Add subjects to start creating exams',
      exploreMore: 'Explore Full Catalog',
      modes: {
        exam: {
          title: 'Exam Mode',
          desc: 'Formal assessment with time limit and final grading.',
          features: '⏱️ Timer • 📊 Results'
        },
        practice: {
          title: 'Practice Mode',
          desc: 'Learn at your own pace with immediate feedback.',
          features: '✅ Feedback • 💡 No pressure'
        },
        study: {
          title: 'Study Mode',
          desc: 'Memorize key concepts using interactive flashcards.',
          features: '🔄 Active recall • 🧠 Optimized'
        }
      },
      actions: {
        examBtn: 'Start Exam',
        practiceBtn: 'Practice Now',
        studyBtn: 'Study Flashcards'
      },
      stats: {
        baseXp: 'XP',
        hours: 'H',
        stars: 'Stars'
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
      tryChangingFilters: 'Try adjusting filters or search terms',
      clearFilters: 'Clear Filters'
    },
    exam: {
      modes: {
        exam: 'Exam Mode',
        practice: 'Practice Mode'
      },
      ui: {
        navigator: 'Navigator',
        hide: 'Hide',
        tipMobile: 'Tip: Swipe ← → to navigate',
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
          confirm: 'Are you sure you want to submit?',
          btn: 'Yes, Submit'
        },
        exit: {
          title: '⚠️ Exit Exam',
          examWarning: 'Your progress will be saved, but you cannot resume.',
          practiceWarning: 'Progress for this session will be lost.',
          confirm: 'Are you sure you want to exit?',
          btn: 'Yes, Exit'
        }
      },
      shortcuts: {
        title: 'Shortcuts',
        nav: 'Navigate',
        select: 'Select',
        mark: 'Mark',
        next: 'Next'
      },
      feedback: {
        correct: {
          title: 'Correct!',
          subtitle: 'Keep it up! 💪'
        },
        incorrect: {
          title: 'Incorrect',
          subtitle: 'We learn from mistakes! 🧠'
        },
        labels: {
          question: 'QUESTION',
          yourAnswer: 'Your answer:',
          correctAnswer: 'Correct answer:'
        },
        actions: {
          seeExplanation: 'See explanation',
          hideExplanation: 'Hide',
          continue: 'Continue'
        }
      }
    },
    study: {
      title: 'Study Mode',
      ui: {
        navigatorTitle: 'Navigator',
        shuffle: 'Shuffle',
        reset: 'Reset',
        mark: 'Mark',
        flip: 'Flip',
        progress: 'studied',
        tip: 'Space/Enter to flip, ← → navigate'
      },
      modals: {
        exit: {
          title: '⚠️ Exit',
          text: 'Are you sure you want to exit?',
          confirm: 'Yes, exit',
          cancel: 'Cancel'
        }
      }
    },
    results: {
      breadcrumb: 'Results',
      success: 'Passed!',
      fail: 'Keep practicing',
      scoreLabel: 'Final Score',
      stats: {
        correct: 'Correct',
        incorrect: 'Incorrect',
        time: 'Time'
      },
      actions: {
        review: 'Detailed Review',
        home: 'Go Home',
        retry: 'Try Again'
      }
    },
    review: {
      title: 'Review',
      score: 'Score',
      filters: {
        all: 'All',
        correct: 'Correct',
        incorrect: 'Incorrect',
        unanswered: 'Unanswered'
      },
      question: {
        title: 'Question',
        explanation: 'Explanation',
        yourAnswer: 'Your answer',
        correctAnswer: 'Correct answer'
      }
    },
    gamification: {
      streak: {
        dailyTitle: 'Daily Streak',
        currentTitle: 'Current Streak',
        best: 'Best',
        days: 'days',
        messages: {
          daily: {
            keepGoing: 'Keep it up!',
            great: 'Great streak!',
            legendary: 'LEGENDARY!'
          }
        }
      },
      level: {
        level: 'Level',
        nextLevel: 'Next Level',
        progress: 'Progress',
        remaining: 'Remaining'
      }
    },
    analytics: {
      title: 'Performance Dashboard',
      subtitle: 'Your learning statistics',
      noData: {
        title: 'Start learning!',
        subtitle: 'Complete exams to see your stats',
        titleFiltered: 'No data',
        subtitleFiltered: 'Adjust filters'
      },
      stats: {
        totalExams: 'Total Exams',
        averageScore: 'Average'
      },
      charts: {
        performance: { title: 'Performance', scoreLegend: 'Score (%)' },
        subject: { title: 'By Subject' },
        distribution: { title: 'Distribution', correct: 'Correct', incorrect: 'Incorrect' }
      },
      filters: {
        clear: 'Clear',
        allTime: 'All time',
        lastWeek: 'Last 7 days',
        lastMonth: 'Last 30 days'
      },
      history: {
        title: 'History',
        columns: { date: 'Date', subject: 'Subject', score: 'Score', status: 'Status' },
        status: { passed: 'Passed', failed: 'Failed' }
      },
      export: {
        button: 'Export PDF',
        generating: 'Generating...'
      }
    },
    footer: {
      tipPrefix: 'Tip:',
      tipText: 'Use keyboard shortcuts',
      shortcuts: { nav: 'Navigate', answer: 'Answer', exit: 'Exit' }
    }
  }
};