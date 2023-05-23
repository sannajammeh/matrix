"use client";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { ComponentProps } from "@tw-classed/react";
import { forwardRef } from "react";
import { classed } from "./classed.config";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverPortal = PopoverPrimitive.Portal;

const ClassedPopoverContent = classed(
  PopoverPrimitive.Content,
  "z-50 rounded-md bg-popover shadow-md outline-none animate-in",
  "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
  {
    variants: {
      bordered: {
        true: "border border-radix-slate6",
      },
      space: {
        sm: "p-2",
        md: "p-4",
        lg: "p-6",
        none: "!p-0",
      },
    },
    defaultVariants: {
      space: "md",
    },
  }
);

const PopoverContent = forwardRef<
  HTMLDivElement,
  ComponentProps<typeof ClassedPopoverContent>
>((props, ref) => (
  <PopoverPortal>
    <ClassedPopoverContent ref={ref} {...props} />
  </PopoverPortal>
));

PopoverContent.displayName = ClassedPopoverContent.displayName;

export { Popover, PopoverTrigger, PopoverPortal, PopoverContent };
