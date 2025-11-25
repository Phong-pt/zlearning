import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Check, X, SkipForward, RefreshCw, Trophy, Target, BookOpen } from 'lucide-react';
import VocabCard from './VocabCard';
import { useCards } from '../context/CardContext';
import { WORD_TYPE_COLORS, LANGUAGES } from '../services/dictionaryService';

// Chỉ hỏi từ vựng, nghĩa, và loại từ (không hỏi IPA vì khó nhập)
const HIDDEN_FIELDS = ['word', 'meaning', 'type'];
const FIELD_LABELS = {
  word: 'Từ vựng',
  meaning: 'Nghĩa',
  type: 'Loại từ',
};

function Quiz() {
  const { cards, getShuffledCards, recordReview } = useCards();
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [quizCards, setQuizCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hiddenField, setHiddenField] = useState('meaning');
  const [userAnswer, setUserAnswer] = useState('');
  const [isRevealed, setIsRevealed] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [quizComplete, setQuizComplete] = useState(false);
  const [showCorrectEffect, setShowCorrectEffect] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

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

  // Start new quiz for selected language
  const startNewQuiz = useCallback((langCode) => {
    const langCards = cardsByLanguage[langCode] || [];
    if (langCards.length === 0) return;

    const shuffled = getShuffledCards(langCards);
    const quizCount = Math.min(10, shuffled.length);
    
    setQuizCards(shuffled.slice(0, quizCount));
    setCurrentIndex(0);
    setHiddenField(HIDDEN_FIELDS[Math.floor(Math.random() * HIDDEN_FIELDS.length)]);
    setUserAnswer('');
    setIsRevealed(false);
    setIsCorrect(null);
    setScore({ correct: 0, total: 0 });
    setQuizComplete(false);
    setShowCorrectEffect(false);
    setQuizStarted(true);
  }, [cardsByLanguage, getShuffledCards]);

  const handleLanguageSelect = (langCode) => {
    setSelectedLanguage(langCode);
    startNewQuiz(langCode);
  };

  const normalizeAnswer = (str) => {
    return str.toLowerCase().trim().replace(/[.,!?;:'"]/g, '');
  };

  const checkAnswer = () => {
    if (!userAnswer.trim() || isRevealed) return;

    const currentCard = quizCards[currentIndex];
    const correctAnswer = currentCard[hiddenField];
    
    const normalizedUser = normalizeAnswer(userAnswer);
    const normalizedCorrect = normalizeAnswer(correctAnswer);
    
    let correct = false;
    
    if (hiddenField === 'meaning') {
      // For meaning, accept if user's answer contains key words
      const correctWords = normalizedCorrect.split(/[,\s]+/).filter(w => w.length > 2);
      const matchedWords = correctWords.filter(word => normalizedUser.includes(word));
      correct = matchedWords.length >= Math.min(2, correctWords.length);
    } else if (hiddenField === 'type') {
      // For word type, accept common variations
      const typeAliases = {
        'noun': ['noun', 'danh từ', 'danh tu', 'n'],
        'verb': ['verb', 'động từ', 'dong tu', 'v'],
        'adjective': ['adjective', 'adj', 'tính từ', 'tinh tu'],
        'adverb': ['adverb', 'adv', 'trạng từ', 'trang tu'],
        'preposition': ['preposition', 'prep', 'giới từ', 'gioi tu'],
        'conjunction': ['conjunction', 'conj', 'liên từ', 'lien tu'],
        'pronoun': ['pronoun', 'pron', 'đại từ', 'dai tu'],
        'interjection': ['interjection', 'interj', 'thán từ', 'than tu'],
      };
      const correctType = normalizedCorrect.toLowerCase();
      const aliases = typeAliases[correctType] || [correctType];
      correct = aliases.some(alias => normalizedUser.includes(alias));
    } else {
      // For word, require exact match (ignoring case)
      correct = normalizedUser === normalizedCorrect;
    }

    setIsCorrect(correct);
    setIsRevealed(true);
    setScore(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }));

    // Record the review
    recordReview(currentCard.id, correct);

    if (correct) {
      setShowCorrectEffect(true);
      setTimeout(() => setShowCorrectEffect(false), 600);
    }
  };

  const handleNext = () => {
    if (currentIndex < quizCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setHiddenField(HIDDEN_FIELDS[Math.floor(Math.random() * HIDDEN_FIELDS.length)]);
      setUserAnswer('');
      setIsRevealed(false);
      setIsCorrect(null);
      setShowCorrectEffect(false);
    } else {
      setQuizComplete(true);
    }
  };

  const handleSkip = () => {
    setIsRevealed(true);
    setIsCorrect(false);
    setScore(prev => ({ ...prev, total: prev.total + 1 }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (isRevealed) {
        handleNext();
      } else {
        checkAnswer();
      }
    }
  };

  const handleRestartQuiz = () => {
    if (selectedLanguage) {
      startNewQuiz(selectedLanguage);
    }
  };

  const handleBackToLanguageSelect = () => {
    setQuizStarted(false);
    setQuizComplete(false);
    setSelectedLanguage(null);
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
            <Brain className="w-8 h-8 text-gold/60" />
          </div>
          <h3 className="text-xl font-display font-bold text-parchment mb-2">
            Chưa có thẻ để kiểm tra
          </h3>
          <p className="text-parchment/60">
            Hãy thêm một số thẻ bài vào bộ sưu tập trước!
          </p>
        </motion.div>
      </div>
    );
  }

  // Language selection screen
  if (!quizStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel text-center max-w-lg"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gold to-bronze flex items-center justify-center">
            <Brain className="w-8 h-8 text-ink" />
          </div>
          <h3 className="text-2xl font-display font-bold text-parchment mb-2">
            Chọn ngôn ngữ để kiểm tra
          </h3>
          <p className="text-parchment/60 mb-6">
            Hệ thống sẽ ẩn ngẫu nhiên Từ vựng, Nghĩa hoặc Loại từ để bạn điền
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            {languagesWithCards.map((langCode) => {
              const lang = LANGUAGES[langCode] || { name: langCode, flag: '🌐' };
              const count = cardsByLanguage[langCode]?.length || 0;
              
              return (
                <motion.button
                  key={langCode}
                  onClick={() => handleLanguageSelect(langCode)}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-gold/30 transition-all flex flex-col items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-4xl">{lang.flag}</span>
                  <span className="font-medium text-parchment">{lang.name}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-gold/20 text-gold">
                    {count} thẻ
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>
    );
  }

  if (quizComplete) {
    const percentage = Math.round((score.correct / score.total) * 100);
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gold to-bronze flex items-center justify-center"
          >
            <Trophy className="w-10 h-10 text-ink" />
          </motion.div>
          
          <h2 className="text-2xl font-display font-bold text-parchment mb-2">
            Hoàn thành!
          </h2>

          <p className="text-parchment/60 mb-4">
            {LANGUAGES[selectedLanguage]?.flag} {LANGUAGES[selectedLanguage]?.name}
          </p>
          
          <div className="my-6">
            <p className="text-5xl font-display font-bold text-gold mb-2">
              {percentage}%
            </p>
            <p className="text-parchment/60">
              {score.correct} / {score.total} câu đúng
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={handleBackToLanguageSelect}
              className="btn-secondary"
            >
              Đổi ngôn ngữ
            </button>
            <button
              onClick={handleRestartQuiz}
              className="btn-primary flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Làm lại
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentCard = quizCards[currentIndex];
  const progress = ((currentIndex + 1) / quizCards.length) * 100;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      {/* Header with language and score */}
      <div className="w-full max-w-md mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{LANGUAGES[selectedLanguage]?.flag}</span>
            <span className="text-parchment/60 text-sm">{LANGUAGES[selectedLanguage]?.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-gold" />
            <span className="text-parchment/80">
              Điểm: <span className="text-gold font-bold">{score.correct}</span> / {score.total}
            </span>
          </div>
        </div>
        
        <div className="flex justify-between text-xs text-parchment/60 mb-1">
          <span>Câu {currentIndex + 1} / {quizCards.length}</span>
        </div>
        
        {/* Progress bar */}
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-gold to-bronze rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Quiz prompt */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel mb-6 text-center"
      >
        <p className="text-parchment/60 text-sm">Hãy điền</p>
        <p className="text-xl font-display font-bold text-gold">
          {FIELD_LABELS[hiddenField]}
        </p>
        {hiddenField === 'type' && (
          <p className="text-parchment/40 text-xs mt-1">
            (Noun, Verb, Adj, Adv... hoặc tiếng Việt)
          </p>
        )}
      </motion.div>

      {/* Card with hidden field */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentIndex}-${isRevealed}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <VocabCard
            card={currentCard}
            size="large"
            hiddenField={isRevealed ? null : hiddenField}
            showCorrect={showCorrectEffect}
          />
        </motion.div>
      </AnimatePresence>

      {/* Answer input */}
      <div className="w-full max-w-md mt-8 space-y-4">
        {!isRevealed ? (
          <>
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Nhập ${FIELD_LABELS[hiddenField].toLowerCase()}...`}
              className="input-field text-center text-lg"
              autoFocus
            />
            
            <div className="flex justify-center gap-4">
              <button
                onClick={handleSkip}
                className="btn-secondary flex items-center gap-2"
              >
                <SkipForward className="w-5 h-5" />
                Bỏ qua
              </button>
              <button
                onClick={checkAnswer}
                disabled={!userAnswer.trim()}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                <Check className="w-5 h-5" />
                Kiểm tra
              </button>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            {/* Result indicator */}
            <div className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-xl
              ${isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}
            `}>
              {isCorrect ? (
                <>
                  <Check className="w-5 h-5" />
                  <span className="font-semibold">Chính xác!</span>
                </>
              ) : (
                <>
                  <X className="w-5 h-5" />
                  <span className="font-semibold">Chưa đúng</span>
                </>
              )}
            </div>

            {/* Show correct answer if wrong */}
            {!isCorrect && (
              <div className="text-parchment/60">
                <p className="text-sm">Đáp án đúng:</p>
                <p className="text-lg font-semibold text-gold">
                  {hiddenField === 'type' 
                    ? WORD_TYPE_COLORS[currentCard.type]?.label || currentCard.type
                    : currentCard[hiddenField]
                  }
                </p>
              </div>
            )}

            {/* Next button */}
            <button
              onClick={handleNext}
              className="btn-primary flex items-center gap-2 mx-auto"
            >
              {currentIndex < quizCards.length - 1 ? (
                <>
                  Tiếp theo
                  <SkipForward className="w-5 h-5" />
                </>
              ) : (
                <>
                  Xem kết quả
                  <Trophy className="w-5 h-5" />
                </>
              )}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Quiz;
