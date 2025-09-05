/** @type {import('tailwindcss').Config} */
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4F46E5",
      },
      animation: {
        'bounce-once': 'bounce 1s ease-in-out',
        'confetti-1': 'confetti1 3s ease-out forwards',
        'confetti-2': 'confetti2 3s ease-out forwards',
        'confetti-3': 'confetti3 3s ease-out forwards',
        'confetti-4': 'confetti4 3s ease-out forwards',
        'confetti-5': 'confetti5 3s ease-out forwards',
        'confetti-6': 'confetti6 3s ease-out forwards',
        'fadeIn': 'fadeIn 0.5s ease-in forwards',
        'scale': 'scale 0.3s ease-in-out',
      },
      keyframes: {
        confetti1: {
          '0%': { transform: 'translate(0, 0) rotate(0deg)' },
          '100%': { transform: 'translate(-50px, -100px) rotate(-180deg)' }
        },
        confetti2: {
          '0%': { transform: 'translate(0, 0) rotate(0deg)' },
          '100%': { transform: 'translate(50px, -100px) rotate(180deg)' }
        },
        confetti3: {
          '0%': { transform: 'translate(0, 0) rotate(0deg)' },
          '100%': { transform: 'translate(-70px, -60px) rotate(-180deg)' }
        },
        confetti4: {
          '0%': { transform: 'translate(0, 0) rotate(0deg)' },
          '100%': { transform: 'translate(70px, -60px) rotate(180deg)' }
        },
        confetti5: {
          '0%': { transform: 'translate(0, 0) rotate(0deg)' },
          '100%': { transform: 'translate(-30px, -80px) rotate(-180deg)' }
        },
        confetti6: {
          '0%': { transform: 'translate(0, 0) rotate(0deg)' },
          '100%': { transform: 'translate(30px, -80px) rotate(180deg)' }
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        scale: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' }
        }
      },
    },
  },
  plugins: [],
};
