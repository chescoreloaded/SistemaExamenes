import { useState, useEffect, useCallback, useRef } from 'react';
import { getSubject, getFlashcards } from '../services/subjectsService';
import { usePersistence } from './usePersistence';
import { shuffleArray } from '../utils/shuffle';

// ✅ Acepta 'language' como parámetro
export function useFlashcards(subjectId, language = 'es') {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subjectName, setSubjectName] = useState('');
  const [subjectIcon, setSubjectIcon] = useState('📚');

  // Sets para seguimiento de progreso
  const [markedCards, setMarkedCards] = useState(new Set());
  const [studiedCards, setStudiedCards] = useState(new Set());

  const sessionId = useRef(`study-${subjectId}`);

  // Persistencia
  const { save, saveStatus, isSaving, isSaved, recover } = usePersistence({
    sessionId: sessionId.current,
    data: {
      subjectId,
      currentIndex,
      markedCards: Array.from(markedCards),
      studiedCards: Array.from(studiedCards)
    },
    saveInterval: 30000, // 30 segundos
    type: 'study'
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadFlashcards();
  }, [subjectId, language]); // ✅ Recargar si cambia el idioma

  const loadFlashcards = async () => {
    try {
      setLoading(true);
      // ✅ Pasar idioma al servicio
      const [subjectData, cardsData] = await Promise.all([
        getSubject(subjectId, language),
        getFlashcards(subjectId, language)
      ]);

      if (!subjectData) throw new Error('Materia no encontrada');
      setSubjectName(subjectData.name);
      setSubjectIcon(subjectData.icon);
      setCards(cardsData || []);

      // Recuperar progreso
      const recovered = await recover();
      if (recovered) {
        setCurrentIndex(recovered.currentIndex || 0);
        setMarkedCards(new Set(recovered.markedCards || []));
        setStudiedCards(new Set(recovered.studiedCards || []));
      }

    } catch (err) {
      console.error('Error loading flashcards:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ... (resto de funciones: nextCard, prevCard, flipCard, etc. SE MANTIENEN IGUAL)
  const nextCard = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
    }
  }, [currentIndex, cards.length]);

  const previousCard = useCallback(() => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev - 1), 150);
    }
  }, [currentIndex]);

  const goToCard = useCallback((index) => {
    if (index >= 0 && index < cards.length) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(index), 150);
    }
  }, [cards.length]);

  const flipCard = useCallback(() => {
    setIsFlipped(prev => !prev);
    if (!isFlipped && cards[currentIndex]) {
      setStudiedCards(prev => new Set(prev).add(cards[currentIndex].id));
    }
  }, [isFlipped, cards, currentIndex]);

  const toggleMark = useCallback((cardId) => {
    setMarkedCards(prev => {
      const newSet = new Set(prev);
      newSet.has(cardId) ? newSet.delete(cardId) : newSet.add(cardId);
      return newSet;
    });
  }, []);

  const shuffle = useCallback(() => {
    setCards(prev => shuffleArray([...prev]));
    setCurrentIndex(0);
    setIsFlipped(false);
  }, []);

  const reset = useCallback(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setStudiedCards(new Set());
    setMarkedCards(new Set());
  }, []);

  return {
    cards,
    currentCard: cards[currentIndex],
    isFlipped,
    currentIndex,
    totalCards: cards.length,
    loading,
    error,
    subjectName,
    subjectIcon,
    markedCards,
    studiedCards,
    saveStatus,
    isSaving,
    isSaved,
    sessionId: sessionId.current,
    nextCard,
    previousCard,
    goToCard,
    flipCard,
    toggleMark,
    shuffle,
    reset
  };
}