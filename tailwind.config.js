/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0B1F33',
          light: '#123B5D',
          dark: '#071523',
        },
        gold: {
          DEFAULT: '#D5A84B',
          light: '#E4C382',
          dark: '#B78B34',
        },
        offwhite: '#F7F8F8',
        ink: '#17212B',
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 10px rgba(11, 31, 51, 0.06)',
        'card-hover': '0 12px 28px rgba(11, 31, 51, 0.14)',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
