import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './stories/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        'font-color': '#2f2f2f',
        'light-black': '#333333',
        'deep-gray': '#F0F2F5',
        'light-gray': '#f5f5f5',
        'light-green': '#7bdcb5',
        'deep-green': '#2cb',
      },
      fontFamily: {
        NotoSansJP: ['var(--font-NotoSansJP)'],
      },
    },
  },
  plugins: [],
};
export default config;
