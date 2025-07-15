/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./src/renderer/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      screens: {
        '2xsm': '400px', // O el tamaño que quieras
      },
      maxHeight:{
        'screen-80':'80vh'
      },
      height: {
        'screen-70': '70vh',
        'screen-80': '80vh',
      },
      zIndex: {
        1: '1',
        2: '2',
        3: '3',
        4: '4',
        5: '5',
        99999: '99999', // Asegúrate de que este valor sea mayor que el de tu botón
        999999:"999999"
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
      },
      colors: {
        gray: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
        },
        brand: {
          50: '#f2f7ff',
          100: '#e6f0ff',
          500: '#465fff',
          400: '#4c5aff', // color que falta, ejemplo
          600: '#3b4edd', // color que falta, ejemplo

          // ...otros si quieres
        },
        success: {
          50: "#ecfdf5",
          500: "#10b981",
        },
        error: {
          50: "#fef2f2",
          500: "#ef4444",
        },
        orange: {
          50: "#fff7ed",
          500: "#f97316",
        },
       'gray-dark': "#0f172a",
      },
      width: {
        '6.5': '1.625rem',
      },
      boxShadow: {
        "theme-xs": "0 1px 1px rgba(0, 0, 0, 0.05)", // define un valor apropiado para xs
        "theme-sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        "theme-xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        "slider-navigation": "0 4px 6px rgba(0,0,0,0.1)",
        datepicker: "0px 0px 0px 1px rgba(255, 255, 255, 0.1)",
      },
      fontSize: {
        "theme-xs": "0.75rem",
        "theme-sm": "0.875rem",
      },
   
    },
  },
  plugins: [],
}