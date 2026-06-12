"use client"

import { ArchiveIcon } from "lucide-react"
import type { ReactElement, ReactNode } from "react"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ArchiveConfirmDialogProps = {
  action: (formData: FormData) => void | Promise<void>
  confirmLabel?: string
  confirmVariant?: "archive" | "destructive"
  description: string
  itemName: string
  returnPath?: string
  title?: string
  trigger?: ReactElement
  triggerIcon?: ReactNode
  triggerLabel?: string
  triggerSize?: "default" | "icon-sm"
}

export function ArchiveConfirmDialog({
  action,
  confirmLabel,
  confirmVariant = "archive",
  description,
  itemName,
  returnPath,
  title = "Archive this item?",
  trigger,
  triggerIcon,
  triggerLabel = "Archive",
  triggerSize = "default",
}: ArchiveConfirmDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          trigger ?? (
            <Button
              className={triggerSize === "icon-sm" ? "size-7 cursor-pointer" : undefined}
              type="button"
              variant={triggerSize === "icon-sm" ? "ghost" : "outline"}
              size={triggerSize}
            />
          )
        }
      >
        {triggerIcon ?? (
          <ArchiveIcon
            data-icon={triggerSize === "icon-sm" ? undefined : "inline-start"}
          />
        )}
        <span className={triggerSize === "icon-sm" ? "sr-only" : undefined}>
          {triggerLabel}
        </span>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form action={action}>
          {returnPath ? (
            <input name="return_path" type="hidden" value={returnPath} />
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel render={<Button type="button" variant="outline" />}>
              Cancel
            </AlertDialogCancel>
            <Button
              className={cn(
                "text-white",
                confirmVariant === "destructive"
                  ? "border-red-600 bg-red-600 hover:bg-red-700"
                  : "border-slate-700 bg-slate-900 hover:bg-slate-800"
              )}
              type="submit"
            >
              {confirmLabel ?? `Archive ${itemName}`}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
