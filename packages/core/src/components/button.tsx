import { ComponentProps, deriveClassed } from "@tw-classed/react";
import { classed, cn } from "./classed.config";
import { Loading } from "./loading";

const layout = "inline-flex items-center justify-center";

export const ButtonBase = classed.button(
  layout,
  "rounded-md text-sm font-medium transition-all ring-offset-background relative",
  "hover:-translate-y-[1px]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  "active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-slate-900 text-white hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-950 dark:hover:bg-slate-100",
        blue: "bg-radix-blue9 text-white",
        outline:
          "bg-transparent text-gray-600 border border-gray-400 hover:border-gray-950 hover:text-gray-950 dark:text-gray-300 dark:hover:border-gray-50",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const ButtonInner = classed.span(layout, "space-x-2");

export interface ButtonProps extends ComponentProps<typeof ButtonBase> {
  icon?: React.ReactNode;
  loading?: boolean;
}

export const Button = deriveClassed<typeof ButtonBase, ButtonProps>(
  ({ children, className, loading, icon, ...props }, ref) => {
    return (
      <ButtonBase
        className={cn("group", className)}
        data-style="dark"
        {...props}
        disabled={loading}
        ref={ref}
      >
        <ButtonInner className={cn(loading && "invisible")}>
          {icon} {children}
        </ButtonInner>
        {loading && (
          <Loading className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2" />
        )}
      </ButtonBase>
    );
  }
);
