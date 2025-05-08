/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      typography: () => ({
        DEFAULT: {
          css: {
            "--tw-prose-bullets": "var(--color-pink-400)",
            "--tw-prose-invert-bullets": "var(--color-pink-600)",
          },
        },
      }),
    },
  },
};
