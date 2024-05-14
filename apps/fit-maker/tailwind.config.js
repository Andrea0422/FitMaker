const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./apps/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'redwallpaper': "url('/assets/images/redwallpaper.png')",
      }
    },
  },
  plugins: [],
};
