// src/components/kontakt/onDarkLink.ts
// Shared on-dark inline-link styling for the Kontakt dark card: gletscher text
// that brightens to papier on hover. The on-light counterpart used elsewhere is
// `text-vrelo-petrol underline underline-offset-2`.
export const darkLinkClass =
  "text-gletscher underline underline-offset-2 hover:text-papier transition-colors";

// On-light counterpart for the **amber** form cards: navy text (petrol fails AA
// on the saturated amber) that warms to petrol on hover.
export const lightLinkClass =
  "text-tiefes-wasser underline underline-offset-2 hover:text-vrelo-petrol transition-colors";
