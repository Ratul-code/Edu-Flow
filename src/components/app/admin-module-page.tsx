import { AdminDataTable } from "@/components/app/admin-data-table"
import { AdminEmptyState } from "@/components/app/admin-empty-state"
import { ModuleToolbar } from "@/components/app/module-toolbar"
import { PageHeader } from "@/components/app/page-header"
import type { AdminModuleConfig } from "@/lib/admin/module-config"
import {
  countTenantRecords,
  listTenantPreviewRecords,
} from "@/lib/data/tenant-records"
import { requireAdminContext } from "@/lib/auth/user"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type AdminModulePageProps = {
  config: AdminModuleConfig
}

export async function AdminModulePage({ config }: AdminModulePageProps) {
  const admin = await requireAdminContext()
  const recordCount = config.tableName
    ? await countTenantRecords(config.tableName, admin.tenantId)
    : null
  const previewRecords = config.tableName
    ? await listTenantPreviewRecords(config.tableName, admin.tenantId)
    : []
  const hasRecords = typeof recordCount === "number" && recordCount > 0

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={config.title}
        description={config.description}
        badge={recordCount === null ? "Placeholder" : `${recordCount} records`}
      />
      <ModuleToolbar
        createLabel={config.createLabel}
        filters={config.filters}
        moduleName={config.title}
        searchPlaceholder={`Search ${config.title.toLowerCase()}`}
      />
      <Card>
        <CardHeader>
          <CardTitle>{config.title} list</CardTitle>
          <CardDescription>
            Data is scoped to {admin.tenantName}. Cross-tenant records are
            blocked by RLS.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasRecords ? (
            <AdminDataTable
              columns={config.columns}
              rows={formatPreviewRows(config, previewRecords)}
            />
          ) : (
            <AdminEmptyState
              createLabel={config.createLabel}
              description={config.emptyDescription}
              icon={config.icon}
              moduleName={config.title}
              title={config.emptyTitle}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function formatPreviewRows(
  config: AdminModuleConfig,
  records: Array<Record<string, unknown>>
) {
  return records.map((record) => {
    const row: Record<string, string> = {
      id: stringValue(record.id),
    }

    for (const column of config.columns) {
      row[column.key] = formatColumnValue(config, record, column.key)
    }

    return row
  })
}

function formatColumnValue(
  config: AdminModuleConfig,
  record: Record<string, unknown>,
  key: string
) {
  if (key === "status") {
    return titleCase(stringValue(record.status) || "active")
  }

  if (config.tableName === "students") {
    const values: Record<string, string> = {
      name: stringValue(record.name),
      guardian: stringValue(record.guardian_name),
      class: stringValue(record.class_level),
    }

    return values[key] ?? "-"
  }

  if (config.tableName === "teachers") {
    const values: Record<string, string> = {
      name: stringValue(record.name),
      subject: stringValue(record.subject_specialty),
      salary: formatTaka(record.default_monthly_salary),
    }

    return values[key] ?? "-"
  }

  if (config.tableName === "batches") {
    const values: Record<string, string> = {
      name: stringValue(record.name),
      subject: stringValue(record.subject),
      fee: formatTaka(record.monthly_fee),
    }

    return values[key] ?? "-"
  }

  if (config.tableName === "class_schedules") {
    const values: Record<string, string> = {
      batch: stringValue(record.batch_id).slice(0, 8),
      subject: stringValue(record.subject),
      teacher: stringValue(record.teacher_id).slice(0, 8) || "-",
    }

    return values[key] ?? "-"
  }

  return "-"
}

function stringValue(value: unknown) {
  if (value === null || value === undefined) {
    return ""
  }

  return String(value)
}

function formatTaka(value: unknown) {
  const amount = Number(value ?? 0)

  return `৳${amount.toLocaleString("en-BD")}`
}

function titleCase(value: string) {
  return value
    .split("_")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ")
}
