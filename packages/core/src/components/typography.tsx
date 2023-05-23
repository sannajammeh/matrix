import { classed as core } from "@tw-classed/core";
import { classed } from "./classed.config";

const text = core({
  variants: {
    variant: {
      h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
      h2: "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0",
      h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
      h4: "scroll-m-20 text-xl font-semibold tracking-tight",
      base: "leading-7 [&:not(:first-child)]:mt-6",
      quote: "mt-6 border-l-2 pl-6 italic",
    },
    size: {
      lg: "text-lg font-semibold",
      sm: "text-sm font-medium leading-none",
    },
  },
});

export type TextType = typeof text & {
  h1: string;
  h2: string;
  h3: string;
  h4: string;
  base: string;
  quote: string;
  lg: string;
  sm: string;
};

Object.assign(text, {
  h1: text({ variant: "h1" }),
  h2: text({ variant: "h2" }),
  h3: text({ variant: "h3" }),
  h4: text({ variant: "h4" }),
  base: text({ variant: "base" }),
  quote: text({ variant: "quote" }),
  lg: text({ size: "lg" }),
  sm: text({ size: "sm" }),
});

const _text = text as TextType;

export { _text as text };
export const Text = classed.span(text);
