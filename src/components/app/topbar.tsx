"use client"

import Link from "next/link"
import {
  BellIcon,
  ChevronDownIcon,
  SearchIcon,
} from "lucide-react"

import type { AdminContext } from "@/lib/auth/user"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Topbar({ admin }: { admin: AdminContext }) {
  return (
    <header className="flex h-[76px] shrink-0 items-center justify-between gap-4 border-b border-[#edf0f5] bg-white px-6">
      <div className="flex min-w-0 flex-1 items-center gap-5">
        <div className="relative hidden w-full max-w-[420px] md:block">
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-[#6d7480]"
            strokeWidth={1.9}
          />
          <Input
            className="h-10 rounded-lg border-[#edf0f5] bg-[#f7f8fb] pr-12 pl-10 text-sm shadow-none placeholder:text-[#8c95a3] focus-visible:bg-white"
            placeholder="Search students, batches, phone numbers..."
          />
          <span className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded-md border border-[#e4e7ee] bg-white px-1.5 py-0.5 text-xs font-medium text-[#6d7480] lg:inline">
            ⌘ K
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-5">
        <Button
          className="relative size-12 rounded-full text-[#141821] hover:bg-primary/5 hover:text-primary [&_svg]:size-7"
          render={<Link href="/notifications" />}
          size="icon"
          variant="ghost"
        >
          <BellIcon strokeWidth={2.05} />
          <span className="absolute top-2 right-2 flex size-4.5 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold leading-none text-white ring-2 ring-white">
            3
          </span>
          <span className="sr-only">Notifications</span>
        </Button>

        <Avatar className="size-10">
          <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
            {profileInitials(admin.adminName)}
          </AvatarFallback>
        </Avatar>

        <div className="hidden min-w-0 text-left sm:block">
          <p className="truncate text-sm font-semibold text-[#141821]">
            {admin.adminName}
          </p>
          <p className="truncate text-xs font-normal text-[#6d7480]">Admin</p>
        </div>
        <ChevronDownIcon className="size-5 text-[#141821]" strokeWidth={1.9} />
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
