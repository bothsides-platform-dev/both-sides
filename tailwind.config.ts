import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sideA: {
          DEFAULT: "hsl(var(--side-a))",
          foreground: "hsl(var(--side-a-foreground))",
        },
        sideB: {
          DEFAULT: "hsl(var(--side-b))",
          foreground: "hsl(var(--side-b-foreground))",
        },
        disabled: {
          DEFAULT: "hsl(var(--disabled))",
          subtle: "hsl(var(--disabled-subtle))",
        },
      },
      fontSize: {
        '2xs': ['0.75rem', { lineHeight: '1rem' }],
        'caption': ['0.75rem', { lineHeight: '1rem' }],
        'body-compact': ['0.875rem', { lineHeight: '1.25rem' }],
        'heading-01': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '600' }],
        'heading-02': ['1rem', { lineHeight: '1.5rem', fontWeight: '600' }],
        'heading-03': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],
        'heading-04': ['1.75rem', { lineHeight: '2.25rem', fontWeight: '600' }],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "var(--radius)",
        sm: "calc(var(--radius) - 4px)",
      },
      transitionDuration: {
        fast: "var(--duration-fast)",
        moderate: "var(--duration-moderate)",
        slow: "var(--duration-slow)",
      },
      transitionTimingFunction: {
        standard: "var(--easing-standard)",
        entrance: "var(--easing-entrance)",
        exit: "var(--easing-exit)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
