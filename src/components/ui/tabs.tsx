"use client"

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import * as React from "react"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

function TabsList({
  className,
  variant = "line",
  ...props
}: TabsPrimitive.List.Props & { variant?: "line" | "default" }) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(
        "group/tabs-list inline-flex h-9 items-center gap-1 rounded-lg bg-muted p-1 text-muted-foreground data-[variant=line]:h-auto data-[variant=line]:w-full data-[variant=line]:justify-between data-[variant=line]:gap-0 data-[variant=line]:rounded-none data-[variant=line]:border-b data-[variant=line]:bg-transparent data-[variant=line]:p-0",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex h-7 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-background data-[active]:text-foreground data-[active]:shadow-sm group-data-[variant=line]/tabs-list:relative group-data-[variant=line]/tabs-list:h-10 group-data-[variant=line]/tabs-list:flex-1 group-data-[variant=line]/tabs-list:rounded-none group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:px-4 group-data-[variant=line]/tabs-list:text-muted-foreground group-data-[variant=line]/tabs-list:shadow-none group-data-[variant=line]/tabs-list:after:absolute group-data-[variant=line]/tabs-list:after:inset-x-0 group-data-[variant=line]/tabs-list:after:bottom-[-1px] group-data-[variant=line]/tabs-list:after:h-0.5 group-data-[variant=line]/tabs-list:after:bg-transparent group-data-[variant=line]/tabs-list:data-[active]:font-semibold group-data-[variant=line]/tabs-list:data-[active]:text-foreground group-data-[variant=line]/tabs-list:data-[active]:after:bg-primary",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("mt-4 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsContent, TabsList, TabsTrigger }
