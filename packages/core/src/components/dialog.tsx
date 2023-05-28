"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { classed } from "./classed.config";

export const DialogTrigger = DialogPrimitive.Trigger;
export const Dialog = DialogPrimitive.Root;

export const DialogPortal = DialogPrimitive.Portal;

export const DialogOverlay = classed(
  DialogPrimitive.Overlay,
  "bg-blackA9 data-[state=open]:animate-fadeIn fixed inset-0"
);

export const DialogContent = classed(
  DialogPrimitive.Content,
  "data-[state=open]:animate-fadeInUpScale fixed inset-0 m-auto",
  "max-h-[85vh] w-[90vw] max-w-[450px] rounded-md bg-radix-slate3 p-6",
  "shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none"
);

export const DialogTitle = classed(
  DialogPrimitive.Title,
  "text-radix-slate12 m-0 text-[17px] font-medium"
);

export const DialogDescription = classed(
  DialogPrimitive.Description,
  "text-radix-slate11 mt-2 mb-5 text-[15px] leading-normal"
);
