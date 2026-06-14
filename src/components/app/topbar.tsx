"use client"

import {
  BellIcon,
  ChevronDownIcon,
  LogOutIcon,
  SearchIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

import { signOut } from "@/lib/auth/actions"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import type { AdminContext } from "@/lib/auth/user"

export function Topbar({ admin }: { admin: AdminContext }) {
  const [accountOpen, setAccountOpen] = useState(false)
  const accountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!accountRef.current?.contains(event.target as Node)) {
        setAccountOpen(false)
      }
    }

    document.addEventListener("pointerdown", handlePointerDown)

    return () => document.removeEventListener("pointerdown", handlePointerDown)
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur">
      <SidebarTrigger className="-ml-1" />
      <Separator className="h-5" orientation="vertical" />

      <div className="relative max-w-sm flex-1">
        <SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="h-8 border-0 bg-muted/50 pl-8 text-sm shadow-none focus-visible:bg-background focus-visible:ring-1"
          placeholder="Search students, batches, phones..."
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <Button
          className="relative"
          render={<Link href="/notifications" />}
          size="icon-sm"
          variant="ghost"
        >
          <BellIcon className="size-4" />
          <Badge className="absolute -top-0.5 -right-0.5 size-4 justify-center p-0 text-[9px] leading-none">
            3
          </Badge>
          <span className="sr-only">Notifications</span>
        </Button>

        <Separator className="h-5" orientation="vertical" />

        <div className="relative" ref={accountRef}>
          <Button
            aria-expanded={accountOpen}
            className="h-8 gap-2 px-2"
            onClick={() => setAccountOpen((open) => !open)}
            type="button"
            variant="ghost"
          >
              <Avatar className="size-6">
                <AvatarFallback className="bg-primary text-[10px] font-semibold text-primary-foreground">
                  {profileInitials(admin.adminName)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:inline">
                {admin.adminName}
              </span>
              <ChevronDownIcon className="size-3 text-muted-foreground" />
          </Button>

          {accountOpen ? (
            <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10">
              <div className="px-1.5 py-1 font-normal">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{admin.adminName}</span>
                <span className="text-xs text-muted-foreground">
                  {admin.adminEmail}
                </span>
              </div>
              </div>
              <div className="-mx-1 my-1 h-px bg-border" />
              <Link
                className="relative flex items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground"
                href="/account/profile"
                onClick={() => setAccountOpen(false)}
              >
                <UserIcon className="size-4" />
                Profile
              </Link>
              <Link
                className="relative flex items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground"
                href="/account/settings"
                onClick={() => setAccountOpen(false)}
              >
                <SettingsIcon className="size-4" />
                Settings
              </Link>
              <div className="-mx-1 my-1 h-px bg-border" />
              <form action={signOut}>
                <button
                  className="relative flex w-full cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-sm text-destructive outline-hidden select-none hover:bg-destructive/10 focus:bg-destructive/10"
                  type="submit"
                >
                  <LogOutIcon className="size-4" />
                  Log out
                </button>
              </form>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}

function profileInitials(name: string) {
  const parts = name.split(" ").filter(Boolean)
  const first = parts[0]?.[0] ?? "A"
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : ""

  return `${first}${last}`.toUpperCase()
}
