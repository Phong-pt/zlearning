import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Loader2, Sparkles, Check, AlertCircle, Edit3, Settings, X, Zap } from 'lucide-react';
import VocabCard from './VocabCard';
import { smartLookup, LANGUAGES, WORD_TYPE_COLORS, setAISettings, getAISettings } from '../services/dictionaryService';
import { useCards } from '../context/CardContext';

function CardCreator() {
  const { addCard, wordExists } = useCards();
  const [inputWord, setInputWord] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [previewCard, setPreviewCard] = useState(null);
  const [allMeanings, setAllMeanings] = useState([]);
  const [selectedMeaningIndex, setSelectedMeaningIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCard, setEditedCard] = useState(null);
  const [message, setMessage] = useState(null);
  const [showAISettings, setShowAISettings] = useState(false);
  const [localAISettings, setLocalAISettings] = useState(getAISettings());

  // Load AI settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('zlearning_ai_settings');
    if (saved) {
      const settings = JSON.parse(saved);
      setLocalAISettings(settings);
      setAISettings(settings);
    }
  }, []);

  const saveAISettings = () => {
    setAISettings(localAISettings);
    localStorage.setItem('zlearning_ai_settings', JSON.stringify(localAISettings));
    setShowAISettings(false);
    setMessage({ type: 'success', text: 'Đã lưu cài đặt AI!' });
    setTimeout(() => setMessage(null), 2000);
  };

  const handleSearch = async () => {
    if (!inputWord.trim()) return;

    if (wordExists(inputWord.trim(), selectedLanguage)) {
      setMessage({ type: 'warning', text: 'Từ này đã có trong bộ sưu tập!' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setIsLoading(true);
    setPreviewCard(null);
    setAllMeanings([]);
    setSelectedMeaningIndex(0);
    setMessage(null);

    try {
      const result = await smartLookup(inputWord.trim(), selectedLanguage);
      console.log('API Result:', result); // Debug log
      
      if (result) {
        if (result.allMeanings && result.allMeanings.length > 0) {
          console.log('All Meanings:', result.allMeanings); // Debug log
          setAllMeanings(result.allMeanings);
          
          const firstMeaning = result.allMeanings[0];
          
          // Add word type suffix if multiple meanings
          const typeLabel = WORD_TYPE_COLORS[firstMeaning.type]?.label || firstMeaning.type;
          const displayWord = result.allMeanings.length > 1
            ? `${result.word} (${typeLabel.toLowerCase()})`
            : result.word;
          
          const cardData = {
            word: displayWord,
            ipa: result.ipa,
            type: firstMeaning.type,
            meaning: firstMeaning.meaningVi,
            meaningEn: firstMeaning.meaningEn,
            example: firstMeaning.example,
            language: result.language,
          };
          setPreviewCard(cardData);
          setEditedCard({ ...cardData });
          
          if (result.allMeanings.length > 1) {
            setMessage({ 
              type: 'success', 
              text: `Tìm thấy ${result.allMeanings.length} loại từ! Bạn có thể thêm từng loại hoặc thêm tất cả.` 
            });
          } else {
            setMessage({ type: 'success', text: 'Đã tra cứu từ điển thành công!' });
            setTimeout(() => setMessage(null), 2000);
          }
        } else {
          setPreviewCard(result);
          setEditedCard({ ...result });
          setMessage({ type: 'success', text: 'Đã tra cứu từ điển thành công!' });
          setTimeout(() => setMessage(null), 2000);
        }
      } else {
        const blankCard = {
          word: inputWord.trim(),
          type: 'unknown',
          ipa: '',
          meaning: '',
          example: '',
          language: selectedLanguage,
        };
        setPreviewCard(blankCard);
        setEditedCard(blankCard);
        setIsEditing(true);
        setMessage({ type: 'warning', text: 'Không tìm thấy trong từ điển. Hãy nhập thủ công!' });
      }
    } catch (error) {
      console.error('Search error:', error);
      setMessage({ type: 'error', text: 'Lỗi kết nối. Vui lòng thử lại!' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectMeaning = (index) => {
    console.log('Selecting meaning:', index, allMeanings[index]); // Debug log
    if (!allMeanings[index]) return;
    
    setSelectedMeaningIndex(index);
    const selectedMeaning = allMeanings[index];
    
    // Add word type suffix to word if multiple meanings exist
    const baseWord = previewCard.word.split(' (')[0]; // Remove any existing suffix
    const typeLabel = WORD_TYPE_COLORS[selectedMeaning.type]?.label || selectedMeaning.type;
    const displayWord = allMeanings.length > 1 
      ? `${baseWord} (${typeLabel.toLowerCase()})`
      : baseWord;
    
    const cardData = {
      word: displayWord,
      ipa: previewCard.ipa,
      type: selectedMeaning.type,
      meaning: selectedMeaning.meaningVi,
      meaningEn: selectedMeaning.meaningEn,
      example: selectedMeaning.example,
      language: previewCard.language,
    };
    
    setPreviewCard(cardData);
    setEditedCard({ ...cardData });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleAddCard = () => {
    if (!editedCard) return;

    addCard(editedCard);
    setMessage({ type: 'success', text: 'Đã thêm thẻ vào bộ sưu tập!' });
    
    setInputWord('');
    setPreviewCard(null);
    setEditedCard(null);
    setAllMeanings([]);
    setSelectedMeaningIndex(0);
    setIsEditing(false);
    
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAddAllCards = () => {
    if (!previewCard || !allMeanings || allMeanings.length === 0) return;

    let addedCount = 0;
    
    // Create a card for each word type
    allMeanings.forEach((meaning) => {
      const typeLabel = WORD_TYPE_COLORS[meaning.type]?.label || meaning.type;
      const cardData = {
        word: `${previewCard.word} (${typeLabel.toLowerCase()})`,
        ipa: previewCard.ipa,
        type: meaning.type,
        meaning: meaning.meaningVi,
        meaningEn: meaning.meaningEn,
        example: meaning.example,
        language: previewCard.language,
      };
      
      // Check if this specific card already exists
      if (!wordExists(cardData.word, cardData.language)) {
        addCard(cardData);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      setMessage({ 
        type: 'success', 
        text: `Đã thêm ${addedCount} thẻ vào bộ sưu tập!` 
      });
    } else {
      setMessage({ 
        type: 'warning', 
        text: 'Tất cả các thẻ này đã có trong bộ sưu tập!' 
      });
    }
    
    setInputWord('');
    setPreviewCard(null);
    setEditedCard(null);
    setAllMeanings([]);
    setSelectedMeaningIndex(0);
    setIsEditing(false);
    
    setTimeout(() => setMessage(null), 3000);
  };

  const handleEditField = (field, value) => {
    setEditedCard(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-bronze flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-ink" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-parchment">Chế tác thẻ bài</h2>
            <p className="text-parchment/60 text-sm">Tra cứu từ điển online và tạo thẻ bài mới</p>
          </div>
        </div>

        {/* API Info */}
        <div className="mb-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
          <p className="text-blue-300 text-sm flex-1">
            🌐 <strong>Nguồn:</strong> {selectedLanguage === 'en' 
              ? 'Free Dictionary + Auto Translate' 
              : selectedLanguage === 'ru' 
                ? 'Wiktionary + Auto Translate'
                : 'MyMemory Translation'
            }
            {localAISettings.enabled && (
              <span className="ml-2 text-emerald-400">
                <Zap className="w-3 h-3 inline" /> AI {localAISettings.provider === 'gemini' ? 'Gemini' : 'GPT'}
              </span>
            )}
          </p>
          <button
            onClick={() => setShowAISettings(true)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            title="Cài đặt AI"
          >
            <Settings className="w-4 h-4 text-parchment/60" />
          </button>
        </div>

        {/* AI Settings Modal */}
        <AnimatePresence>
          {showAISettings && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowAISettings(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass-panel w-full max-w-md"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-display font-bold text-parchment flex items-center gap-2">
                    <Zap className="w-5 h-5 text-emerald-400" />
                    Cài đặt AI Summarization
                  </h3>
                  <button
                    onClick={() => setShowAISettings(false)}
                    className="p-1 rounded-lg hover:bg-white/10"
                  >
                    <X className="w-5 h-5 text-parchment/60" />
                  </button>
                </div>

                <p className="text-parchment/60 text-sm mb-4">
                  Bật AI để tự động tóm tắt nghĩa tiếng Việt ngắn gọn, dễ hiểu hơn.
                  Bạn cần có API key từ Google AI (Gemini) hoặc OpenAI.
                </p>

                <div className="space-y-4">
                  {/* Enable AI */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localAISettings.enabled}
                      onChange={(e) => setLocalAISettings(prev => ({ ...prev, enabled: e.target.checked }))}
                      className="w-5 h-5 rounded border-2 border-parchment/30 bg-transparent checked:bg-emerald-500 checked:border-emerald-500"
                    />
                    <span className="text-parchment">Bật AI Summarization</span>
                  </label>

                  {/* Provider */}
                  <div>
                    <label className="block text-parchment/60 text-sm mb-2">AI Provider</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setLocalAISettings(prev => ({ ...prev, provider: 'gemini' }))}
                        className={`flex-1 px-4 py-2 rounded-xl transition-all ${
                          localAISettings.provider === 'gemini'
                            ? 'bg-blue-500/20 border-2 border-blue-500 text-blue-300'
                            : 'bg-white/5 border border-white/10 text-parchment/70'
                        }`}
                      >
                        🔷 Gemini (Free)
                      </button>
                      <button
                        onClick={() => setLocalAISettings(prev => ({ ...prev, provider: 'openai' }))}
                        className={`flex-1 px-4 py-2 rounded-xl transition-all ${
                          localAISettings.provider === 'openai'
                            ? 'bg-green-500/20 border-2 border-green-500 text-green-300'
                            : 'bg-white/5 border border-white/10 text-parchment/70'
                        }`}
                      >
                        🟢 OpenAI
                      </button>
                    </div>
                  </div>

                  {/* API Key */}
                  <div>
                    <label className="block text-parchment/60 text-sm mb-2">
                      API Key {localAISettings.provider === 'gemini' ? '(Google AI Studio)' : '(OpenAI)'}
                    </label>
                    <input
                      type="password"
                      value={localAISettings.apiKey}
                      onChange={(e) => setLocalAISettings(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder={localAISettings.provider === 'gemini' ? 'AIza...' : 'sk-...'}
                      className="input-field"
                    />
                    <p className="text-parchment/40 text-xs mt-1">
                      {localAISettings.provider === 'gemini' 
                        ? 'Lấy free API key tại: aistudio.google.com'
                        : 'Lấy API key tại: platform.openai.com'
                      }
                    </p>
                  </div>

                  <button
                    onClick={saveAISettings}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Lưu cài đặt
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Language selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(LANGUAGES).map(([code, lang]) => (
            <button
              key={code}
              onClick={() => setSelectedLanguage(code)}
              className={`
                px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                ${selectedLanguage === code
                  ? 'bg-gold/20 text-gold border border-gold/50'
                  : 'bg-white/5 text-parchment/70 border border-white/10 hover:bg-white/10'
                }
              `}
            >
              {lang.flag} {lang.name}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputWord}
              onChange={(e) => setInputWord(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập từ vựng (ví dụ: smart, bald, run...)"
              className="input-field pl-12"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-parchment/40" />
          </div>
          <button
            onClick={handleSearch}
            disabled={isLoading || !inputWord.trim()}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            <span className="hidden sm:inline">Tra cứu</span>
          </button>
        </div>

        {/* Message */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`
                mt-4 px-4 py-3 rounded-xl flex items-center gap-2
                ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : ''}
                ${message.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                ${message.type === 'error' ? 'bg-red-500/20 text-red-400' : ''}
              `}
            >
              {message.type === 'success' && <Check className="w-5 h-5" />}
              {message.type === 'warning' && <AlertCircle className="w-5 h-5" />}
              {message.type === 'error' && <AlertCircle className="w-5 h-5" />}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Preview Section - Card + Edit Panel side by side */}
      <AnimatePresence>
        {(previewCard || isLoading) && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="mt-8 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8"
          >
            {/* Card Preview */}
            <div className="flex flex-col items-center gap-4">
              <h3 className="text-parchment/60 text-sm uppercase tracking-wider">Xem trước thẻ bài</h3>
              {isLoading ? (
                <div className="w-72 h-96 rounded-2xl bg-white/5 flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-8 h-8 text-gold animate-spin" />
                  <div className="text-center px-4">
                    <p className="text-parchment/80 font-medium">Đang tra cứu từ điển...</p>
                    <p className="text-parchment/50 text-sm mt-1">
                      {selectedLanguage === 'en' 
                        ? 'Free Dictionary API + Dịch sang tiếng Việt'
                        : 'MyMemory Translation API'
                      }
                    </p>
                  </div>
                </div>
              ) : (
                <VocabCard card={isEditing ? editedCard : previewCard} size="normal" />
              )}
            </div>

            {/* Edit Panel */}
            {previewCard && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-panel w-full max-w-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-display font-semibold text-parchment">
                    Chỉnh sửa thẻ
                  </h3>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`
                      p-2 rounded-lg transition-colors
                      ${isEditing ? 'bg-gold/20 text-gold' : 'bg-white/5 text-parchment/60 hover:bg-white/10'}
                    `}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Word Type */}
                  <div>
                    <label className="block text-parchment/60 text-sm mb-2">Loại từ</label>
                    <select
                      value={editedCard?.type || 'unknown'}
                      onChange={(e) => handleEditField('type', e.target.value)}
                      className="input-field"
                      disabled={!isEditing}
                    >
                      {Object.entries(WORD_TYPE_COLORS).map(([type, info]) => (
                        <option key={type} value={type}>
                          {info.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* IPA */}
                  <div>
                    <label className="block text-parchment/60 text-sm mb-2">Phiên âm (IPA)</label>
                    <input
                      type="text"
                      value={editedCard?.ipa || ''}
                      onChange={(e) => handleEditField('ipa', e.target.value)}
                      className="input-field font-mono"
                      disabled={!isEditing}
                    />
                  </div>

                  {/* Meaning */}
                  <div>
                    <label className="block text-parchment/60 text-sm mb-2">Nghĩa (Tiếng Việt)</label>
                    <textarea
                      value={editedCard?.meaning || ''}
                      onChange={(e) => handleEditField('meaning', e.target.value)}
                      className="input-field resize-none h-24"
                      disabled={!isEditing}
                    />
                  </div>

                  {/* Example */}
                  <div>
                    <label className="block text-parchment/60 text-sm mb-2">Ví dụ</label>
                    <input
                      type="text"
                      value={editedCard?.example || ''}
                      onChange={(e) => handleEditField('example', e.target.value)}
                      className="input-field"
                      placeholder="Nhập câu ví dụ..."
                      disabled={!isEditing}
                    />
                  </div>

                  {/* Add buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={handleAddCard}
                      disabled={!editedCard?.meaning}
                      className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Plus className="w-5 h-5" />
                      Thêm thẻ này
                    </button>
                    
                    {allMeanings.length > 1 && (
                      <button
                        onClick={handleAddAllCards}
                        className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-5 h-5" />
                        Thêm tất cả {allMeanings.length} loại từ
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Meaning Type Selector - BELOW the preview */}
      {allMeanings.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <div className="glass-panel">
            <h3 className="text-xl font-display font-bold text-gold mb-2">
              ⚡ Từ này có {allMeanings.length} loại từ khác nhau!
            </h3>
            <p className="text-parchment/60 mb-4">
              Click vào loại từ bạn muốn để thay đổi nghĩa trên thẻ bài:
            </p>
            
            <div className="grid gap-3">
              {allMeanings.map((meaning, index) => {
                const typeInfo = WORD_TYPE_COLORS[meaning.type] || WORD_TYPE_COLORS.unknown;
                const isSelected = selectedMeaningIndex === index;
                
                return (
                  <button
                    key={`meaning-${index}`}
                    type="button"
                    onClick={() => handleSelectMeaning(index)}
                    style={{ cursor: 'pointer' }}
                    className={`
                      w-full p-4 rounded-xl text-left transition-all duration-200
                      hover:scale-[1.01] active:scale-[0.99]
                      ${isSelected 
                        ? 'ring-2 ring-gold bg-gold/20 shadow-lg shadow-gold/20' 
                        : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-gold/30'
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      {/* Type badge */}
                      <span
                        className="px-3 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider shrink-0"
                        style={{ 
                          backgroundColor: `${typeInfo.bg}40`,
                          color: typeInfo.text,
                          border: `2px solid ${typeInfo.bg}`,
                        }}
                      >
                        {typeInfo.label}
                      </span>
                      
                      {/* Meanings */}
                      <div className="flex-1 min-w-0">
                        <p className="text-parchment font-medium leading-relaxed text-base">
                          {meaning.meaningVi}
                        </p>
                        <p className="text-parchment/50 text-sm mt-1 italic">
                          EN: {meaning.meaningEn}
                        </p>
                        {meaning.example && (
                          <p className="text-parchment/40 text-sm mt-2">
                            📝 "{meaning.example}"
                          </p>
                        )}
                      </div>
                      
                      {/* Selected indicator */}
                      {isSelected && (
                        <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center shrink-0">
                          <Check className="w-5 h-5 text-ink" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default CardCreator;
