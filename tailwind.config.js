const mode = process.env.NODE_ENV === 'development' ? 'development' : 'production';

module.exports = {
  content: ['./src/**/*.{js,liquid}'],
  theme: {
    extend: {
      borderRadius: {
        medium: '0.375rem',
        large: '0.5rem',
      },
      colors: {
        primaryColor: '#5D3ED3',
        secondaryColor: '#FF6952',
        headerColor: '#140C2B',
        copyColor: '#4D4D4D',
        offBG: '#F8D7E6',
      },
      padding: {
        large: '8rem',
        medium: '6rem',
      },
      fontFamily: {
        sans: ['Inter var', 'sans-serif'],
      },
    },
  },
  variants: {},
  plugins: [
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/forms'),
  ],
};
