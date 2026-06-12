"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

type TeacherNotesFormProps = {
  action: (formData: FormData) => void | Promise<void>
  notes: string | null
}

export function TeacherNotesForm({ action, notes }: TeacherNotesFormProps) {
  const initialNotes = notes ?? ""
  const [value, setValue] = useState(initialNotes)
  const isDirty = value !== initialNotes

  return (
    <form action={action}>
      <Textarea
        className="min-h-[80px] resize-none text-sm"
        name="notes"
        onChange={(event) => setValue(event.currentTarget.value)}
        placeholder="Add notes about this teacher..."
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
