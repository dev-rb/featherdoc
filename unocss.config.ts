import { defineConfig } from "unocss/vite";
import { presetUno } from "unocss";
import presetIcons from "@unocss/preset-icons";
import { presetKobalte } from "unocss-preset-primitives";
import transformVariantGroup from "@unocss/transformer-variant-group";

export default defineConfig({
  shortcuts: [
    {
      "flex-center": "flex items-center justify-center",
      "absolute-center": "absolute top-50% left-50% -translate-50%",
      "absolute-x-center": "absolute left-50% -translate-x-50%",
      "absolute-y-center": "absolute top-50% -translate-y-50%",
    },
  ],
  rules: [
    [
      /^underline-position-(under|left|right|auto)$/,
      ([_, prop]) => ({
        "text-underline-position": prop,
      }),
    ],
  ],
  safelist: [
    ...["n", "w", "s", "e", "nw", "ne", "sw", "se"].map(
      (v) => `cursor-${v}-resize`,
    ),
    ...["top", "left", "bottom", "right"].flatMap((v) => [`${v}-4`, `-${v}-4`]),
  ],
  theme: {
    fontFamily: {
      sans: "Inter, Tahoma, Geneva, Verdana, sans-serif",
    },
    breakpoints: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      "3xl": "1920px",
      "4xl": "2560px",
    },
    colors: {
      dark: {
        "1": "#BEBEBE",
        "2": "#AAAAAA",
        "3": "#969696",
        "4": "#818181",
        "5": "#6D6D6D",
        "6": "#585858",
        "7": "#444444",
        "8": "#303030",
        "9": "#1B1B1B",
        "50": "#C9C9C9",
        "100": "#BEBEBE",
        "200": "#AAAAAA",
        "300": "#969696",
        "400": "#818181",
        "500": "#6D6D6D",
        "600": "#585858",
        "700": "#444444",
        "800": "#303030",
        "900": "#1B1B1B",
        "950": "#111111",
      },
      // dark: {
      //   '50': '#f6f6f6',
      //   '1': '#e7e7e7',
      //   '2': '#d1d1d1',
      //   '3': '#b0b0b0',
      //   '4': '#888888',
      //   '5': '#6d6d6d',
      //   '6': '#5d5d5d',
      //   '7': '#4f4f4f',
      //   '8': '#454545',
      //   '9': '#3d3d3d',
      //   '100': '#e7e7e7',
      //   '200': '#d1d1d1',
      //   '300': '#b0b0b0',
      //   '400': '#888888',
      //   '500': '#6d6d6d',
      //   '600': '#5d5d5d',
      //   '700': '#4f4f4f',
      //   '800': '#454545',
      //   '900': '#3d3d3d',
      //   '950': '#111111',
      // },
    },
  },
  variants: [
    (matcher) => {
      if (!matcher.startsWith("hocus:")) return matcher;
      return {
        // slice `hover:` prefix and passed to the next variants and rules
        matcher: matcher.slice(6),
        selector: (s) => `${s}:hover, ${s}:focus`,
      };
    },
  ],
  presets: [presetUno(), presetIcons({}), presetKobalte({})],
  transformers: [transformVariantGroup()],
});
