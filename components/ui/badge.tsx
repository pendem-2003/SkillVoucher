import * as React from "react"

import { cn } from "@/lib/utils"

const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: string }
>(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-105",
    secondary: "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105",
    success: "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl hover:scale-105",
    warning: "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg hover:shadow-xl hover:scale-105",
    danger: "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl hover:scale-105",
    outline: "border-2 border-blue-500 text-blue-700 bg-blue-50 hover:bg-blue-100 hover:scale-105",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200",
        variants[variant as keyof typeof variants] || variants.default,
        className
      )}
      {...props}
    />
  )
})
Badge.displayName = "Badge"

export { Badge }
