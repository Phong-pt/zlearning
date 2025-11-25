/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'display': ['Playfair Display', 'serif'],
        'body': ['Crimson Text', 'serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      colors: {
        'card': {
          'noun': '#1e40af',
          'verb': '#dc2626',
          'adjective': '#16a34a',
          'adverb': '#9333ea',
          'preposition': '#ea580c',
          'conjunction': '#0891b2',
          'pronoun': '#db2777',
          'interjection': '#ca8a04',
        },
        'parchment': '#faf7f2',
        'ink': '#1a1a1a',
        'gold': '#d4af37',
        'bronze': '#cd7f32',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1), 0 10px 20px -5px rgba(0, 0, 0, 0.15)',
        'card-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.15), 0 20px 40px -10px rgba(0, 0, 0, 0.2)',
        'glow': '0 0 20px rgba(212, 175, 55, 0.5)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-glow': 'pulseGlow 1.5s ease-in-out infinite',
        'correct': 'correct 0.6s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(212, 175, 55, 0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(212, 175, 55, 0.8)' },
        },
        correct: {
          '0%': { transform: 'scale(1)', boxShadow: '0 0 0 rgba(34, 197, 94, 0)' },
          '50%': { transform: 'scale(1.05)', boxShadow: '0 0 40px rgba(34, 197, 94, 0.8)' },
          '100%': { transform: 'scale(1)', boxShadow: '0 0 0 rgba(34, 197, 94, 0)' },
        },
      },
    },
  },
  plugins: [],
}

