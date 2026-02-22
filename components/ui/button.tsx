import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold ring-offset-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 text-white shadow-2xl shadow-blue-500/50 hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-[1.05] active:scale-95",
        destructive:
          "bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-2xl shadow-red-500/50 hover:shadow-2xl hover:shadow-pink-500/50 hover:scale-[1.05] active:scale-95",
        outline:
          "border-3 border-blue-600 bg-white text-blue-700 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-transparent hover:scale-[1.05] shadow-lg",
        secondary:
          "bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 text-white shadow-2xl shadow-purple-500/50 hover:shadow-2xl hover:shadow-pink-500/50 hover:scale-[1.05] active:scale-95",
        ghost: "hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 hover:text-blue-900",
        link: "text-blue-600 underline-offset-4 hover:underline hover:text-purple-600",
        success: "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-2xl shadow-green-500/50 hover:shadow-2xl hover:shadow-emerald-500/50 hover:scale-[1.05] active:scale-95",
      },
      size: {
        default: "h-12 px-8 py-3 text-base",
        sm: "h-10 rounded-xl px-5 py-2",
        lg: "h-14 rounded-xl px-10 py-4 text-lg",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
