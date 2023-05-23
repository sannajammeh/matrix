import { classed } from "./classed.config";

export const Input = classed.input(
  "flex h-10 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50    ",
  "focus-visible:outline-radix-blue8"
);

export const TextArea = classed.textarea(Input, "block", "h-auto");

export const NativeSelect = classed.select(Input);
