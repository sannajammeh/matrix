import { classed } from "./classed.config";

export const Separator = classed.span(
  "w-full flex items-center gap-2",
  "before:h-[1px] before:w-full before:bg-radix-slate6",
  "after:h-[1px] after:w-full after:bg-radix-slate6"
);
