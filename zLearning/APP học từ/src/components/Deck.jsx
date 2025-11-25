import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Shuffle, ChevronLeft, ChevronRight, RotateCcw, Layers, BookOpen } from 'lucide-react';
import VocabCard from './VocabCard';
import { useCards } from '../context/CardContext';
import { LANGUAGES } from '../services/dictionaryService';

function Deck() {
  const { cards, getShuffledCards } = useCards();
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [deckCards, setDeckCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  // Motion values for swipe
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  // Get cards grouped by language
  const cardsByLanguage = useMemo(() => {
    const grouped = {};
    cards.forEach(card => {
      const lang = card.language || 'en';
      if (!grouped[lang]) {
        grouped[lang] = [];
      }
      grouped[lang].push(card);
    });
    return grouped;
  }, [cards]);

  // Get languages that have cards
  const languagesWithCards = useMemo(() => {
    return Object.keys(cardsByLanguage).sort();
  }, [cardsByLanguage]);

  // Auto-select first language
  useEffect(() => {
    if (selectedLanguage === null && languagesWithCards.length > 0) {
      setSelectedLanguage(languagesWithCards[0]);
    }
  }, [languagesWithCards, selectedLanguage]);

  // Initialize deck with cards from selected language
  useEffect(() => {
    if (selectedLanguage && cardsByLanguage[selectedLanguage]) {
      setDeckCards([...cardsByLanguage[selectedLanguage]]);
      setCurrentIndex(0);
    }
  }, [selectedLanguage, cardsByLanguage]);

  const handleLanguageSelect = (langCode) => {
    setSelectedLanguage(langCode);
    setCurrentIndex(0);
    setDirection(0);
  };

  const handleShuffle = () => {
    const shuffled = getShuffledCards(deckCards);
    setDeckCards(shuffled);
    setCurrentIndex(0);
  };

  const handleNext = useCallback(() => {
    if (currentIndex < deckCards.length - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, deckCards.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const handleReset = () => {
    setCurrentIndex(0);
    setDirection(0);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'd') {
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  // Handle drag end
  const handleDragEnd = (event, info) => {
    setIsDragging(false);
    const threshold = 100;
    
    if (info.offset.x > threshold) {
      handlePrev();
    } else if (info.offset.x < -threshold) {
      handleNext();
    }
  };

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel text-center max-w-md"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gold/20 to-bronze/20 flex items-center justify-center">
            <Layers className="w-8 h-8 text-gold/60" />
          </div>
          <h3 className="text-xl font-display font-bold text-parchment mb-2">
            Bộ bài trống
          </h3>
          <p className="text-parchment/60">
            Hãy thêm một số thẻ bài vào bộ sưu tập để bắt đầu học!
          </p>
        </motion.div>
      </div>
    );
  }

  const currentCard = deckCards[currentIndex];
  const progress = deckCards.length > 0 ? ((currentIndex + 1) / deckCards.length) * 100 : 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      {/* Language Selector */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 mb-3 justify-center">
          <BookOpen className="w-4 h-4 text-gold" />
          <span className="text-sm text-parchment/60">Chọn ngôn ngữ để học</span>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {languagesWithCards.map((langCode) => {
            const lang = LANGUAGES[langCode] || { name: langCode, flag: '🌐' };
            const count = cardsByLanguage[langCode]?.length || 0;
            const isActive = selectedLanguage === langCode;
            
            return (
              <button
                key={langCode}
                onClick={() => handleLanguageSelect(langCode)}
                className={`
                  px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2
                  ${isActive 
                    ? 'bg-gold/20 text-gold border border-gold/50' 
                    : 'bg-white/5 text-parchment/70 border border-white/10 hover:bg-white/10'
                  }
                `}
              >
                <span>{lang.flag}</span>
                <span className="font-medium">{lang.name}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${isActive ? 'bg-gold/30' : 'bg-white/10'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Progress bar */}
      {deckCards.length > 0 && (
        <div className="w-full max-w-sm mb-6">
          <div className="flex justify-between text-sm text-parchment/60 mb-2">
            <span>Thẻ {currentIndex + 1} / {deckCards.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-gold to-bronze rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Card stack */}
      {deckCards.length > 0 ? (
        <>
          <div className="relative w-full max-w-md h-[32rem] flex items-center justify-center">
            {/* Background cards for stack effect */}
            {deckCards.length > 1 && (
              <>
                <div 
                  className="absolute w-72 h-96 rounded-2xl bg-white/5 border border-white/10"
                  style={{ transform: 'translateY(16px) scale(0.95)', zIndex: 0 }}
                />
                {deckCards.length > 2 && (
                  <div 
                    className="absolute w-72 h-96 rounded-2xl bg-white/5 border border-white/10"
                    style={{ transform: 'translateY(32px) scale(0.9)', zIndex: -1 }}
                  />
                )}
              </>
            )}

            {/* Current card with swipe */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentCard?.id || currentIndex}
                className="absolute swipe-area"
                initial={{ 
                  x: direction === 1 ? 300 : direction === -1 ? -300 : 0,
                  opacity: 0,
                  scale: 0.8,
                }}
                animate={{ 
                  x: 0,
                  opacity: 1,
                  scale: 1,
                }}
                exit={{ 
                  x: direction === 1 ? -300 : 300,
                  opacity: 0,
                  scale: 0.8,
                }}
                transition={{ 
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.7}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={handleDragEnd}
                style={{ x, rotate, opacity }}
                whileTap={{ cursor: 'grabbing' }}
              >
                <VocabCard card={currentCard} size="large" />
              </motion.div>
            </AnimatePresence>

            {/* Swipe indicators */}
            {isDragging && (
              <>
                <motion.div
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400/80 font-display text-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: x.get() > 50 ? 1 : 0 }}
                >
                  ← Trước
                </motion.div>
                <motion.div
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400/80 font-display text-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: x.get() < -50 ? 1 : 0 }}
                >
                  Sau →
                </motion.div>
              </>
            )}
          </div>

          {/* Navigation controls */}
          <div className="flex items-center gap-4 mt-8">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="btn-secondary p-3 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Thẻ trước (←)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={handleShuffle}
              className="btn-primary flex items-center gap-2"
              title="Xáo bài"
            >
              <Shuffle className="w-5 h-5" />
              <span>Xáo bài</span>
            </button>

            <button
              onClick={handleReset}
              className="btn-secondary p-3"
              title="Quay lại đầu"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={handleNext}
              disabled={currentIndex === deckCards.length - 1}
              className="btn-secondary p-3 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Thẻ sau (→)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Keyboard hint */}
          <p className="text-parchment/40 text-sm mt-4">
            Sử dụng ← → hoặc vuốt để điều hướng
          </p>
        </>
      ) : (
        <div className="glass-panel text-center">
          <p className="text-parchment/60">Chọn một ngôn ngữ để bắt đầu học</p>
        </div>
      )}
    </div>
  );
}

export default Deck;
