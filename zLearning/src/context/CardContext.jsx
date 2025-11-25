import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { saveCards, loadCards } from '../services/storageService';

const CardContext = createContext();

export function CardProvider({ children }) {
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Load cards on mount
  useEffect(() => {
    async function init() {
      try {
        const savedCards = await loadCards();
        setCards(savedCards || []);
        console.log(`Loaded ${savedCards?.length || 0} cards`);
      } catch (error) {
        console.error('Error loading cards:', error);
        setCards([]);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  // Save cards whenever they change
  const persistCards = useCallback(async (cardsToSave) => {
    setIsSaving(true);
    try {
      await saveCards(cardsToSave);
      setLastSaved(new Date());
      console.log(`Saved ${cardsToSave.length} cards`);
    } catch (error) {
      console.error('Error saving cards:', error);
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Auto-save when cards change
  useEffect(() => {
    if (!isLoading && cards.length >= 0) {
      // Debounce save to avoid too many writes
      const timeoutId = setTimeout(() => {
        persistCards(cards);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [cards, isLoading, persistCards]);

  // Add a new card
  const addCard = (cardData) => {
    const newCard = {
      ...cardData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      reviewCount: 0,
      correctCount: 0,
    };
    setCards(prev => [newCard, ...prev]);
    return newCard;
  };

  // Update an existing card
  const updateCard = (cardId, updates) => {
    setCards(prev =>
      prev.map(card =>
        card.id === cardId ? { ...card, ...updates } : card
      )
    );
  };

  // Delete a card
  const deleteCard = (cardId) => {
    setCards(prev => prev.filter(card => card.id !== cardId));
  };

  // Record a review result
  const recordReview = (cardId, isCorrect) => {
    setCards(prev =>
      prev.map(card =>
        card.id === cardId
          ? {
              ...card,
              reviewCount: card.reviewCount + 1,
              correctCount: card.correctCount + (isCorrect ? 1 : 0),
              lastReviewedAt: new Date().toISOString(),
            }
          : card
      )
    );
  };

  // Get cards filtered by type
  const getCardsByType = (type) => {
    if (!type || type === 'all') return cards;
    return cards.filter(card => card.type === type);
  };

  // Get cards filtered by language
  const getCardsByLanguage = (language) => {
    if (!language || language === 'all') return cards;
    return cards.filter(card => card.language === language);
  };

  // Shuffle cards (returns shuffled copy)
  const getShuffledCards = (cardList = cards) => {
    const shuffled = [...cardList];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Get random cards for quiz
  const getQuizCards = (count = 10) => {
    const shuffled = getShuffledCards();
    return shuffled.slice(0, Math.min(count, shuffled.length));
  };

  // Get word types with counts
  const getWordTypeCounts = () => {
    const counts = {};
    cards.forEach(card => {
      const type = card.type || 'unknown';
      counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
  };

  // Check if a word already exists
  const wordExists = (word, language) => {
    return cards.some(
      card =>
        card.word.toLowerCase() === word.toLowerCase() &&
        card.language === language
    );
  };

  // Export cards as JSON
  const exportCards = () => {
    return JSON.stringify(cards, null, 2);
  };

  // Import cards from JSON
  const importCards = (jsonString) => {
    try {
      const importedCards = JSON.parse(jsonString);
      if (Array.isArray(importedCards)) {
        setCards(prev => [...importedCards, ...prev]);
        return { success: true, count: importedCards.length };
      }
      return { success: false, error: 'Invalid format' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Force save now
  const forceSave = async () => {
    await persistCards(cards);
  };

  const value = {
    cards,
    isLoading,
    isSaving,
    lastSaved,
    addCard,
    updateCard,
    deleteCard,
    recordReview,
    getCardsByType,
    getCardsByLanguage,
    getShuffledCards,
    getQuizCards,
    getWordTypeCounts,
    wordExists,
    exportCards,
    importCards,
    forceSave,
  };

  return (
    <CardContext.Provider value={value}>
      {children}
    </CardContext.Provider>
  );
}

export function useCards() {
  const context = useContext(CardContext);
  if (!context) {
    throw new Error('useCards must be used within a CardProvider');
  }
  return context;
}

export default CardContext;
