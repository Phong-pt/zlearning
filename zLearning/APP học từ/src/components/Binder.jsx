import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid3X3, X, Trash2, Filter, Search, BookOpen } from 'lucide-react';
import VocabCard from './VocabCard';
import { useCards } from '../context/CardContext';
import { WORD_TYPE_COLORS, LANGUAGES } from '../services/dictionaryService';

function Binder() {
  const { cards, deleteCard, getWordTypeCounts } = useCards();
  const [selectedLanguage, setSelectedLanguage] = useState(null); // null = show language selector
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

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

  // Auto-select first language if not selected
  useMemo(() => {
    if (selectedLanguage === null && languagesWithCards.length > 0) {
      setSelectedLanguage(languagesWithCards[0]);
    }
  }, [languagesWithCards, selectedLanguage]);

  // Get word type counts for selected language
  const wordTypeCounts = useMemo(() => {
    const counts = {};
    const langCards = cardsByLanguage[selectedLanguage] || [];
    langCards.forEach(card => {
      const type = card.type || 'unknown';
      counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
  }, [cardsByLanguage, selectedLanguage]);

  // Filter cards based on selections
  const filteredCards = useMemo(() => {
    const langCards = cardsByLanguage[selectedLanguage] || [];
    return langCards.filter(card => {
      const matchesType = selectedType === 'all' || card.type === selectedType;
      const matchesSearch = searchQuery === '' || 
        card.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.meaning.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesType && matchesSearch;
    });
  }, [cardsByLanguage, selectedLanguage, selectedType, searchQuery]);

  const handleDeleteCard = (cardId) => {
    deleteCard(cardId);
    setShowDeleteConfirm(null);
    setSelectedCard(null);
  };

  const handleLanguageSelect = (langCode) => {
    setSelectedLanguage(langCode);
    setSelectedType('all');
    setSearchQuery('');
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
            <Grid3X3 className="w-8 h-8 text-gold/60" />
          </div>
          <h3 className="text-xl font-display font-bold text-parchment mb-2">
            Bộ sưu tập trống
          </h3>
          <p className="text-parchment/60">
            Hãy tạo một số thẻ bài để bắt đầu xây dựng bộ sưu tập!
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      {/* Language Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5 text-gold" />
          <h2 className="text-lg font-display font-semibold text-parchment">Chọn bộ sưu tập</h2>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {languagesWithCards.map((langCode) => {
            const lang = LANGUAGES[langCode] || { name: langCode, flag: '🌐' };
            const count = cardsByLanguage[langCode]?.length || 0;
            const isActive = selectedLanguage === langCode;
            
            return (
              <motion.button
                key={langCode}
                onClick={() => handleLanguageSelect(langCode)}
                className={`
                  relative px-5 py-4 rounded-2xl transition-all duration-300
                  flex flex-col items-center gap-2 min-w-[120px]
                  ${isActive 
                    ? 'bg-gradient-to-br from-gold/20 to-bronze/20 border-2 border-gold/50 shadow-lg shadow-gold/10' 
                    : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                  }
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-3xl">{lang.flag}</span>
                <span className={`font-medium ${isActive ? 'text-gold' : 'text-parchment/80'}`}>
                  {lang.name}
                </span>
                <span className={`
                  px-2 py-0.5 rounded-full text-xs font-bold
                  ${isActive ? 'bg-gold/30 text-gold' : 'bg-white/10 text-parchment/60'}
                `}>
                  {count} thẻ
                </span>
                
                {isActive && (
                  <motion.div
                    layoutId="languageIndicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-gold to-bronze rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Collection Header */}
      {selectedLanguage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel mb-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold to-bronze flex items-center justify-center text-2xl">
                {LANGUAGES[selectedLanguage]?.flag || '🌐'}
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-parchment">
                  Bộ sưu tập {LANGUAGES[selectedLanguage]?.name || selectedLanguage}
                </h2>
                <p className="text-parchment/60 text-sm">
                  {cardsByLanguage[selectedLanguage]?.length || 0} thẻ bài
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm từ vựng..."
                className="input-field pl-10"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-parchment/40" />
            </div>
          </div>

          {/* Type Filters */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Filter className="w-4 h-4 text-parchment/60" />
            <button
              onClick={() => setSelectedType('all')}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                ${selectedType === 'all'
                  ? 'bg-gold/20 text-gold border border-gold/50'
                  : 'bg-white/5 text-parchment/60 hover:bg-white/10'
                }
              `}
            >
              Tất cả ({cardsByLanguage[selectedLanguage]?.length || 0})
            </button>
            {Object.entries(WORD_TYPE_COLORS).map(([type, info]) => {
              const count = wordTypeCounts[type] || 0;
              if (count === 0) return null;
              
              return (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5
                    ${selectedType === type
                      ? 'border'
                      : 'bg-white/5 text-parchment/60 hover:bg-white/10'
                    }
                  `}
                  style={selectedType === type ? {
                    backgroundColor: `${info.bg}20`,
                    color: info.text,
                    borderColor: `${info.bg}50`,
                  } : {}}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: info.bg }}
                  />
                  {info.label} ({count})
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Cards Grid */}
      {selectedLanguage && (
        filteredCards.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-parchment/60">Không tìm thấy thẻ nào phù hợp</p>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {filteredCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <VocabCard
                  card={card}
                  size="small"
                  onClick={() => setSelectedCard(card)}
                />
              </motion.div>
            ))}
          </motion.div>
        )
      )}

      {/* Modal for selected card */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedCard(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative"
            >
              <VocabCard card={selectedCard} size="large" />
              
              {/* Action buttons */}
              <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex gap-4">
                <button
                  onClick={() => setSelectedCard(null)}
                  className="btn-secondary p-3"
                  title="Đóng"
                >
                  <X className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(selectedCard.id)}
                  className="p-3 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors"
                  title="Xóa thẻ"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-panel max-w-sm text-center"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-lg font-display font-bold text-parchment mb-2">
                Xóa thẻ bài?
              </h3>
              <p className="text-parchment/60 mb-6">
                Bạn có chắc muốn xóa thẻ này? Hành động này không thể hoàn tác.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="btn-secondary"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleDeleteCard(showDeleteConfirm)}
                  className="px-6 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
                >
                  Xóa
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Binder;
