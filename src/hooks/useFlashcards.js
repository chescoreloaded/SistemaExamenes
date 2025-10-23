import { useState, useEffect, useCallback, useRef } from 'react';
import { flashcardsService } from '@/services/flashcardsService';
import { subjectsService } from '@/services/subjectsService';
import { shuffleArray } from '@/utils/shuffle';
import { usePersistence } from './usePersistence';

export function useFlashcards(subjectId) {
  const [cards, setCards] = useState([]);
  const [originalCards, setOriginalCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subjectName, setSubjectName] = useState('');
  const [subjectIcon, setSubjectIcon] = useState('📚'); 
  const [markedCards, setMarkedCards] = useState(new Set());
  const [visitedCards, setVisitedCards] = useState(new Set([0]));
  const [studiedCards, setStudiedCards] = useState(new Set());
  
  // ✅ SessionId estable para poder recuperar
  const sessionId = useRef(`flashcard-${subjectId}`);
  const startTime = useRef(new Date());

  // ✅ NUEVO: Autosave para flashcards
  const { 
    save: forceSave, 
    saveStatus, 
    isSaving, 
    isSaved,
    recover 
  } = usePersistence({
    sessionId: sessionId.current,
    data: {
      subjectId,
      currentIndex,
      markedCards: Array.from(markedCards),
      visitedCards: Array.from(visitedCards),
      studiedCards: Array.from(studiedCards),
      isFlipped,
      startTime: startTime.current?.toISOString(),
      cardIds: cards.map(c => c.id)
    },
    saveInterval: 120000, // ✅ 2 minutos (120 segundos)
    enabled: true,
    type: 'flashcard'
  });

  /**
   * ✅ NUEVO: Recuperar progreso al cargar
   */
  useEffect(() => {
    const recoverProgress = async () => {
      const recovered = await recover();
      if (recovered && cards.length > 0) {
        console.log('🔄 Recuperando progreso de flashcards...', recovered);
        
        // Restaurar estado
        setCurrentIndex(recovered.currentIndex || 0);
        setMarkedCards(new Set(recovered.markedCards || []));
        setVisitedCards(new Set(recovered.visitedCards || [0]));
        setStudiedCards(new Set(recovered.studiedCards || []));
        setIsFlipped(recovered.isFlipped || false);
        
        if (recovered.startTime) {
          startTime.current = new Date(recovered.startTime);
        }
      }
    };

    if (sessionId.current && cards.length > 0) {
      recoverProgress();
    }
  }, [cards.length]); // Ejecutar después de cargar las cards

  useEffect(() => {
    const loadFlashcards = async () => {
      if (!subjectId) {
        setError('No se proporcionó ID de materia');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const subject = await subjectsService.getById(subjectId);
        setSubjectName(subject?.name || 'Materia');
        setSubjectIcon(subject?.icon || '📚');

        const fetchedCards = await flashcardsService.getBySubject(subjectId);
        
        console.log('🃏 Flashcards cargadas:', fetchedCards);
        
        if (!fetchedCards || fetchedCards.length === 0) {
          setError('No hay flashcards disponibles para esta materia');
          setCards([]);
          setOriginalCards([]);
        } else {
          setCards(fetchedCards);
          setOriginalCards(fetchedCards);
        }
      } catch (err) {
        console.error('Error cargando flashcards:', err);
        setError(err.message || 'Error al cargar las tarjetas');
        setCards([]);
        setOriginalCards([]);
      } finally {
        setLoading(false);
      }
    };

    loadFlashcards();
  }, [subjectId]);

  const flipCard = useCallback(() => {
    setIsFlipped(prev => {
      const newFlipped = !prev;
      // Marcar como estudiada solo al voltear por primera vez
      if (newFlipped && !studiedCards.has(currentIndex)) {
        setStudiedCards(prevStudied => new Set([...prevStudied, currentIndex]));
      }
      return newFlipped;
    });
  }, [currentIndex, studiedCards]);

  // ✅ FIX: Cambiar index y flip en el MISMO batch de estado
  const nextCard = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      const nextIndex = currentIndex + 1;
      // Usar función updater para asegurar sincronización
      setCurrentIndex(() => {
        setIsFlipped(false); // Se ejecuta en el mismo batch
        setVisitedCards(prev => new Set([...prev, nextIndex]));
        return nextIndex;
      });
    }
  }, [currentIndex, cards.length]);

  // ✅ FIX: Cambiar index y flip en el MISMO batch de estado
  const previousCard = useCallback(() => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(() => {
        setIsFlipped(false); // Se ejecuta en el mismo batch
        setVisitedCards(prev => new Set([...prev, prevIndex]));
        return prevIndex;
      });
    }
  }, [currentIndex]);

  // ✅ FIX: Cambiar index y flip en el MISMO batch de estado
  const goToCard = useCallback((index) => {
    if (index >= 0 && index < cards.length) {
      setCurrentIndex(() => {
        setIsFlipped(false); // Se ejecuta en el mismo batch
        setVisitedCards(prev => new Set([...prev, index]));
        return index;
      });
    }
  }, [cards.length]);

  const shuffle = useCallback(() => {
    const shuffled = shuffleArray([...cards]);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setVisitedCards(new Set([0]));
    setStudiedCards(new Set());
    // ✅ NO cambiar sessionId para mantener progreso
  }, [cards]);

  const reset = useCallback(() => {
    setCards([...originalCards]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setVisitedCards(new Set([0]));
    setStudiedCards(new Set());
    setMarkedCards(new Set());
    // ✅ NO cambiar sessionId para mantener progreso
  }, [originalCards]);

  const toggleMark = useCallback((cardId) => {
    setMarkedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  }, []);

  const markAsStudied = useCallback((cardId) => {
    console.log('Tarjeta estudiada:', cardId);
  }, []);

  return {
    cards,
    currentCard: cards[currentIndex] || null,
    currentIndex,
    totalCards: cards.length,
    isFlipped,
    loading,
    error,
    subjectName,
    subjectIcon,
    markedCards,
    visitedCards,
    studiedCards,
    // ✅ NUEVO: Estados de autosave
    saveStatus,
    isSaving,
    isSaved,
    forceSave,
    sessionId: sessionId.current, // ✅ NUEVO: Exponer sessionId
    // Acciones
    flipCard,
    nextCard,
    previousCard,
    goToCard,
    shuffle,
    reset,
    markAsStudied,
    toggleMark,
    hasNext: currentIndex < cards.length - 1,
    hasPrevious: currentIndex > 0,
    progress: cards.length > 0 ? (studiedCards.size / cards.length) * 100 : 0
  };
}

export default useFlashcards;
