"use client";

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { classed } from "./classed.config";

export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
export const AlertDialog = AlertDialogPrimitive.Root;
export const AlertDialogPortal = AlertDialogPrimitive.Portal;

export const AlertDialogOverlay = classed(
  AlertDialogPrimitive.Overlay,
  "bg-blackA9 data-[state=open]:animate-fadeIn fixed inset-0"
);

export const AlertDialogContent = classed(
  AlertDialogPrimitive.Content,
  "data-[state=open]:animate-fadeInUpScale fixed inset-0 m-auto",
  "max-h-[85vh] w-[90vw] max-w-[450px] rounded-md bg-radix-slate3 p-6",
  "shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none"
);

export const AlertDialogTitle = classed(
  AlertDialogPrimitive.Title,
  "text-radix-slate12 m-0 text-[17px] font-medium"
);

export const AlertDialogDescription = classed(
  AlertDialogPrimitive.Description,
  "text-radix-slate11 mt-2 mb-5 text-[15px] leading-normal"
);

export const AlertDialogAction = AlertDialogPrimitive.Action;
export const AlertDialogClose = AlertDialogPrimitive.Cancel;
