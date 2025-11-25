import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardProvider, useCards } from './context/CardContext';
import Navigation from './components/Navigation';
import CardCreator from './components/CardCreator';
import Deck from './components/Deck';
import Quiz from './components/Quiz';
import Binder from './components/Binder';
import { getStorageInfo } from './services/storageService';
import { Smartphone, HardDrive, Cloud, Check } from 'lucide-react';

function StorageIndicator() {
  const { cards, isSaving, lastSaved } = useCards();
  const [storageInfo, setStorageInfo] = useState(null);

  useEffect(() => {
    getStorageInfo().then(setStorageInfo);
  }, []);

  if (!storageInfo) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 right-4 z-30">
      <div className="glass-panel !p-3 text-xs flex items-center gap-2">
        {storageInfo.platform === 'mobile' ? (
          <Smartphone className="w-4 h-4 text-green-400" />
        ) : (
          <HardDrive className="w-4 h-4 text-blue-400" />
        )}
        <div>
          <p className="text-parchment/80">
            {storageInfo.platform === 'mobile' 
              ? '📁 Documents/zLearning/' 
              : '💾 localStorage'
            }
          </p>
          <p className="text-parchment/50">
            {cards.length} thẻ 
            {isSaving && <span className="text-yellow-400"> • Đang lưu...</span>}
            {!isSaving && lastSaved && (
              <span className="text-green-400"> • <Check className="w-3 h-3 inline" /> Đã lưu</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState('create');

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="py-6 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3"
        >
          {/* Logo */}
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-400 to-cyan-500 flex items-center justify-center shadow-lg">
              <span className="text-2xl font-display font-bold text-white">Z</span>
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-pulse" />
          </div>
          
          <div className="text-left">
            <h1 className="text-2xl md:text-3xl font-display font-bold">
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                zLearning
              </span>
            </h1>
            <p className="text-parchment/50 text-xs md:text-sm tracking-wider">
              Học từ vựng thông minh với AI
            </p>
          </div>
        </motion.div>
      </header>

      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Main Content */}
      <main className="flex-1 pb-24 md:pb-8 pt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'create' && <CardCreator />}
            {activeTab === 'deck' && <Deck />}
            {activeTab === 'quiz' && <Quiz />}
            {activeTab === 'binder' && <Binder />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Storage Indicator */}
      <StorageIndicator />

      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/3 rounded-full blur-3xl" />
      </div>
    </div>
  );
}

function App() {
  return (
    <CardProvider>
      <AppContent />
    </CardProvider>
  );
}

export default App;

