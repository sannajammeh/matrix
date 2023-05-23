"use client";

import {
  PropsWithChildren,
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { classed } from "./classed.config";

const TabsItemBase = classed(
  "div",
  "border-b border-transparent w-max px-4 py-3 hover:border-radix-slate6 transition-all cursor-default relative z-10",
  {
    variants: {
      active: {
        true: "!border-radix-blue9 font-medium",
      },
    },
  }
);

const TabsContext = createContext<{
  hoveredId: string | null;
  setHoveredId: (id: string) => void;
}>({
  hoveredId: null,
  setHoveredId: null!,
});

const Tabs = ({ children }: PropsWithChildren<{}>) => {
  const [visible, setVisible] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const trackRef = useRef<HTMLSpanElement>(null!);
  const containerRef = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    const track = trackRef.current;
    const container = containerRef.current;

    const containerStyle = container.getBoundingClientRect();
    const containerLeft = containerStyle.left;

    if (!visible) {
      track.style.opacity = "0";
      track.style.pointerEvents = "none";
      return;
    }

    const item = document.querySelector(`[data-id="${hoveredId}"]`);
    if (!item) return;

    const itemStyle = item.getBoundingClientRect();
    track.style.width = `${itemStyle.width}px`;
    track.style.height = `1.8em`;
    track.style.left = `${itemStyle.left - containerLeft}px`;
    track.style.opacity = "1";
  }, [hoveredId, visible]);

  return (
    <TabsContext.Provider
      value={{
        hoveredId,
        setHoveredId,
      }}
    >
      <nav
        ref={containerRef}
        onMouseOver={() => setVisible(true)}
        onMouseOut={() => {
          setVisible(false);
          setHoveredId(null);
        }}
        className="flex items-center relative"
      >
        <span
          ref={trackRef}
          aria-hidden
          className="absolute top-1/2 -translate-y-1/2 bg-radix-slateA5 rounded-md w-12 h-4 pointer-events-none transition-all opacity-0 ease-in"
        ></span>
        {children}
      </nav>
    </TabsContext.Provider>
  );
};

const TabsItem = forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof TabsItemBase>
>(({ children }, ref) => {
  const { setHoveredId } = useContext(TabsContext);
  const id = useId();

  return (
    <TabsItemBase ref={ref} data-id={id} onMouseOver={() => setHoveredId(id)}>
      {children}
    </TabsItemBase>
  );
});

TabsItem.displayName = TabsItemBase.displayName ?? "TabsItem";

export { Tabs, TabsItem, TabsContext, TabsItemBase };
