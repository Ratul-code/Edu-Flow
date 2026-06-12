# Design System

## Project Design Goal

Match the `ui-reference/` admin dashboard visually while keeping the production app as the source of truth for data, routing, auth, permissions, validation, mutations, loading states, and error handling. The UI should feel compact, neutral, and operational: clear tables, quiet cards, efficient filters, and restrained teal emphasis.

## Color Palette

- Background: `oklch(0.98 0 0)` for the app canvas.
- Surface/card/popover: `oklch(1 0 0)`.
- Foreground: `oklch(0.145 0 0)`.
- Muted: `oklch(0.93 0 0)` with muted text `oklch(0.5 0 0)`.
- Border/input: `oklch(0.93 0 0)`.
- Primary teal: `oklch(0.42 0.14 170)`.
- Accent teal: `oklch(0.65 0.12 170)`.
- Success: `oklch(0.527 0.154 150.069)`.
- Warning: `oklch(0.769 0.188 70.08)`.
- Info: primary teal.
- Destructive: `oklch(0.577 0.245 27.325)`.

## Typography

- Use the app font tokens from Next/Geist.
- Page titles: `text-2xl font-semibold tracking-tight`.
- Page subtitles: `mt-0.5 text-sm text-muted-foreground`.
- Headline badges and status badges: `inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium`; icons inside badges are `size-3`.
- Card titles: compact `text-sm font-semibold`; card descriptions are `text-xs text-muted-foreground`.
- Summary card labels: `text-xs text-muted-foreground`; values are `text-xl font-bold tracking-tight`.
- Buttons: base text is `text-sm font-medium`; `xs` buttons use `text-xs`.
- Table headers: `text-xs font-medium`.
- Table body: `text-sm`, with secondary row metadata in `text-xs text-muted-foreground`.

## Spacing Scale

- Page padding: `p-4 md:p-6`.
- Page vertical rhythm: `space-y-5` or `space-y-6`.
- Cards: default `py-6 px-6`; operational cards may use `py-0 gap-0`.
- Filter bars: `px-4 py-3`.
- Table cells: compact `p-2`, domain rows may use `py-2.5` to `py-3`.
- Control gaps: `gap-1.5` to `gap-3`.

## Border Radius

- Base radius: `0.625rem`.
- Buttons and inputs: `rounded-md`.
- Cards and main panels: `rounded-xl`.
- Badges: `rounded-full`.

## Shadows

- Cards use subtle `shadow-sm`.
- Avoid heavy custom shadows and decorative elevation.
- Menus/dialogs may rely on primitive defaults.

## Card Design

- Cards are white surfaces with a border and `shadow-sm`.
- Dashboard metric cards use compact headers, small icon containers, and simple trend rows.
- Table cards use `py-0 gap-0`, a bordered filter/header band, and `CardContent className="p-0"`.

## Table Design

- Neutral table headers, not colored blocks.
- Header rows are compact with `h-9` or `h-10`.
- Rows use subtle borders and `hover:bg-muted/50`.
- Primary identity cells may include avatar initials and secondary metadata.
- Actions stay compact and right-aligned.

## Button Design

- Default buttons are teal, compact, and `rounded-md`.
- Button typography must stay `text-sm font-medium`; only `xs` uses `text-xs`.
- `sm` is the standard page action size: `h-8 gap-1.5 px-3`.
- `xs` is for tiny inline row affordances: `h-6 gap-1 px-2 text-xs`.
- Icon buttons use `icon-sm` (`size-8`) for page actions and compact menus; dense table menus may use `icon-xs` (`size-6`) only where the reference table does.
- Preserve the production `render` API for links and triggers.

## Form/Input Design

- Inputs are `h-9` by default; dense filters use `h-8`.
- Search fields use a leading search icon and `pl-8`.
- Selects in filter bars should match input height and compact density.
- Keep existing validation schemas, form actions, dirty guards, and error behavior.

## Page Layout Patterns

- Authenticated app shell: compact sidebar, sticky `h-14` topbar, scrollable main content.
- List pages: page header with title/subtext and primary action outside the table card; table cards should start with the compact filter band and avoid extra table titles/descriptions.
- Detail pages: use the reference detail header with a `ghost sm` back button, avatar/name/status/tag cluster, and right-aligned `outline sm` actions; primary payment actions only appear when real due amounts exist.
- Student profile pages: use a `lg:grid-cols-3` detail layout, compact `gap-4 py-5 px-5` cards, icon-led profile fields, guardian fields from the reference with blank values for missing schema fields, enrolled batch rows, reference fee-history table columns, and notes in a compact textarea block.
- Batch create/edit: use right-side sheets instead of separate form pages. Batch name, class level, and subjects are required. If monthly fee changes, ask whether to apply ledger updates to this month or next month.
- Receipts: preview and downloaded PDF must use the same professional structure: dark header, receipt metadata panel, student/billing info cards, bordered amount rows, green paid amount, red due amount, note, and signature line. Use real receipt/payment data only.
- Dashboard: metric grid, progress/summary card when backed by real data, due-student table, quick-action grid, upcoming-classes table.

## Reusable Component List

- Layout shell: `AppSidebar`, `Topbar`, authenticated layout.
- Page header: `PageHeader`.
- Summary cards: shared `Card` plus dashboard metric pattern.
- Tables: `Table` primitives plus domain table components.
- Filters/search: `SearchInput`, domain filter bars.
- Buttons/actions: `Button`, table action buttons, dialogs/sheets.
- Status: `StatusBadge`, `Badge`.
- Empty/loading: existing `Empty` and `Skeleton` primitives styled with the same tokens.

## Migration Rules

- Use `ui-reference/` only for visuals.
- Do not copy reference mock arrays, names, phone numbers, fees, counts, or client navigation.
- Preserve App Router routes, Server Components, Server Actions, Supabase calls, cache behavior, redirects, auth guards, and validation.
- Keep tenant filters on every tenant read/write.
- Keep service-role clients server-only.
- Do not change backend contracts or route handler response shapes.
- Migrate page-by-page after shared primitives are aligned.

## Do / Don't

- Do reuse existing production data loaders, actions, schemas, tables, and domain components.
- Do keep row actions conditional according to current business rules.
- Do update docs only when a new reusable pattern or domain concept is introduced.
- Do not introduce mock data.
- Do not bypass `requireAdminContext()`.
- Do not mutate historical ledgers, receipts, or payments.
- Do not use `createAdminClient()` in client-facing code.
- Do not silently refactor unrelated code.
