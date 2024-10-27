import { defineConfig } from 'unocss/vite';
import { presetUno } from 'unocss';
import presetIcons from '@unocss/preset-icons';
import { presetKobalte } from 'unocss-preset-primitives';
import transformVariantGroup from '@unocss/transformer-variant-group';

export default defineConfig({
  shortcuts: [
    {
      'flex-center': 'flex items-center justify-center',
      'absolute-center': 'absolute top-50% left-50% -translate-50%',
      'absolute-x-center': 'absolute left-50% -translate-x-50%',
      'absolute-y-center': 'absolute top-50% -translate-y-50%',
    },
  ],
  rules: [
    [
      /^underline-position-(under|left|right|auto)$/,
      ([_, prop]) => ({
        'text-underline-position': prop,
      }),
    ],
  ],
  safelist: [
    ...['n', 'w', 's', 'e', 'nw', 'ne', 'sw', 'se'].map((v) => `cursor-${v}-resize`),
    ...['top', 'left', 'bottom', 'right'].flatMap((v) => [`${v}-4`, `-${v}-4`]),
  ],
  theme: {
    fontFamily: {
      sans: 'Inter, Tahoma, Geneva, Verdana, sans-serif',
    },
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      '3xl': '1920px',
      '4xl': '2560px',
    },
    colors: {
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',

      muted: 'hsl(var(--muted))',
      'muted-foreground': 'hsl(var(--muted-foreground))',

      popover: 'hsl(var(--popover))',
      'popover-foreground': 'hsl(var(--popover-foreground))',

      border: 'hsl(var(--border))',
      input: 'hsl(var(--input))',

      card: 'hsl(var(--card))',
      'card-foreground': 'hsl(var(--card-foreground))',

      primary: 'hsl(var(--primary))',
      'primary-foreground': 'hsl(var(--primary-foreground))',

      secondary: 'hsl(var(--secondary))',
      'secondary-foreground': 'hsl(var(--secondary-foreground))',

      accent: 'hsl(var(--accent))',
      'accent-foreground': 'hsl(var(--accent-foreground))',

      destructive: 'hsl(var(--destructive))',
      'destructive-foreground': 'hsl(var(--destructive-foreground))',

      info: 'hsl(var(--info))',
      'info-foreground': 'hsl(var(--info-foreground))',

      success: 'hsl(var(--success))',
      'success-foreground': 'hsl(var(--success-foreground))',

      warning: 'hsl(var(--warning))',
      'warning-foreground': 'hsl(var(--warning-foreground))',

      error: 'hsl(var(--error))',
      'error-foreground': 'hsl(var(--error-foreground))',

      ring: 'hsl(var(--ring))',

      radius: 'hsl(var(--radius))',
    },
  },
  variants: [
    (matcher) => {
      if (!matcher.startsWith('hocus:')) return matcher;
      return {
        // slice `hover:` prefix and passed to the next variants and rules
        matcher: matcher.slice(6),
        selector: (s) => `${s}:hover, ${s}:focus`,
      };
    },
  ],
  presets: [
    presetUno({
      dark: {
        dark: '[data-theme="dark"]',
        light: '[data-theme="light"]',
      },
    }),
    presetIcons({
      collections: {
        lucide: () => import('@iconify-json/lucide/icons.json').then((i) => i.default),
      },
    }),
    presetKobalte({}),
  ],
  transformers: [transformVariantGroup()],
});
