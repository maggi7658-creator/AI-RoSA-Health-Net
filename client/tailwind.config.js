/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brutal: {
          canvas: "#FFFDF6",
          card: "#FFFFFF",
          cream: "#F5F0E6",
          yellow: "#FFE600",
          mint: "#70EE9C",
          red: "#FF6B6B",
          blue: "#60A5FA",
          purple: "#D8B4FE",
          orange: "#FFA94D",
          black: "#000000",
          muted: "#6B7280"
        }
      },
      boxShadow: {
        'brutal-sm': '2px 2px 0px 0px #000000',
        'brutal': '4px 4px 0px 0px #000000',
        'brutal-lg': '6px 6px 0px 0px #000000',
        'brutal-xl': '8px 8px 0px 0px #000000',
        'brutal-red': '4px 4px 0px 0px #DC2626',
        'brutal-pressed': '1px 1px 0px 0px #000000'
      },
      borderWidth: {
        '3': '3px',
        '5': '5px'
      }
    },
  },
  plugins: [],
}
