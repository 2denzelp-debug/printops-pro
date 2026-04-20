import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#22c55e', dark: '#16a34a' },
      },
      fontFamily: {
        mono: ['DM Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
export default config
