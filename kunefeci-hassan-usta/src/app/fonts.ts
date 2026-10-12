import { Berkshire_Swash, Fraunces, Manrope } from "next/font/google";

export const berkshire = Berkshire_Swash({
  weight: "400",
  subsets: ["latin", "latin-ext"],
  variable: "--font-berkshire",
});

export const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  axes: ["SOFT", "opsz"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
});

export const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  variable: "--font-manrope",
});

export const fontVariables = `${berkshire.variable} ${fraunces.variable} ${manrope.variable}`;
