/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sag: {
          green: '#123f2a',
          forest: '#0f2f22',
          leaf: '#1f7a4d',
          lime: '#8abf45',
          gold: '#c59b3c',
          earth: '#7a4f27',
          mist: '#f5f7f3',
        },
      },
      boxShadow: {
        soft: '0 20px 50px rgba(15, 47, 34, 0.12)',
        'sag-soft': '0 20px 50px rgba(15, 47, 34, 0.12)',
        'sag-card': '0 4px 24px rgba(15, 47, 34, 0.08)',
        'sag-hover': '0 16px 48px rgba(15, 47, 34, 0.18)',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease forwards',
        'count-up': 'countUp 1.5s ease forwards',
        'slide-in': 'slideIn 0.5s ease forwards',
        'fade-in': 'fadeIn 0.25s ease forwards',
        'pop-in': 'popIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.88) translateY(16px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
