"use client"

import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type CreateRecordDialogProps = {
  label: string
  moduleName: string
}

export function CreateRecordDialog({
  label,
  moduleName,
}: CreateRecordDialogProps) {
  return (
    <Dialog>
      <DialogTrigger render={<Button />}>
        <PlusIcon data-icon="inline-start" />
        {label}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
          <DialogDescription>
            This modal is wired for the shared create/edit pattern. The real
            save action will be connected when this module gets CRUD.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor={`${moduleName}-name`}>Name</FieldLabel>
            <Input
              id={`${moduleName}-name`}
              placeholder={`New ${moduleName.toLowerCase()} name`}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${moduleName}-note`}>Note</FieldLabel>
            <Input id={`${moduleName}-note`} placeholder="Optional note" />
          </Field>
        </FieldGroup>
        <DialogFooter showCloseButton>
          <Button disabled>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
