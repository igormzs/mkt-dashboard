/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        brand: {
          bg: '#F8F9FA',
          dark: '#1a1a1a',
          charcoal: '#2D3748',
          mint: '#A7F3D0',
          mintdark: '#059669',
          lavender: '#E0E7FF',
          blue: '#378ADD',
          red: '#FCA5A5',
        },
      },
      borderRadius: {
        '3xl': '24px',
      },
      boxShadow: {
        'card': '0 2px 15px rgba(0,0,0,0.02)',
        'card-lg': '0 4px 20px rgba(0,0,0,0.02)',
        'sidebar': '2px 0 12px rgba(0,0,0,0.03)',
      },
      animation: {
        'shimmer': 'shimmer 1.5s infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-700px 0' },
          '100%': { backgroundPosition: '700px 0' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(5px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
