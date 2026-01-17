/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      maxWidth: {
        'mobile': '32rem', // 512px for better card display
      },
      colors: {
        // Paper/cream tones
        paper: {
          50: '#fdfcf9',
          100: '#f8f6f0',
          200: '#f5f0e6',
          300: '#ebe4d4',
          400: '#d4c9b5',
        },
        // Deep navy ink
        ink: {
          700: '#1a2744',
          800: '#141d33',
          900: '#0d1422',
        },
        // Split-flap charcoal
        flap: {
          bg: '#2d2d2d',
          dark: '#1a1a1a',
          border: '#3d3d3d',
        },
        // Amber/gold for flap text
        amber: {
          gold: '#e6a919',
          light: '#f4c430',
        },
        // Stamp colors
        stamp: {
          red: '#c23b22',
          green: '#2d6a4f',
          redBg: 'rgba(194, 59, 34, 0.1)',
          greenBg: 'rgba(45, 106, 79, 0.1)',
        },
        // Perforation brown
        perf: '#a08060',
      },
      fontFamily: {
        'mono-flap': ['"Share Tech Mono"', 'monospace'],
        'typewriter': ['"Special Elite"', 'cursive'],
        'airline': ['"Bebas Neue"', 'sans-serif'],
        'body': ['"Source Sans 3"', 'sans-serif'],
      },
      boxShadow: {
        'flap': 'inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.3)',
        'flap-deep': '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
        'paper': '0 4px 20px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.1)',
        'ticket': '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
      },
      backgroundImage: {
        'paper-texture': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
