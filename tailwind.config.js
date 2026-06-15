/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        vault: {
          bg: '#070d0a',
          dark: '#0a1a0f',
          panel: '#0f2318',
          border: '#1a3d22',
          gold: '#c9a227',
          'gold-light': '#e8c547',
          'gold-dark': '#a07c10',
          green: '#1a5c2a',
          'green-light': '#22c55e',
          red: '#7f1d1d',
          'red-light': '#ef4444',
          stone: '#374151',
          'stone-light': '#6b7280',
        },
      },
      fontFamily: {
        vault: ['"Share Tech Mono"', 'monospace'],
        display: ['"Cinzel"', 'serif'],
      },
      boxShadow: {
        gold: '0 0 15px rgba(201, 162, 39, 0.4)',
        'gold-lg': '0 0 30px rgba(201, 162, 39, 0.6)',
        green: '0 0 15px rgba(34, 197, 94, 0.3)',
        red: '0 0 15px rgba(239, 68, 68, 0.4)',
      },
      animation: {
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'vault-open': 'vaultOpen 0.6s ease-out forwards',
        'slide-in': 'slideIn 0.3s ease-out forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'coin-flip': 'coinFlip 0.6s ease-in-out',
        'progress-fill': 'progressFill 1s ease-out forwards',
        'confetti': 'confettiFall 1s ease-in forwards',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(201,162,39,0.4)' },
          '50%': { boxShadow: '0 0 20px rgba(201,162,39,0.9)' },
        },
        vaultOpen: {
          '0%': { transform: 'rotateY(-90deg)', opacity: '0' },
          '100%': { transform: 'rotateY(0deg)', opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        coinFlip: {
          '0%': { transform: 'rotateY(0deg)' },
          '50%': { transform: 'rotateY(90deg)' },
          '100%': { transform: 'rotateY(0deg)' },
        },
        progressFill: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--progress-width)' },
        },
        confettiFall: {
          '0%': { transform: 'translateY(-20px) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100px) rotate(720deg)', opacity: '0' },
        },
        glow: {
          '0%': { textShadow: '0 0 10px rgba(201,162,39,0.5)' },
          '100%': { textShadow: '0 0 20px rgba(201,162,39,1), 0 0 40px rgba(201,162,39,0.5)' },
        },
      },
    },
  },
  plugins: [],
}
