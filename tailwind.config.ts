import type { Config } from "tailwindcss"

const config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    backgroundImage: {
      "radial-gradient": "radial-gradient(circle at 50% 40%, white, black)",
    },
    extend: {
      colors: {
        themeBlack: "var(--color-themeBlack)",
        themeGray: "var(--color-themeGray)",
        themeDarkGray: "var(--color-themeDarkGray)",
        themeTextGray: "var(--color-themeTextGray)",
        themeTextWhite: "var(--color-themeTextWhite)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          black: "var(--brand-black)",
          gray: "var(--brand-gray)",
          "dark-gray": "var(--brand-dark-gray)",
          "text-gray": "var(--brand-text-gray)",
          "text-white": "var(--brand-text-white)",
          primary: "var(--brand-primary)",
          "primary-hover": "var(--brand-primary-hover)",
          "card-bg": "var(--brand-card-bg)",
          "card-elevated": "var(--brand-card-elevated)",
          accent: "var(--brand-accent)",
          // New scientific palette colors
          "bg-base": "var(--brand-bg-base)",
          "bg-elevated": "var(--brand-bg-elevated)",
          "bg-subtle": "var(--brand-bg-subtle)",
          navy: "var(--brand-navy)",
          "navy-light": "var(--brand-navy-light)",
          slate: "var(--brand-slate)",
          emerald: "var(--brand-emerald)",
          "emerald-hover": "var(--brand-emerald-hover)",
          amber: "var(--brand-amber)",
          "amber-hover": "var(--brand-amber-hover)",
          "text-primary": "var(--brand-text-primary)",
          "text-secondary": "var(--brand-text-secondary)",
          "text-muted": "var(--brand-text-muted)",
          border: "var(--brand-border)",
          "border-strong": "var(--brand-border-strong)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
} satisfies Config

export default config
