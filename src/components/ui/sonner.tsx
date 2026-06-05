"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import type { CSSProperties } from "react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      richColors
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          "--success-bg": "color-mix(in oklch, var(--primary) 10%, var(--popover))",
          "--success-border": "color-mix(in oklch, var(--primary) 28%, var(--border))",
          "--success-text": "var(--primary)",
          "--info-bg": "color-mix(in oklch, var(--chart-2) 12%, var(--popover))",
          "--info-border": "color-mix(in oklch, var(--chart-2) 28%, var(--border))",
          "--info-text": "var(--chart-2)",
          "--warning-bg": "color-mix(in oklch, var(--chart-3) 14%, var(--popover))",
          "--warning-border": "color-mix(in oklch, var(--chart-3) 36%, var(--border))",
          "--warning-text": "color-mix(in oklch, var(--chart-3) 70%, var(--foreground))",
          "--error-bg": "color-mix(in oklch, var(--destructive) 10%, var(--popover))",
          "--error-border": "color-mix(in oklch, var(--destructive) 30%, var(--border))",
          "--error-text": "var(--destructive)",
        } as CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
