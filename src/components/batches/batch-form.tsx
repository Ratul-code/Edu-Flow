import Link from "next/link"

import type { BatchRecord } from "@/lib/data/batches"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { requireAdminContext } from "@/lib/auth/user"
import { checkClassLevelsTableExists, listClassLevels } from "@/lib/data/class-levels"
import { listAcademicGroups } from "@/lib/data/academic-groups"

type BatchFormProps = {
  action: (formData: FormData) => void | Promise<void>
  batch?: BatchRecord
  cancelHref: string
  submitLabel: string
  title: string
}

export async function BatchForm({
  action,
  batch,
  cancelHref,
  submitLabel,
  title,
}: BatchFormProps) {
  const admin = await requireAdminContext()
  const tableExists = await checkClassLevelsTableExists()
  const [classLevels, academicGroups] = await Promise.all([
    tableExists ? listClassLevels(admin.tenantId) : Promise.resolve([]),
    listAcademicGroups(admin.tenantId),
  ])
  return (
    <form action={action}>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            Batch profile, class level, medium/group, fee, and status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="sm:grid sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="name">Batch name</FieldLabel>
              <Input id="name" name="name" defaultValue={batch?.name} required />
            </Field>
            <Field>
              <FieldLabel htmlFor="class_level">Class level</FieldLabel>
              {tableExists && classLevels.length > 0 ? (
                <Select defaultValue={batch?.class_level ?? ""} name="class_level">
                  <SelectTrigger className="h-8 w-full" id="class_level">
                    <SelectValue placeholder="Not set" />
                  </SelectTrigger>
                  <SelectContent align="start">
                    <SelectGroup>
                      <SelectItem value="">Not set</SelectItem>
                      {classLevels.map((level) => (
                        <SelectItem key={level.id} value={level.name}>
                          {level.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="class_level"
                  name="class_level"
                  defaultValue={batch?.class_level ?? ""}
                  placeholder="Class 9"
                />
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="monthly_fee">Monthly fee</FieldLabel>
              <Input
                id="monthly_fee"
                min="0"
                name="monthly_fee"
                defaultValue={String(batch?.monthly_fee ?? 0)}
                step="0.01"
                type="number"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="medium">Medium</FieldLabel>
              <Select defaultValue={batch?.medium ?? ""} name="medium">
                <SelectTrigger className="h-8 w-full" id="medium">
                  <SelectValue placeholder="Not set" />
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectGroup>
                    <SelectItem value="">Not set</SelectItem>
                    <SelectItem value="Bangla Medium">Bangla Medium</SelectItem>
                    <SelectItem value="English Version">English Version</SelectItem>
                    <SelectItem value="English Medium">English Medium</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="group_name">Group</FieldLabel>
              <Select defaultValue={batch?.group_name ?? ""} name="group_name">
                <SelectTrigger className="h-8 w-full" id="group_name">
                  <SelectValue placeholder="Not set" />
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectGroup>
                    <SelectItem value="">Not set</SelectItem>
                    {academicGroups.map((option) => (
                      <SelectItem key={option.id} value={option.name}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="status">Status</FieldLabel>
              <Select defaultValue={batch?.status ?? "active"} name="status">
                <SelectTrigger className="h-8 w-full" id="status">
                  <SelectValue placeholder="Active" />
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectGroup>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button render={<Link href={cancelHref} />} variant="outline">
            Cancel
          </Button>
          <Button type="submit">{submitLabel}</Button>
        </CardFooter>
      </Card>
    </form>
  )
}
