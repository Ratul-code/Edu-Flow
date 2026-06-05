"use client"

import { ArchiveIcon } from "lucide-react"
import type { ReactElement } from "react"

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

type ArchiveConfirmDialogProps = {
  action: (formData: FormData) => void | Promise<void>
  description: string
  itemName: string
  returnPath?: string
  title?: string
  trigger?: ReactElement
  triggerLabel?: string
  triggerSize?: "default" | "icon-sm"
}

export function ArchiveConfirmDialog({
  action,
  description,
  itemName,
  returnPath,
  title = "Archive this item?",
  trigger,
  triggerLabel = "Archive",
  triggerSize = "default",
}: ArchiveConfirmDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          trigger ?? (
            <Button
              type="button"
              variant={triggerSize === "icon-sm" ? "ghost" : "outline"}
              size={triggerSize}
            />
          )
        }
      >
        <ArchiveIcon data-icon={triggerSize === "icon-sm" ? undefined : "inline-start"} />
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
              className="border-slate-700 bg-slate-900 text-white hover:bg-slate-800"
              type="submit"
            >
              Archive {itemName}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
