import * as LabelPrimitive from "@radix-ui/react-label";
import { classed } from "./classed.config";

export const Label = classed(
  LabelPrimitive.Root,
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 inline-flex flex-col gap-1",
  {
    variants: {
      block: {
        true: "!block",
      },
    },
  }
);
