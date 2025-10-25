/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      maxWidth: {
        'mobile': '28rem', // 448px for mobile-first design
      },
    },
  },
  plugins: [],
}
