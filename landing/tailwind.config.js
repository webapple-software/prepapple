/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0B1F4D", // Navy Blue
        accent: {
          start: "#1E88E5", // Sky Blue gradient start
          end: "#4FC3F7",   // Sky Blue gradient end
        },
        test: {
          answered: "#10B981", // Success green
          review: "#F59E0B",   // Amber
          unanswered: "#EF4444", // Red
          unvisited: "#94A3B8"   // Gray
        }
      },
      fontFamily: {
        heading: ["Poppins", "Inter", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(135deg, #1E88E5 0%, #4FC3F7 100%)',
      }
    },
  },
  plugins: [],
}
