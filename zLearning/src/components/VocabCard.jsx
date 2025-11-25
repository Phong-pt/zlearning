import React from 'react';
import { motion } from 'framer-motion';
import { WORD_TYPE_COLORS } from '../services/dictionaryService';

function VocabCard({ 
  card, 
  isFlipped = false, 
  isAnimating = false,
  hiddenField = null,
  showCorrect = false,
  size = 'normal', // 'normal', 'small', 'large'
  onClick,
  className = '',
}) {
  if (!card) return null;

  const typeInfo = WORD_TYPE_COLORS[card.type] || WORD_TYPE_COLORS.unknown;
  
  const sizeClasses = {
    small: 'w-40 h-56 text-sm',
    normal: 'w-72 h-96',
    large: 'w-80 h-[28rem] md:w-96 md:h-[32rem]',
  };

  const renderField = (fieldName, content, className = '') => {
    if (hiddenField === fieldName) {
      return (
        <div className={`${className} flex items-center justify-center`}>
          <span className="text-gold/50 text-2xl">???</span>
        </div>
      );
    }
    return <div className={className}>{content}</div>;
  };

  return (
    <motion.div
      className={`
        relative ${sizeClasses[size]} ${className}
        ${onClick ? 'cursor-pointer' : ''}
        ${showCorrect ? 'correct-glow' : ''}
      `}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: showCorrect ? [1, 1.05, 1] : 1,
      }}
      whileHover={onClick ? { scale: 1.02, y: -5 } : {}}
      transition={{ duration: 0.3 }}
    >
      {/* Card background with gradient border */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gold/40 via-bronze/30 to-gold/20 p-[2px]">
        <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#1a1a2e] via-[#242442] to-[#1a1a2e] overflow-hidden">
          {/* Decorative corner elements */}
          <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-gold/30 rounded-tl-lg" />
          <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-gold/30 rounded-tr-lg" />
          <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-gold/30 rounded-bl-lg" />
          <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-gold/30 rounded-br-lg" />

          {/* Card content */}
          <div className="relative h-full flex flex-col items-center justify-between p-6">
            {/* Top section - Word type tag */}
            <div className="w-full flex justify-center">
              {renderField('type',
                <span
                  className="word-type-tag"
                  style={{ 
                    backgroundColor: `${typeInfo.bg}20`,
                    color: typeInfo.text,
                    border: `1px solid ${typeInfo.bg}50`,
                  }}
                >
                  {typeInfo.label}
                </span>,
                ''
              )}
            </div>

            {/* Middle section - Word and IPA */}
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              {renderField('word',
                <h2 className="font-display text-3xl md:text-4xl font-bold text-parchment text-center leading-tight">
                  {card.word}
                </h2>,
                ''
              )}
              
              {renderField('ipa',
                <p className="ipa-text text-center">
                  {card.ipa}
                </p>,
                ''
              )}
            </div>

            {/* Bottom section - Meaning */}
            <div className="w-full">
              {renderField('meaning',
                <div className="text-center">
                  <p className="text-parchment/90 text-lg leading-relaxed font-body">
                    {card.meaning}
                  </p>
                  {card.example && size !== 'small' && (
                    <p className="text-parchment/50 text-sm mt-2 italic">
                      "{card.example}"
                    </p>
                  )}
                </div>,
                ''
              )}
            </div>

            {/* Shimmer effect overlay */}
            {isAnimating && (
              <div className="absolute inset-0 shimmer pointer-events-none" />
            )}

            {/* Correct answer glow effect */}
            {showCorrect && (
              <motion.div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.6 }}
                style={{
                  boxShadow: '0 0 40px rgba(34, 197, 94, 0.6), inset 0 0 20px rgba(34, 197, 94, 0.2)',
                }}
              />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default VocabCard;

