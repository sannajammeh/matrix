import { cn } from "./classed.config";

export const Loading = ({
  className,
  ...props
}: React.HTMLProps<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn("flex items-center justify-center space-x-2", className)}
    >
      <span className="w-1 h-1 bg-slate-400  group-data-[style=dark]:bg-white rounded-full animate-pulse"></span>
      <span className="w-1 h-1 bg-slate-400 group-data-[style=dark]:bg-white rounded-full animate-pulse [animation-delay:0.2ms]"></span>
      <span className="w-1 h-1 bg-slate-400 group-data-[style=dark]:bg-white rounded-full animate-pulse [animation-delay:0.2ms]"></span>
    </span>
  );
};
