/** @type {import('tailwindcss').Config} */
export default {
  darkMode: false,
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        bar1: {
          "0%": { width: "0%" },
          "50%": { width: "80%" },
          "100%": { width: "80%" },
        },
        bar2: {
          "0%": { width: "0%" },
          "60%": { width: "50%" },
          "100%": { width: "50%" },
        },
      },
      animation: {
        bar1: "bar1 2.3s ease-in-out infinite",
        bar2: "bar2 2.6s ease-in-out infinite",
      },
      fontFamily: {
        apple: ["SF Pro Display", "sans-serif"], // Add your font family
      },
      colors: {
        "navbar-rgba": "rgba(251, 251, 253, .5)",
        "border-rgba": "rgba(251, 251, 253, .5)",
        "input-color": "hsla(0, 0%, 100%, .8)",
        "border-color": "#86868b",
      },
    },
  },
  plugins: [require("daisyui")],
};
