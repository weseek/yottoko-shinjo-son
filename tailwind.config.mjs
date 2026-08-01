import nextAdminPreset from "@premieroctet/next-admin/preset";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@premieroctet/next-admin/dist/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  presets: [nextAdminPreset],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "var(--color-primary-50)",
          100: "var(--color-primary-100)",
          200: "var(--color-primary-200)",
          300: "var(--color-primary-300)",
          400: "var(--color-primary-400)",
          500: "var(--color-primary-500)",
          600: "var(--color-primary-600)",
          700: "var(--color-primary-700)",
        },
        secondary: {
          50: "var(--color-secondary-50)",
          100: "var(--color-secondary-100)",
          200: "var(--color-secondary-200)",
          300: "var(--color-secondary-300)",
          400: "var(--color-secondary-400)",
          500: "var(--color-secondary-500)",
        },
        neutral: {
          0: "var(--color-neutral-0)",
          50: "var(--color-neutral-50)",
          100: "var(--color-neutral-100)",
          200: "var(--color-neutral-200)",
          300: "var(--color-neutral-300)",
          400: "var(--color-neutral-400)",
          500: "var(--color-neutral-500)",
          600: "var(--color-neutral-600)",
          700: "var(--color-neutral-700)",
          800: "var(--color-neutral-800)",
        },
        spot: {
          DEFAULT: "var(--color-spot)",
          action: "var(--color-spot-action)",
        },
        "body-blue": "var(--color-body-blue)",
        arcana: {
          bg: "var(--color-arcana-bg)",
          green: "var(--color-arcana-green)",
          limegreen: "var(--color-arcana-limegreen)",
          "primary-green": "var(--color-arcana-primary-green)",
          "orange-secondary": "var(--color-arcana-orange-secondary)",
        },
      },
      boxShadow: {
        yellow: "var(--shadow-yellow)",
      },
      borderWidth: {
        3: "3px",
      },
    },
  },
};
