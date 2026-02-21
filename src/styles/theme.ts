export const theme = {
  colors: {
    navy: {
      950: '#040c1a',
      900: '#071224',
      800: '#0d1f3c',
      700: '#132d55',
      600: '#1a3a6e',
      500: '#1e4480',
    },
    gold: {
      300: '#e8c97a',
      400: '#d4a843',
      500: '#b8963e',
      600: '#9a7c32',
      700: '#7a6228',
    },
    parchment: {
      50:  '#faf8f4',
      100: '#f4f0e6',
      200: '#e8e0d0',
    },
    slate: {
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
    },
  },
  fonts: {
    serif: '"Libre Baskerville", "Playfair Display", Georgia, serif',
    sans:  '"Inter", system-ui, sans-serif',
    mono:  '"JetBrains Mono", "Fira Code", monospace',
  },
  spacing: {
    section: '5rem',
    container: '1280px',
  },
} as const

export type Theme = typeof theme
