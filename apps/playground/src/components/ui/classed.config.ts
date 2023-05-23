import { twMerge } from "tailwind-merge";
import { createClassed } from "@tw-classed/react";

export const { classed } = createClassed({
  merger: twMerge,
});

export const cn = (...args: (string | false | undefined)[]) => twMerge(...args);
