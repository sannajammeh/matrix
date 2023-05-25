import { Inter } from "next/font/google";
import React from "react";
import { Button, Card, CardContent, classed, cn } from "@n5/core";
import Balancer from "react-wrap-balancer";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import classes from "./home.module.css";

const inter = Inter({
  variable: "--inter-font",
  subsets: ["latin"],
});

const Slot = ({ children }: React.PropsWithChildren<{}>) => {
  return (
    <>
      <div className="border-r border-dotted"></div>
      {children}
      <div className="border-l border-dotted"></div>
    </>
  );
};

const Separator = classed.span("col-span-3 border-t border-dotted");

const HomePage = () => {
  return (
    <div className={cn(inter.className, "container mx-auto")}>
      <section className="hero-grid mt-32 relative">
        <span className="w-16 h-16 rounded-full bg-transparent border border-dotted absolute top-[48px] left-[-12px] flex place-items-center justify-center">
          <span className="w-6 h-[1px] border-b border-dotted" />
          <span className="w-[1px] h-6 border-l border-dotted absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </span>

        <span className="col-span-3 grid grid-cols-3 h-[40px]">
          <span className="border-r border-dotted"></span>
          <span className="border-r border-dotted"></span>
          <span className=""></span>
        </span>
        <Slot>
          <div className="py-2">
            <h1 className="text-6xl font-extrabold text-center gradient-text">
              <Balancer>The React SaaS UI Library</Balancer>
            </h1>
          </div>
        </Slot>

        <Separator />

        <Slot>
          <div className="p-4 py-6">
            <p className="text-center text-lg">
              <Balancer>
                Used by some of the world's largest companies, Next.js enables
                you to create full-stack Web applications by extending the
                latest React features, and integrating powerful Rust-based
                JavaScript tooling for the fastest builds.
              </Balancer>
            </p>
          </div>
        </Slot>
        <Separator />
        <Slot>
          <div className="grid grid-cols-3">
            <div className="border-r border-dotted aspect-video"></div>
            <div className="border-r border-dotted aspect-video flex justify-center items-center gap-3">
              <Button>Get Started</Button>
              <Button icon={<ChevronDownIcon />} variant="outline">
                See why
              </Button>
            </div>
            <div className="aspect-video"></div>
          </div>
        </Slot>
        <Separator />
        <Slot>
          <div className="grid grid-cols-3 h-[60px]">
            <div className="border-r border-dotted"></div>
            <div className="border-r border-dotted"></div>
            <div className=""></div>
          </div>
        </Slot>
        <span className="w-16 h-16 rounded-full bg-transparent border border-dotted absolute bottom-[-6px] right-[-6px] flex place-items-center justify-center">
          <span className="w-6 h-[1px] border-b border-dotted" />
          <span className="w-[1px] h-6 border-l border-dotted absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </span>
      </section>
      <section className="h-screen">
        <h2 className="text-4xl font-extrabold text-center mt-32 gradient-text mb-6">
          <Balancer>Easily build out your next SaaS product</Balancer>
        </h2>

        <div className="grid grid-cols-3 gap-12">
          <div>
            <Card as="article" hoverable>
              <div
                className={cn(
                  "aspect-video grid place-items-center",
                  classes.gridBackground
                )}
              >
                <svg
                  viewBox="0 0 200 200"
                  width="80%"
                  height="80%"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="#FF0066"
                    d="M44.5,-35.1C57.3,-19.5,66.8,-1.1,65.2,18.4C63.6,37.9,50.8,58.4,32.3,67.6C13.7,76.8,-10.6,74.7,-27.2,63.9C-43.7,53,-52.5,33.5,-55.7,14.2C-59,-5.1,-56.6,-24.2,-46.4,-39.1C-36.2,-54.1,-18.1,-64.8,-1.1,-64C15.9,-63.1,31.8,-50.6,44.5,-35.1Z"
                    transform="translate(100 100)"
                  />
                </svg>
              </div>
              <CardContent>
                <h3 className="text-lg font-bold">Built in Optimizations</h3>
                <p className="text-sm dark:text-slate-400 text-slate-700">
                  Next.js automatically optimizes your application for the best
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
