const mode = process.env.NODE_ENV === 'development' ? 'development' : 'production';

module.exports = {
  content: ['./src/**/*.{js,liquid}'],
  theme: {
    extend: {
      borderRadius: {
        medium: '0.375rem',
        large: '0.5rem',
        circle: '1.25rem',
      },
      fontSize: {
        h1: [
          '3rem',
          {
            lineHeight: '1.4',
            fontWeight: '700',
          },
        ],
        h2: [
          '2.5rem',
          {
            lineHeight: '1.4',
            fontWeight: '700',
          },
        ],
        h3: [
          '2rem',
          {
            lineHeight: '1.4',
            fontWeight: '600',
          },
        ],
        h4: [
          '1.5rem',
          {
            lineHeight: '1.4',
            fontWeight: '600',
          },
        ],
        h5: [
          '1.25rem',
          {
            lineHeight: '1.4',
            fontWeight: '600',
          },
        ],
        h6: [
          '1rem',
          {
            lineHeight: '1.4',
            fontWeight: '600',
          },
        ],
        xxxs: [
          '0.5rem',
          {
            lineHeight: '1.2',
          },
        ],
        xxs: [
          '0.625rem',
          {
            lineHeight: '1.4',
          },
        ],
        xs: [
          '0.75rem',
          {
            lineHeight: '1.8',
          },
        ],
        lg: [
          '1.125rem',
          {
            lineHeight: '1.8',
          },
        ],
        xl: [
          '1.25rem',
          {
            lineHeight: '1.8',
          },
        ],
        md: [
          '1rem',
          {
            lineHeight: '1.8',
          },
        ],
        sm: [
          '0.875rem',
          {
            lineHeight: '1.8',
          },
        ],
        'caption-lg': [
          '0.875rem',
          {
            lineHeight: '1.8',
            fontWeight: '600',
          },
        ],
        'caption-md': [
          '0.875rem',
          {
            lineHeight: '1.8',
            fontWeight: '600',
          },
        ],
        'caption-sm': [
          '0.6875rem',
          {
            lineHeight: '1.8',
            fontWeight: '600',
          },
        ],
        'button-lg': [
          '1rem',
          {
            lineHeight: '1.171875',
            fontWeight: '500',
          },
        ],
        'button-lg': [
          '1rem',
          {
            lineHeight: '1.171875',
            fontWeight: '500',
          },
        ],
        'button-sm': [
          '0.875rem',
          {
            lineHeight: '1.2',
            fontWeight: '500',
          },
        ],
        'overline-lg': [
          '0.875rem',
          {
            lineHeight: '1.7',
            fontWeight: '600',
          },
        ],
        'overline-sm': [
          '0.75rem',
          {
            lineHeight: '1.7',
            fontWeight: '600',
          },
        ],
      },
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        background: 'var(--color-background)',
        overlay: 'rgba(0,0,0,0.5)',
        error: 'var(--color-error)',
        warning: 'var(--color-warning)',
        success: 'var(--color-success)',
        sale: 'var(--color-sale)',
        hot: 'var(--color-hot)',
        new: 'var(--color-new)',
        soldout: 'var(--color-sold-out)'
      },
      spacing: {
        4.5: '1.125rem',
        7.5: '1.875rem',
        12.5: '3.125rem',
        13: '3.25rem',
        15: '3.75rem',
        17: '4.25rem',
        18: '4.5rem',
        25: '6.375rem',
        26: '6.5rem',
        '1/2': '50%',
        '1/3': 'calc(100%/3)',
        '2/3': 'calc(200%/3)',
        '1/4': '25%',
        '3/4': '75%',
        '1/5': '20%',
        '2/5': '40%',
        '3/5': '60%',
        '4/5': '80%',
        '1/6': 'calc(100%/6)',
        '5/6': 'calc(500%/6)',
        search: 'calc(100% - 60.8px)',
      },
      width: {
        0.25: '0.0625rem',
        37.5: '9.375rem',
        47.5: '11.875rem',
        87.75: '21.4375rem',
        97.5: '24.375rem',
        'slide-2': 'calc((100% - 10px)/2)',
        'slide-3': 'calc((100% - 20px)/3)',
        'slide-4': 'calc((100% - 30px)/4)',
        'slide-5': 'calc((100% - 40px)/5)',
      },
      height: {
        0.25: '0.0625rem',
        13: '3.25rem',
        37.5: '9.375rem',
        47.5: '11.875rem',
        97.5: '24.375rem',
      },
      boxShadow: {
        megamenu: '0px 10px 25px 0px rgba(0, 0, 0, 0.1)',
        select: '10px 10px 25px 10px rgba(0, 0, 0, 0.1)',
        note: '0 5px 15px #0000001a',
        popup: '0 20px 24px -4px rgba(16,24,40,.08), 0 8px 8px -4px rgba(16,24,40,.03)'
      },
      maxWidth: {
        container: 'var(--page-width)',
        '1/2': '50%',
        '1/3': 'calc(100%/3)',
        '2/3': 'calc(200%/3)',
        '1/4': '25%',
        '3/4': '75%',
        '1/5': '20%',
        '2/5': '40%',
        '3/5': '60%',
        '4/5': '80%',
        '1/6': 'calc(100%/6)',
        '5/6': 'calc(500%/6)',
        'facet': 'calc(100% - 4rem)',
        '62.5': '15.625rem',
        97.5: '24.375rem',
        '132': '33rem',
        '3-col-variant': 'calc((100% - 1rem)/3)',
        '6-col-variant': 'calc((100% - 2.5rem)/6)'
      },
      minWidth: {
        12: '3rem'
      },
      maxHeight: {
        '35': '8.75rem',
        searchmb: 'calc(100vh - 100%)',
        searchdt: 'calc(100vh + 60.8px - 100%)',
      },
      translate: {
        'button-card': 'calc(100% + 1.25rem)',
        'facet-tl': 'calc(100% + 1.875rem)',
        'facet-dt': 'calc(100% + 3.125rem)'
      },
      content: {
        empty: '""',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'sans-serif'],
        base: ['var(--font-base)', 'sans-serif'],
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
