import { classed } from "./classed.config";

export const Card = classed.div("grid border transition-all", {
  variants: {
    size: {
      md: "rounded-md",
    },
    hoverable: {
      true: "hover:border-slate-950",
    },
  },

  defaultVariants: {
    size: "md",
  },
});

export const CardContent = classed.div({
  base: "",
  variants: {
    size: {
      md: "p-4",
    },
  },
  defaultVariants: {
    size: "md",
  },
});
