"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

type StudentNotesFormProps = {
  action: (formData: FormData) => void | Promise<void>
  notes: string | null
}

export function StudentNotesForm({ action, notes }: StudentNotesFormProps) {
  const initialNotes = notes ?? ""
  const [value, setValue] = useState(initialNotes)
  const isDirty = value !== initialNotes

  return (
    <form action={action}>
      <Textarea
        className="min-h-[80px] resize-none text-sm"
        name="notes"
        onChange={(event) => setValue(event.currentTarget.value)}
        placeholder="Add notes about this student..."
        value={value}
      />
      <div className="mt-2 flex justify-end">
        <Button disabled={!isDirty} size="sm" type="submit" variant="outline">
          Save Note
        </Button>
      </div>
    </form>
  )
}
