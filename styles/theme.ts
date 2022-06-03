// 1. Import the extendTheme function
import { extendTheme } from "@chakra-ui/react";

// 2. Extend the theme to include custom colors, fonts, etc
const colors = {
  brand: {
    50: "#fbe3ff",
    100: "#eab2ff",
    200: "#da7fff",
    300: "#ca4cff",
    400: "#ba1aff",
    500: "#a100e6",
    600: "#7d00b4",
    700: "#590082",
    800: "#370050",
    900: "#15001f",
  },
  zinc: {
    50: "#FAFAFA",
    100: "#F4F4F5",
    200: "#E4E4E7",
    300: "#D4D4D8",
    400: "#A1A1AA",
    500: "#71717A",
    600: "#52525B",
    700: "#3F3F46",
    800: "#27272A",
    900: "#18181B",
  },
};

export const theme = extendTheme({ colors });
