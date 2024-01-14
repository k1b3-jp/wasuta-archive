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
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        ruka: '#F2A2C8',
        hazuki: '#FBCC7E',
        ririka: '#7EC8D9',
        nanase: '#8ABF92',
        miri: '#C6A4C6',
        'bg-pink': '#fbdfe0',
        'bg-purple': '#e1c4da',
        'font-color': '#43322d',
        'text-yellow': '#dba926',
        'text-green': '#b4d6d4',
      },
      fontFamily: {
        NotoSansJP: ['var(--font-NotoSansJP)'],
      },
    },
  },
  plugins: [],
};
export default config;
