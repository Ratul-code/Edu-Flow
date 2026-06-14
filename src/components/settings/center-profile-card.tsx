import { Building2Icon, SaveIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { updateTenantProfile } from "@/lib/actions/settings"

type CenterProfile = {
  address: string | null
  contact_phone: string | null
  email: string | null
  logo_url: string | null
  name: string
  secondary_phone: string | null
}

type CenterProfileCardProps = {
  tenant: CenterProfile
}

export function CenterProfileCard({ tenant }: CenterProfileCardProps) {
  return (
    <form action={updateTenantProfile} encType="multipart/form-data">
      <Card className="gap-4 py-5">
        <CardHeader className="px-5 pb-0 pt-0">
          <div className="flex items-center gap-2">
            <Building2Icon className="size-4 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold">Center Profile</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-5 pt-2">
          <div className="flex items-center gap-4">
            {tenant.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt={`${tenant.name} logo`}
                className="size-14 rounded-xl border object-cover"
                src={tenant.logo_url}
              />
            ) : (
              <div className="flex size-14 items-center justify-center rounded-xl bg-primary text-xl font-bold text-primary-foreground">
                {initialsFor(tenant.name)}
              </div>
            )}
            <div>
              <p className="text-sm font-medium">{tenant.name}</p>
              <p className="text-xs text-muted-foreground">
                {tenant.logo_url ? "Custom logo" : "Default initials logo"}
              </p>
              <label
                className="mt-1.5 inline-flex h-6 cursor-pointer items-center justify-center gap-1 rounded-md border bg-background px-2 text-xs font-medium whitespace-nowrap shadow-xs transition-all hover:bg-accent hover:text-accent-foreground"
                htmlFor="center-logo"
              >
                Change Logo
              </label>
              <Input
                accept="image/png,image/svg+xml,image/jpeg,image/webp"
                className="sr-only"
                id="center-logo"
                name="logo"
                type="file"
              />
            </div>
          </div>

          <div className="space-y-3 border-t pt-4">
            <Field className="gap-1.5">
              <FieldLabel className="text-xs font-medium" htmlFor="center-name">
                Center Name
              </FieldLabel>
              <Input
                className="h-8 text-sm"
                defaultValue={tenant.name}
                id="center-name"
                name="name"
                required
              />
            </Field>
            <Field className="gap-1.5">
              <FieldLabel className="text-xs font-medium" htmlFor="center-address">
                Address
              </FieldLabel>
              <Input
                className="h-8 text-sm"
                defaultValue={tenant.address ?? ""}
                id="center-address"
                name="address"
                required
              />
            </Field>
            <Field className="gap-1.5">
              <FieldLabel className="text-xs font-medium" htmlFor="center-phone">
                Phone
              </FieldLabel>
              <Input
                className="h-8 text-sm"
                defaultValue={tenant.contact_phone ?? ""}
                id="center-phone"
                name="contact_phone"
                required
                type="tel"
              />
            </Field>
            <input
              name="secondary_phone"
              type="hidden"
              value={tenant.secondary_phone ?? ""}
            />
            <Field className="gap-1.5">
              <FieldLabel className="text-xs font-medium" htmlFor="center-email">
                Email
              </FieldLabel>
              <Input
                className="h-8 text-sm"
                defaultValue={tenant.email ?? ""}
                id="center-email"
                name="email"
                required
                type="email"
              />
            </Field>
          </div>

          <Button className="w-full gap-1.5" size="sm" type="submit">
            <SaveIcon className="size-3.5" />
            Save Profile
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}

function initialsFor(value: string) {
  const initials = value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")

  return initials || "EF"
}
