
import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary': '#10a37f',
        'user-message-bg': '#f0f4f9',
        'user-message-bg-dark': '#40414f',
        'bot-message-bg': '#f7f7f8',
        'bot-message-bg-dark': '#444654',
      },
    },
  },
  plugins: [
    typography,
  ],
}
export default config
