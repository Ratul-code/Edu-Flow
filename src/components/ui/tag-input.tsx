"use client"

import * as React from "react"
import { useState, useRef } from "react"
import { XIcon } from "lucide-react"

type TagInputProps = {
  defaultTags?: string[]
  placeholder?: string
  name?: string
}

export function TagInput({
  defaultTags = [],
  placeholder = "Type and press Space to add tags...",
  name = "tags",
}: TagInputProps) {
  const [tags, setTags] = useState<string[]>(defaultTags)
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Check for Space or Enter keys
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault()
      const trimmed = inputValue.trim()

      if (trimmed && !tags.includes(trimmed)) {
        setTags([...tags, trimmed])
      }
      setInputValue("")
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      // Remove last tag on Backspace if input is empty
      e.preventDefault()
      setTags(tags.slice(0, -1))
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  // Auto-focus input when clicking container
  const handleContainerClick = () => {
    inputRef.current?.focus()
  }

  return (
    <div className="flex flex-col gap-1">
      {/* Hidden input that submits tag data as comma-separated string */}
      <input type="hidden" name={name} value={tags.join(",")} />

      <div
        onClick={handleContainerClick}
        className="flex flex-wrap gap-2 items-center min-h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1.5 text-sm transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 cursor-text"
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 bg-muted/60 text-foreground text-xs font-medium px-2 py-0.5 rounded border border-muted-foreground/15 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleRemoveTag(tag)
              }}
              className="text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 rounded-xs p-0.5 transition-colors"
            >
              <XIcon className="size-3" />
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] bg-transparent border-0 outline-none text-sm p-0 focus:ring-0"
        />
      </div>
    </div>
  )
}
