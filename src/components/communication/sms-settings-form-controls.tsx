"use client"

import { useRouter } from "next/navigation"
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useTransition,
  type ComponentProps,
  type RefObject,
  type ReactNode,
} from "react"
import { useFormStatus } from "react-dom"
import { Loader2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

type SmsSettingsAction = (formData: FormData) => void | Promise<void>

type DirtyFormContextValue = {
  autoSaveAction?: SmsSettingsAction
  dirty: boolean
  formRef: RefObject<HTMLFormElement | null>
  markClean: () => void
}

const DirtyFormContext = createContext<DirtyFormContextValue | null>(null)

export function DirtyForm({
  action,
  autoSaveAction,
  children,
  className,
}: {
  action: SmsSettingsAction
  autoSaveAction?: SmsSettingsAction
  children: ReactNode
  className?: string
}) {
  const formRef = useRef<HTMLFormElement>(null)
  const cleanSnapshotRef = useRef("")
  const [dirty, setDirty] = useState(false)

  function snapshot() {
    const form = formRef.current

    if (!form) {
      return ""
    }

    return Array.from(new FormData(form).entries())
      .map(([key, value]) => `${key}:${value instanceof File ? value.name : value}`)
      .sort()
      .join("|")
  }

  function markClean() {
    cleanSnapshotRef.current = snapshot()
    setDirty(false)
  }

  function compareSoon() {
    window.setTimeout(() => {
      const nextSnapshot = snapshot()

      setDirty(nextSnapshot !== cleanSnapshotRef.current)
    }, 0)
  }

  useEffect(() => {
    cleanSnapshotRef.current = snapshot()
  }, [])

  return (
    <DirtyFormContext.Provider
      value={{ autoSaveAction, dirty, formRef, markClean }}
    >
      <form
        action={action}
        className={className}
        onChangeCapture={compareSoon}
        onInputCapture={compareSoon}
        onPointerUpCapture={compareSoon}
        onSubmit={markClean}
        ref={formRef}
      >
        {children}
      </form>
    </DirtyFormContext.Provider>
  )
}

export function DirtySubmitButton({
  children,
  ...props
}: Omit<ComponentProps<typeof Button>, "disabled" | "type"> & {
  children: ReactNode
}) {
  const context = useDirtyFormContext()
  const { pending } = useFormStatus()

  return (
    <Button {...props} disabled={!context.dirty || pending} type="submit">
      {pending ? <Loader2Icon className="animate-spin" /> : null}
      {children}
    </Button>
  )
}

export function AutoSaveToggle({
  defaultChecked,
  name,
}: {
  defaultChecked: boolean
  name: string
}) {
  const context = useDirtyFormContext()
  const router = useRouter()
  const [checked, setChecked] = useState(defaultChecked)
  const [isPending, startTransition] = useTransition()

  function toggle() {
    const form = context.formRef.current
    const action = context.autoSaveAction
    const nextChecked = !checked

    if (!form || !action || isPending) {
      return
    }

    setChecked(nextChecked)

    const formData = new FormData(form)
    formData.set(name, nextChecked ? "on" : "off")

    startTransition(async () => {
      try {
        await action(formData)
        context.markClean()
        router.refresh()
        toast.success("SMS settings saved", {
          description: "The automation setting has been updated.",
          duration: 3200,
        })
      } catch (error) {
        setChecked(!nextChecked)
        toast.error("Could not save setting", {
          description:
            error instanceof Error
              ? error.message
              : "Please try updating this setting again.",
          duration: 4200,
        })
      }
    })
  }

  return (
    <>
      <input name={name} type="hidden" value={checked ? "on" : "off"} />
      <button
        aria-checked={checked}
        aria-label="Toggle SMS automation"
        className="relative inline-flex h-6 w-11 items-center rounded-full border border-border bg-muted transition-colors aria-checked:border-success/30 aria-checked:bg-success disabled:cursor-wait disabled:opacity-75"
        disabled={isPending}
        onClick={toggle}
        role="switch"
        type="button"
      >
        <span
          className={`ml-0.5 flex size-5 items-center justify-center rounded-full bg-background shadow-sm transition-transform ${
            checked ? "translate-x-5" : ""
          }`}
        >
          {isPending ? (
            <Loader2Icon className="size-3 animate-spin text-muted-foreground" />
          ) : null}
        </span>
      </button>
    </>
  )
}

function useDirtyFormContext() {
  const context = useContext(DirtyFormContext)

  if (!context) {
    throw new Error("Dirty form controls must be used inside DirtyForm.")
  }

  return context
}
