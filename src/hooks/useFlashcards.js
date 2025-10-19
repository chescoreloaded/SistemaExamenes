// src/hooks/useFlashcards.js
import { useState, useEffect, useCallback } from 'react';
import { flashcardsService } from '@/services/flashcardsService';
import { subjectsService } from '@/services/subjectsService';
import { shuffleArray } from '@/utils/shuffle';

export function useFlashcards(subjectId) {
  const [cards, setCards] = useState([]);
  const [originalCards, setOriginalCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subjectName, setSubjectName] = useState('');

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

        const fetchedCards = await flashcardsService.getBySubject(subjectId);
        
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
    setIsFlipped(prev => !prev);
  }, []);

  const nextCard = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, cards.length]);

  const previousCard = useCallback(() => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const goToCard = useCallback((index) => {
    if (index >= 0 && index < cards.length) {
      setCurrentIndex(index);
      setIsFlipped(false);
    }
  }, [cards.length]);

  const shuffle = useCallback(() => {
    const shuffled = shuffleArray([...cards]);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [cards]);

  const reset = useCallback(() => {
    setCards([...originalCards]);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [originalCards]);

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
    flipCard,
    nextCard,
    previousCard,
    goToCard,
    shuffle,
    reset,
    markAsStudied,
    hasNext: currentIndex < cards.length - 1,
    hasPrevious: currentIndex > 0,
    progress: cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0
  };
}

export default useFlashcards;