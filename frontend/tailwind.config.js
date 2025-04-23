/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  safelist: [
    {
      pattern: /bg-(primary|secondary)-(50|100|200|300|400|500|600|700|800|900|950)/,
      variants: ['hover', 'focus'],
    },
    {
      pattern: /text-(primary|secondary)-(50|100|200|300|400|500|600|700|800|900|950)/,
    },
    {
      pattern: /border-(primary|secondary)-(50|100|200|300|400|500|600|700|800|900|950)/,
    },
    {
      pattern: /dark:bg-(primary|secondary)-(50|100|200|300|400|500|600|700|800|900|950)/,
      variants: ['hover', 'focus'],
    },
    {
      pattern: /dark:text-(primary|secondary)-(50|100|200|300|400|500|600|700|800|900|950)/,
    },
    {
      pattern: /dark:border-(primary|secondary)-(50|100|200|300|400|500|600|700|800|900|950)/,
    },
    {
      pattern: /dark:bg-(gray|primary|secondary)-(50|100|200|300|400|500|600|700|800|900|950)/,
      variants: ['hover', 'focus'],
    },
    {
      pattern: /dark:text-(gray|primary|secondary)-(50|100|200|300|400|500|600|700|800|900|950)/,
    },
    {
      pattern: /dark:border-(gray|primary|secondary)-(50|100|200|300|400|500|600|700|800|900|950)/,
    }
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        secondary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        text: {
          light: '#1f2937', // Gray-900 for light mode
          dark: '#ffffff', // White for dark mode
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
}
