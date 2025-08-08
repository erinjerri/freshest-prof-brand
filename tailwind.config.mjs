import tailwindcssAnimate from 'tailwindcss-animate'
import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './app/**/*.{ts,tsx}', // Updated from ./pages/ to match App Router
    './components/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './node_modules/@payloadcms/richtext-lexical/**/*.{ts,tsx}', // Added for Lexical editor
  ],
  darkMode: ['selector', '[data-theme="dark"]'],
  plugins: [tailwindcssAnimate, typography],
  prefix: '',
  safelist: [
    'lg:col-span-4',
    'lg:col-span-6',
    'lg:col-span-8',
    'lg:col-span-12',
    'border-border',
    'bg-card',
    'border-error',
    'bg-error/30',
    'border-success',
    'bg-success/30',
    'border-warning',
    'bg-warning/30',
    'prose', // Safelist typography classes
    'prose-h1',
    'prose-h2',
    'prose-h3',
    'prose-p',
    'prose-invert', // Dark mode compatibility
  ],
  theme: {
    container: {
      center: true,
      padding: {
        '2xl': '2rem',
        DEFAULT: '1rem',
        lg: '2rem',
        md: '2rem',
        sm: '1rem',
        xl: '2rem',
      },
      screens: {
        '2xl': '86rem',
        lg: '64rem',
        md: '48rem',
        sm: '40rem',
        xl: '80rem',
      },
    },
    extend: {
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        background: 'hsl(var(--background))',
        border: 'hsla(var(--border))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        foreground: 'hsl(var(--foreground))',
        input: 'hsl(var(--input))',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        ring: 'hsl(var(--ring))',
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        success: 'hsl(var(--success))',
        error: 'hsl(var(--error))',
        warning: 'hsl(var(--warning))',
      },
      fontFamily: {
        mono: ['var(--font-geist-mono)'],
        sans: ['Satoshi', 'sans-serif'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      typography: (theme) => ({
        DEFAULT: {
          css: [
            {
              '--tw-prose-body': 'var(--text)',
              '--tw-prose-headings': 'var(--text)',
              h1: {
                fontWeight: 'normal',
                marginBottom: '0.25em',
                color: theme('colors.foreground'),
              },
              h2: {
                fontWeight: 600,
                marginBottom: '0.5em',
                color: theme('colors.foreground'),
              },
              h3: {
                fontWeight: 500,
                marginBottom: '0.5em',
                color: theme('colors.foreground'),
              },
              p: {
                color: theme('colors.muted.foreground'),
              },
            },
            {
              '&.prose-invert': {
                '--tw-prose-body': theme('colors.muted.foreground'),
                '--tw-prose-headings': theme('colors.foreground'),
                h1: { color: theme('colors.foreground') },
                h2: { color: theme('colors.foreground') },
                h3: { color: theme('colors.foreground') },
                p: { color: theme('colors.muted.foreground') },
              },
            },
          ],
        },
        base: {
          css: [
            {
              h1: { fontSize: '2.5rem' },
              h2: { fontSize: '1.25rem' },
            },
          ],
        },
        md: {
          css: [
            {
              h1: { fontSize: '3.5rem' },
              h2: { fontSize: '1.5rem' },
            },
          ],
        },
      }),
    },
  },
}

export default config
