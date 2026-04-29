/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#8b5cf6', // Violet
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b', // Slate
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        accent: {
          400: '#fbbf24', // Amber/Yellow
        },
        darkBg: "#0f0728",
        darkCard: "#170d38",
        darkBorder: "#2e1c5e",
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
        display: ['"Poppins"', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 15px rgba(139, 92, 246, 0.4)',
        'neon-intense': '0 0 25px rgba(139, 92, 246, 0.6)',
      },
      dropShadow: {
        'neon': '0 0 8px rgba(139, 92, 246, 0.6)',
      }
    },
  },
  plugins: [],
};
