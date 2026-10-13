import { Berkshire_Swash, Manrope } from "next/font/google";
import localFont from "next/font/local";

export const berkshire = Berkshire_Swash({
  weight: "400",
  subsets: ["latin", "latin-ext"],
  variable: "--font-berkshire",
});

/**
 * Headings. Only what the site uses (Latin and Turkish letters, the soft cut built in): upright in weights
 * 300–700, italic only in the one weight it is set in ("Hoş geldiniz.", the table card), ~117 KB for both
 * instead of four files of ~500 KB from Google, the biggest part of the first visit. See fonts/README.md.
 */
export const fraunces = localFont({
  src: [
    { path: "./fonts/fraunces.woff2", weight: "300 700", style: "normal" },
    { path: "./fonts/fraunces-italic.woff2", weight: "500", style: "italic" },
  ],
  variable: "--font-fraunces",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

export const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  variable: "--font-manrope",
});

export const fontVariables = `${berkshire.variable} ${fraunces.variable} ${manrope.variable}`;
