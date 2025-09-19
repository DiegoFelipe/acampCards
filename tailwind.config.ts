// tailwind.config.js
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        spinSlowZ: {
          "0%": { transform: "rotate(0deg) scale(1)" },
          "100%": { transform: "rotate(1080deg) scale(1.1)" }, // 3 voltas completas
        },
      },
      animation: {
        spinSlowZ: "spinSlowZ 3s ease-in-out forwards",
      },
    },
  },
  plugins: [],
};
