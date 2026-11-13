/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        campus: {
          bg: '#090909',
          surface: '#141414',
          card: '#1B1B1B',
          'card-hover': '#242424',
          border: '#2A2A2A',
          primary: '#F59E0B',
          secondary: '#FF6B35',
          text: '#FFFFFF',
          muted: '#A1A1AA',
          success: '#22C55E',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        display: ['Outfit', 'Cabinet Grotesk', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 25px -5px rgba(245, 158, 11, 0.35)',
        'glow-secondary': '0 0 25px -5px rgba(255, 107, 53, 0.35)',
        'glow-card': '0 10px 30px -10px rgba(0, 0, 0, 0.7), 0 0 15px -3px rgba(245, 158, 11, 0.08)',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(2deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}

