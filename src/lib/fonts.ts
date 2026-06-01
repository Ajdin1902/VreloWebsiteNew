// next/font downloads and self-hosts these at build time — no external font requests at runtime.
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";

export const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

export const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "900"],
  style: ["italic", "normal"],
  variable: "--font-fraunces",
  display: "swap",
});
