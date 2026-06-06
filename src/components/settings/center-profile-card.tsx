"use client"

import { Building2Icon, PencilIcon, SaveIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { updateTenantProfile } from "@/lib/actions/settings"

type CenterProfile = {
  address: string | null
  contact_phone: string | null
  email: string | null
  name: string
  secondary_phone: string | null
}

type CenterProfileCardProps = {
  tenant: CenterProfile
}

export function CenterProfileCard({ tenant }: CenterProfileCardProps) {
  const [open, setOpen] = useState(false)

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2Icon className="size-5 text-primary" />
          <CardTitle>Centre Profile</CardTitle>
        </div>
        <CardDescription>
          Contact details shown across the coaching workspace.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Detail label="Centre name" value={tenant.name} />
        <Detail label="Contact phone" value={tenant.contact_phone} />
        <Detail label="Secondary phone" value={tenant.secondary_phone} />
        <Detail label="Email" value={tenant.email} />
        <Detail label="Full address" value={tenant.address} multiline />

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={<Button className="mt-2 w-full" type="button" />}>
            <PencilIcon data-icon="inline-start" />
            Edit Centre Profile
          </SheetTrigger>
          <SheetContent className="w-full overflow-hidden p-0 data-[side=right]:!w-[92vw] data-[side=right]:!max-w-2xl">
            <form action={updateTenantProfile} className="flex min-h-0 flex-1 flex-col">
              <SheetHeader className="border-b px-6 py-5">
                <SheetTitle>Edit Centre Profile</SheetTitle>
                <SheetDescription>
                  Update the centre name, contact information, and full address.
                </SheetDescription>
              </SheetHeader>
              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="center-name">Centre name</FieldLabel>
                    <Input
                      defaultValue={tenant.name}
                      id="center-name"
                      name="name"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="center-contact-phone">Contact phone</FieldLabel>
                    <Input
                      defaultValue={tenant.contact_phone ?? ""}
                      id="center-contact-phone"
                      name="contact_phone"
                      type="tel"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="center-secondary-phone">
                      Secondary phone
                    </FieldLabel>
                    <Input
                      defaultValue={tenant.secondary_phone ?? ""}
                      id="center-secondary-phone"
                      name="secondary_phone"
                      type="tel"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="center-email">Email</FieldLabel>
                    <Input
                      defaultValue={tenant.email ?? ""}
                      id="center-email"
                      name="email"
                      type="email"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="center-address">Full address</FieldLabel>
                    <Textarea
                      defaultValue={tenant.address ?? ""}
                      id="center-address"
                      name="address"
                      rows={4}
                    />
                  </Field>
                </FieldGroup>
              </div>
              <SheetFooter className="border-t bg-muted/20 px-6 py-4 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <SaveIcon data-icon="inline-start" />
                  Save profile
                </Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      </CardContent>
    </Card>
  )
}

function Detail({
  label,
  multiline = false,
  value,
}: {
  label: string
  multiline?: boolean
  value: string | null
}) {
  return (
    <div>
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      <p
        className={`mt-0.5 text-sm text-foreground ${multiline ? "whitespace-pre-line" : ""}`}
      >
        {value || "Not configured"}
      </p>
    </div>
  )
}
