import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{md,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#FBFAF7",
        ink: {
          DEFAULT: "#1C1C20",
          muted: "#5C5F66",
          soft: "#8A8C93",
        },
        rule: "#E8E2D5",
        accent: {
          DEFAULT: "#2F6B57",
          hover: "#1F4D3D",
          soft: "#E9F0EC",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "ui-serif", "Georgia", "serif"],
      },
      letterSpacing: {
        tightish: "-0.015em",
        label: "0.16em",
      },
      typography: () => ({
        DEFAULT: {
          css: {
            "--tw-prose-body": "#2A2A30",
            "--tw-prose-headings": "#1C1C20",
            "--tw-prose-links": "#2F6B57",
            "--tw-prose-bold": "#1C1C20",
            "--tw-prose-quotes": "#1C1C20",
            "--tw-prose-quote-borders": "#2F6B57",
            "--tw-prose-bullets": "#B8B2A4",
            "--tw-prose-hr": "#E8E2D5",
            fontSize: "1.0625rem",
            lineHeight: "1.78",
            a: {
              color: "#2F6B57",
              textDecorationThickness: "1px",
              textUnderlineOffset: "3px",
              fontWeight: "500",
              "&:hover": { color: "#1F4D3D" },
            },
            "h1, h2, h3, h4": {
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontWeight: "600",
              letterSpacing: "-0.015em",
            },
            "h2": { marginTop: "2.5em", marginBottom: "0.6em" },
            "h3": { marginTop: "2em", marginBottom: "0.5em" },
            blockquote: {
              fontStyle: "italic",
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontWeight: "400",
              borderLeftWidth: "2px",
              borderLeftColor: "#2F6B57",
              quotes: "none",
            },
            "blockquote p:first-of-type::before": { content: "none" },
            "blockquote p:last-of-type::after": { content: "none" },
            img: { borderRadius: "0.5rem" },
            code: { fontWeight: "500" },
            table: { fontSize: "0.95em" },
            "thead th": {
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontWeight: "600",
            },
          },
        },
      }),
    },
  },
  plugins: [typography],
};

export default config;
