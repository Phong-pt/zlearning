import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Layers, Brain, Grid3X3 } from 'lucide-react';

const tabs = [
  { id: 'create', label: 'Tạo thẻ', icon: Sparkles },
  { id: 'deck', label: 'Học bài', icon: Layers },
  { id: 'quiz', label: 'Kiểm tra', icon: Brain },
  { id: 'binder', label: 'Sưu tập', icon: Grid3X3 },
];

function Navigation({ activeTab, setActiveTab }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:relative md:bottom-auto">
      {/* Mobile bottom nav */}
      <div className="md:hidden bg-[#1a1a2e]/95 backdrop-blur-xl border-t border-gold/20">
        <div className="flex justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative flex-1 flex flex-col items-center py-3 px-2 transition-colors
                  ${isActive ? 'text-gold' : 'text-parchment/60'}
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileTabIndicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-gold to-bronze rounded-b-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop top nav */}
      <div className="hidden md:block py-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass-panel !p-2 flex justify-center gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative px-6 py-3 rounded-xl font-medium transition-all duration-200
                    flex items-center gap-2
                    ${isActive 
                      ? 'text-ink' 
                      : 'text-parchment/70 hover:text-parchment hover:bg-white/5'
                    }
                  `}
                >
                  {isActive && (
                    <motion.div
                      layoutId="desktopTabIndicator"
                      className="absolute inset-0 bg-gradient-to-r from-gold to-bronze rounded-xl"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <Icon className={`relative w-5 h-5 ${isActive ? 'z-10' : ''}`} />
                  <span className={`relative ${isActive ? 'z-10' : ''}`}>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;

