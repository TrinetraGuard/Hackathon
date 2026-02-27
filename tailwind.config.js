// tailwind.config.js
import * as colors from 'tailwindcss/colors';
import { defineConfig } from 'vite-plugin-windicss';

export default defineConfig({
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'fira-sans': 'Fira Sans',
        'keania-one': 'Keania One',
        'open-sans': 'Open Sans',
        'poppins': 'Poppins',
        'pt-sans': 'PT Sans',
        'ubuntu': 'Ubuntu',
      },
      colors: {
        primary: colors.blue
      }
    },
  },
  plugins: [],
});
