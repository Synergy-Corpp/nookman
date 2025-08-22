/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'core-primary': '#00ff88',
        'core-secondary': '#ff0080',
        'core-dark': '#0a0a0a',
        'core-glow': '#00ffaa',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'ripple': 'ripple 1s ease-out',
        'warp': 'warp 0.8s ease-in-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { 
            transform: 'scale(1)', 
            boxShadow: '0 0 20px #00ffaa' 
          },
          '50%': { 
            transform: 'scale(1.05)', 
            boxShadow: '0 0 40px #00ffaa, 0 0 60px #00ffaa' 
          },
        },
        'ripple': {
          '0%': { 
            transform: 'scale(1)', 
            opacity: '1' 
          },
          '100%': { 
            transform: 'scale(4)', 
            opacity: '0' 
          },
        },
        'warp': {
          '0%': { 
            transform: 'scale(1) rotate(0deg)' 
          },
          '50%': { 
            transform: 'scale(0.95) rotate(1deg)' 
          },
          '100%': { 
            transform: 'scale(1) rotate(0deg)' 
          },
        }
      }
    },
  },
  plugins: [],
}