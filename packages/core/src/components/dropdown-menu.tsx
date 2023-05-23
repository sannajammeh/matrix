"use client";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { classed } from "./classed.config";
import { ComponentProps, deriveClassed } from "@tw-classed/react";
import { forwardRef } from "react";

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

const ClassedDropdownMenuContent = classed(
  DropdownMenuPrimitive.Content,
  "z-50 rounded-md bg-popover shadow-md outline-none min-w-[8rem]",
  "will-change-[opacity,transform]",
  "data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade",
  {
    variants: {
      bordered: {
        true: "border border-radix-slate6",
      },
      space: {
        none: "p-0",
        xs: "p-1",
        sm: "p-2",
        md: "p-4",
      },
    },
  }
);

export const DropdownMenuContent = forwardRef<
  HTMLDivElement,
  ComponentProps<typeof ClassedDropdownMenuContent>
>((props, ref) => (
  <DropdownMenuPortal>
    <ClassedDropdownMenuContent {...props} ref={ref} />
  </DropdownMenuPortal>
));

DropdownMenuContent.displayName = ClassedDropdownMenuContent.displayName;

export const DropdownMenuItem = classed(
  DropdownMenuPrimitive.Item,
  "relative flex items-center cursor-default select-none",
  "px-2 py-1.5 text-sm leading-none rounded outline-none",
  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  "data-[highlighted]:bg-radix-slate4 focus:bg-radix-slate4",
  "will-change-[background-color] transition-colors",
  {
    variants: {
      inset: {
        true: "pl-8",
      },
    },
  }
);
