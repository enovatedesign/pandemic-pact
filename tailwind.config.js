/** @type {import('tailwindcss').Config} */
/* eslint-disable max-len */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    transparent: "transparent",
    current: "currentColor",
    extend: {
      colors: {
        primary: {
          lightest: "hsl(178, 58%, 81%)",
          lighter: "hsl(178, 58%, 71%)",
          DEFAULT: "hsl(178, 58%, 61%)",
          darker: "hsl(178, 58%, 51%)",
        },
        secondary: {
          lighter: "hsl(240, 100%, 22%)",
          DEFAULT: "hsl(240, 100%, 12%)",
          darker: "hsl(240, 100%, 2%)",
        },
        searchResult: {
          DEFAULT: '#E8AA85',
        },
        // light mode
        tremor: {
          brand: {
            faint: "#eff6ff", // blue-50
            muted: "#bfdbfe", // blue-200
            subtle: "#60a5fa", // blue-400
            DEFAULT: "#3b82f6", // blue-500
            emphasis: "#1d4ed8", // blue-700
            inverted: "#ffffff", // white
          },
          background: {
            muted: "#f9fafb", // gray-50
            subtle: "#f3f4f6", // gray-100
            DEFAULT: "#ffffff", // white
            emphasis: "#374151", // gray-700
          },
          border: {
            DEFAULT: "#e5e7eb", // gray-200
          },
          ring: {
            DEFAULT: "#e5e7eb", // gray-200
          },
          content: {
            subtle: "#9ca3af", // gray-400
            DEFAULT: "#6b7280", // gray-500
            emphasis: "#374151", // gray-700
            strong: "#111827", // gray-900
            inverted: "#ffffff", // white
          },
        },
        brand: {
          blue: {
            DEFAULT: "#202157",
            "100": "#E5E5F5",
            "200": "#C0C0E8",
            "300": "#9A9BDA",
            "400": "#7577CC",
            "500": "#5052BF",
            "600": "#3B3DA0",
            "700": "#2D2F7B",
            "800": "#1F2156",
            "900": "#121331",
          },
          teal: {
            DEFAULT: "#79CCCB",
            "100": "#E9F7F6",
            "200": "#C4E9E8",
            "300": "#9FDADA",
            "400": "#7ACCCB",
            "500": "#55BEBD",
            "600": "#3EA3A1",
            "700": "#307E7D",
            "800": "#225958",
            "900": "#143433",
            "richText-h2": "#23807E"
          },
          green: {
            DEFAULT: "#AFD46C",
            "100": "#F0F7E3",
            "200": "#DAEBBC",
            "300": "#C5E094",
            "400": "#B0D46D",
            "500": "#9AC946",
            "600": "#7FAA32",
            "700": "#618226",
            "800": "#445B1B",
            "900": "#26330F",
          },
          orange: {
            DEFAULT: "#F4793B",
            "100": "#FDE8DD",
            "200": "#FAC7AD",
            "300": "#F8A67D",
            "400": "#F5854C",
            "500": "#F2641C",
            "600": "#D04D0C",
            "700": "#9F3B09",
            "800": "#6F2906",
            "900": "#3F1704",
          },
          grey: {
            DEFAULT: "#A7A9AC",
            "100": "#F5F5F5",
            "200": "#DADBDC",
            "300": "#C0C1C4",
            "400": "#A6A8AB",
            "500": "#8C8E92",
            "600": "#727579",
            "700": "#595B5E",
            "800": "#404244",
            "900": "#28292A",
          },
          red: {
            DEFAULT: "#A83248",
            "100": "#F7E3E7",
            "200": "#EBBCC5",
            "300": "#DF95A3",
            "400": "#D46E81",
            "500": "#C8465E",
            "600": "#A93248",
            "700": "#822738",
            "800": "#5A1B27",
            "900": "#330F16",
          },
          yellow: {
            DEFAULT: "#DBD107",
            "100": "#FEFCDC",
            "200": "#FCF8AB",
            "300": "#FBF57A",
            "400": "#F9F148",
            "500": "#F8ED17",
            "600": "#D5CB07",
            "700": "#A39C05",
            "800": "#726C04",
            "900": "#403D02",
          },
        },
      },
      typography: (theme) => ({
        gray: {
            css: {
                '--tw-prose-bullets': theme('colors.primary.DEFAULT'),
            },
        },
        invert: {
            css: {
                '--tw-prose-bullets': theme('colors.secondary.DEFAULT'),
            },
        },
      }),
      zIndex: {
        '-1': '-1',
      },
      boxShadow: {
        // light
        "tremor-input": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "tremor-card": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "tremor-dropdown": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      },
      borderRadius: {
        "tremor-small": "0.375rem",
        "tremor-default": "0.5rem",
        "tremor-full": "9999px",
      },
      fontSize: {
        "tremor-label": ["0.75rem"],
        "tremor-default": ["0.875rem", { lineHeight: "1.25rem" }],
        "tremor-title": ["1.125rem", { lineHeight: "1.75rem" }],
        "tremor-metric": ["1.875rem", { lineHeight: "2.25rem" }],
      },
      fontFamily: {
        sans: ["var(--font-figtree)", "sans-serif"],
      },
      height: {
        "d-screen": "100dvh"
      }
    },
  },
  safelist: [
    {
      pattern:
        /^(bg-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(text-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(border-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(ring-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(stroke-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(fill-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern: /^col-span-(2|3)$/
    },
  ],
  plugins: [
    require("@headlessui/tailwindcss"),
    require('@tailwindcss/typography'),
    ({ addComponents, theme }) => {
      addComponents(
        {
          '.container': {
            margin: '0 auto',
            padding: '0 1.5rem',
            width: '100%',
            maxWidth: theme('screens.2xl'),

            '@screen md': {
              padding: '0 2rem',
            },

            '@screen lg': {
              padding: '0 3rem',
            },
          },
        },
        ['responsive']
      );
    },
  ],
  corePlugins: {
    container: false,
  },
};
