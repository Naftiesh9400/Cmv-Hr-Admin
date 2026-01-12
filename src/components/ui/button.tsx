import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg hover:-translate-y-0.5",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        gradient: "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:opacity-90",
        hero: "bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(174,72%,40%)] text-white shadow-lg hover:shadow-xl hover:-translate-y-1 font-semibold",
        "hero-outline": "border-2 border-white/30 text-white bg-transparent hover:bg-white/10 font-semibold backdrop-blur-sm",
        success: "bg-[hsl(142,76%,36%)] text-white hover:bg-[hsl(142,76%,30%)] shadow-md",
        warning: "bg-[hsl(38,92%,50%)] text-white hover:bg-[hsl(38,92%,44%)] shadow-md",
        glass: "bg-white/10 text-white backdrop-blur-xl border border-white/20 hover:bg-white/20",
        "clock-in": "bg-gradient-to-r from-[hsl(142,76%,36%)] to-emerald-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 font-semibold",
        "clock-out": "bg-gradient-to-r from-[hsl(25,95%,53%)] to-orange-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 font-semibold",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-lg px-8",
        xl: "h-12 rounded-xl px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
