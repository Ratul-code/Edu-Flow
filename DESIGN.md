# Design System

## Project Design Goal

Edu Flow is an operational admin dashboard for coaching-center management. The UI should feel compact, calm, and work-focused: fast-scanning tables, clear filters, restrained cards, practical dialogs/sheets, and a consistent teal primary accent.

Use `ui-reference/` as the visual/design source of truth only. The production app remains the source of truth for data, routing, auth, permissions, validation, mutations, loading states, and error handling.

## Visual Personality

- Dense enough for daily admin work, but not cramped.
- Neutral surfaces with teal as the main product/action color.
- Small, readable typography with clear hierarchy.
- Minimal decoration; use icons, status colors, spacing, and borders to create structure.
- Avoid marketing-style heroes, oversized cards, mock visuals, and decorative gradients.

## Color Tokens

Defined in `src/app/globals.css`.

- App background: `--background: oklch(0.98 0 0)`.
- Main text: `--foreground: oklch(0.145 0 0)`.
- Card/popover surface: `--card` and `--popover: oklch(1 0 0)`.
- Muted surface: `--muted: oklch(0.93 0 0)`.
- Muted text: `--muted-foreground: oklch(0.5 0 0)`.
- Border/input: `--border` and `--input: oklch(0.93 0 0)`.
- Primary teal: `--primary: oklch(0.42 0.14 170)`.
- Accent teal: `--accent: oklch(0.65 0.12 170)`.
- Secondary: pale blue/teal surface with teal text.
- Success: green token, used for active/paid/positive values.
- Warning: amber token, used for due states.
- Destructive: red token, used for archive/overdue/failure/danger.
- Info: teal token, used for partial/progress/informational states.

Dark-mode tokens exist, but the current product styling is primarily optimized around the light operational dashboard.

## Typography

- Font: Geist Sans through `--font-sans`; Geist Mono through `--font-mono`.
- Page titles: `text-2xl font-semibold tracking-tight`.
- Detail page titles: `text-xl font-semibold tracking-tight` when paired with an avatar/header cluster.
- Page descriptions: `mt-0.5 text-sm text-muted-foreground`.
- Card titles: usually `text-sm font-semibold`.
- Card descriptions: usually `text-xs text-muted-foreground` in dense dashboard/list contexts.
- Metric values: `text-2xl font-bold tracking-tight`.
- Table headers: `h-9 text-xs font-medium`.
- Table body: `text-sm`, with secondary metadata as `text-xs text-muted-foreground`.
- Badges and small controls: `text-xs font-medium`.

Do not scale fonts with viewport width. Keep letter spacing normal except the existing `tracking-tight` on headings and `tracking-wide uppercase` on metric labels.

## Radius, Borders, Shadows

- Base radius: `--radius: 0.625rem`.
- Buttons and inputs: `rounded-md`.
- Cards: `rounded-xl`.
- Metric icon tiles: `rounded-lg`.
- Badges/progress bars: `rounded-full`.
- Cards use `border bg-card shadow-sm`.
- Use borders and muted backgrounds for hierarchy; avoid heavy custom shadows.

## Layout

### Authenticated Shell

- The app shell uses a collapsible left sidebar and sticky-looking topbar inside `SidebarProvider`.
- Sidebar width: `--sidebar-width: 16rem`; icon width: `3rem`.
- Main content scrolls inside `main` with `overflow-y-auto`.
- Topbar height is compact (`h-14` convention).

Reference files:

- `src/app/(app)/layout.tsx`
- `src/components/app/app-sidebar.tsx`
- `src/components/app/topbar.tsx`

### Page Canvas

- Standard page padding: `p-4 md:p-6`.
- Standard vertical rhythm: `space-y-5` for list/detail pages and `space-y-6` for dashboard pages.
- Page header and primary actions sit above cards, not inside the table card.
- Use responsive flex headers: `flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between` when actions may wrap.

### Settings Pages

- Settings use line-style tabs under the page header: General, Billing, Academic Setup, and Salary Setting.
- Tab lists are full-width with a bottom border, square tab triggers, and a primary underline for the selected tab.
- Settings cards follow the `ui-reference` density: `text-sm` titles, `text-xs` descriptions, compact controls, and `gap-4` responsive grids.
- General contains the center profile form only. Billing contains tenant subscription status. Academic Setup uses three reference-style taxonomy cards. Salary Setting contains Student Payment and Teacher Payment settings.
- Keep settings content operational. Do not copy mock account, payment-method, notification, or switch behavior unless the real app supports it.

### List Pages

- Use a compact page header plus primary create/action button.
- Main list surface is a single `Card className="gap-0 py-0"`.
- Inside list cards, use `CardContent className="p-0"`.
- Filter bars sit at the top of the card as `border-b px-4 py-3`.
- Results render directly below filters, with an empty state in the same surface.

Reference files:

- `src/app/(app)/students/page.tsx`
- `src/app/(app)/batches/page.tsx`
- `src/app/(app)/fees/page.tsx`
- `src/app/(app)/salaries/page.tsx`

### Dashboard

- Metric cards use `Card className="gap-3 py-5"`.
- Metric card header/content padding is `px-5`.
- Metric icons are `size-8 rounded-lg` containers with tone classes such as `bg-info/10 text-info`.
- Dashboard sections use responsive grids: metrics in `sm:grid-cols-2 xl:grid-cols-4`; content in `lg:grid-cols-3`.
- Progress bars use a muted rounded track and `bg-primary` fill.

Reference file:

- `src/app/(app)/dashboard/page.tsx`

### Detail Pages

- Detail headers use a ghost back button, avatar/name/status cluster, and right-aligned actions.
- Detail content usually uses `grid grid-cols-1 gap-4 lg:grid-cols-3`.
- Detail cards use `gap-4 py-5` with `px-5` header/content padding.
- Use icon-led details for profile fields: small lucide icon, muted label, strong value.
- Show payment CTAs only when real due ledgers exist.

Reference files:

- `src/app/(app)/students/[id]/page.tsx`
- `src/app/(app)/teachers/[id]/page.tsx`
- `src/app/(app)/batches/[id]/page.tsx`

## Cards

- Default primitive: `Card` is `flex flex-col gap-6 rounded-xl border bg-card py-6 shadow-sm`.
- Dense operational cards override with `gap-3` or `gap-4` and `py-5`.
- List/table cards override with `gap-0 py-0`.
- Use `px-5` for dense cards and `px-6` for default cards.
- Do not nest cards inside cards.
- Do not turn page sections into decorative floating cards unless the section is a real repeated item, modal, or framed tool.

## Buttons

Button variants live in `src/components/ui/button.tsx`.

- Default: teal primary action, `bg-primary text-primary-foreground`.
- Outline: bordered neutral action, used for secondary commands and row actions.
- Ghost: quiet navigation or inline command.
- Destructive: danger/archive/delete actions.
- Link: text link behavior.

Button sizes:

- `default`: `h-9 px-4`.
- `sm`: `h-8 gap-1.5 px-3`; standard page/header action.
- `xs`: `h-6 gap-1 px-2 text-xs`; dense table action.
- `icon-sm`: `size-8`; compact icon action.
- `icon-xs`: `size-6`; dense row/menu action only.

Use lucide icons in action buttons when a recognizable icon exists. Mark inline icons with `data-icon="inline-start"` or `data-icon="inline-end"` when the primitive spacing expects it.

## Tables

- Use shared `Table` primitives.
- Header rows are compact and neutral, not colored blocks.
- Header cells commonly use `h-9 text-xs font-medium`; first column often gets `pl-4`.
- Body rows use subtle borders and hover states from the primitive.
- Primary identity cells come first and may include a `size-6` avatar with initials.
- Money columns are right-aligned.
- Row metadata uses `text-xs text-muted-foreground`.
- Row actions are right-aligned in `flex items-center justify-end gap-1`.
- Use `xs` buttons for row actions.
- Use `StatusBadge` for statuses.

Reference files:

- `src/components/students/students-table.tsx`
- `src/components/teachers/teachers-table.tsx`
- `src/components/batches/batches-table.tsx`
- `src/components/fees/fee-ledgers-table.tsx`
- `src/components/salaries/salary-ledgers-table.tsx`

## Badges And Status

- Use `Badge` for tags, counts, current month, and compact labels.
- Use `StatusBadge` for normalized domain statuses.
- Active/paid: `border-success/20 bg-success/10 text-success`.
- Partial/info: `border-info/20 bg-info/10 text-info`.
- Due: `border-warning/20 bg-warning/10 text-warning-foreground`.
- Overdue/destructive: `border-destructive/20 bg-destructive/10 text-destructive`.
- Archived/not-started/waived: muted border/background/text.
- Tags generally use `variant="secondary"` and `text-xs`.

Reference files:

- `src/components/app/status-badge.tsx`
- `src/components/app/page-header.tsx`

## Forms And Inputs

- Inputs are compact and admin-focused; default height follows the primitive (`h-9` convention).
- Dense filters use `h-8` controls where appropriate.
- Search controls use a leading `SearchIcon` and left padding.
- Standalone forms use card composition: `CardHeader`, `CardContent`, `CardFooter`.
- Create/edit flows often use sheets for students, teachers, and batches.
- Preserve all zod schemas, server actions, pending states, dirty guards, and validation messages when changing layout.

Reference files:

- `src/components/students/student-form.tsx`
- `src/components/students/student-fields.tsx`
- `src/components/students/student-create-sheet-client.tsx`
- `src/components/teachers/teacher-form.tsx`
- `src/components/batches/batch-sheet.tsx`

## Sheets, Dialogs, Empty, Loading

- Use sheets for create/edit workflows that should not navigate away from list/detail context.
- Use dialogs for confirmations, receipt previews, and focused modal tasks.
- Empty states should be quiet and actionable, using existing `Empty` primitives.
- Skeletons should match the real layout density: filter bar skeletons plus row-like skeletons for tables.
- Do not replace real loading/error behavior with mock-only states from `ui-reference/`.

## Receipts

- Receipt previews and PDFs should share the same professional visual structure.
- Use real receipt/payment/ledger/tenant data only.
- Keep the receipt hierarchy clear: header, metadata, person/billing details, amount rows, paid/due emphasis, note, signature/footer.
- Paid amounts use success coloring; due amounts use destructive coloring.
- Receipt actions appear only when a real payment record exists.

Reference files:

- `src/components/receipts/student-payment-receipt.tsx`
- `src/components/receipts/student-payment-receipt-dialog.tsx`
- `src/components/salaries/salary-payment-receipt.tsx`
- `src/components/salaries/salary-payment-receipt-dialog.tsx`

## Icons

- Use `lucide-react` icons.
- Sidebar icons use default sidebar primitive sizing.
- Header/button icons are commonly `size-3`, `size-3.5`, or `size-4`.
- Metric icons are `size-4` inside a `size-8` colored tile.
- Icon-only controls should use `Button` icon sizes rather than custom square classes unless the primitive cannot handle the case.

## Communication

- Sidebar communication links follow the `ui-reference/` group structure with Automations intentionally omitted.
- Communication overview, campaigns, templates, and logs currently use `ui-reference/` mockup data as a demo surface until tenant-scoped provider storage, recipient selection, templates, campaigns, and delivery logs exist.
- Keep this mock data isolated inside Communication UI components so future server loaders, data models, and backend functions can replace it without changing unrelated app logic.
- Do not connect mock communication data to receipts, ledgers, real students, real teachers, payments, or provider APIs.

## Responsive Behavior

- Prefer simple responsive grids and wrapping flex rows.
- Tables may remain dense; ensure action groups and labels do not overlap.
- Use `flex-wrap` for header badges/actions.
- Use `grid-cols-1` first, then add `sm`, `lg`, or `xl` columns.
- Avoid viewport-width font scaling.

## Migration Rules

- Use `ui-reference/` only for visual direction.
- Do not copy mock arrays, names, phone numbers, fees, counts, placeholder receipts, or client-only navigation.
- Preserve App Router routes, Server Components, Server Actions, Supabase calls, cache behavior, redirects, auth guards, validation, loading states, and error handling.
- Keep tenant filters on every tenant read/write.
- Keep service-role clients server-only.
- Do not change backend contracts or route handler response shapes for visual work.
- Migrate page-by-page after shared primitives are aligned.

## Do / Don't

- Do reuse `PageHeader`, `Card`, `Button`, `Table`, `Badge`, `StatusBadge`, `Empty`, `Skeleton`, sheets, and dialogs.
- Do keep page actions above table cards.
- Do keep filter controls inside the top band of table cards.
- Do use compact, clear labels and admin-focused copy.
- Do update this file when a reusable visual convention changes.
- Do not introduce mock data.
- Do not bypass `requireAdminContext()`.
- Do not move business logic into UI primitives.
- Do not use decorative gradients, oversized hero layouts, or ornamental backgrounds in the admin app.
- Do not show payment/receipt actions unless backed by real data.
