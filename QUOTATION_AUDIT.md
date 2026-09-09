# Quotation Page Audit

## 0. How this audit was produced (read this first)

This audit is **not** based on live browsing of the reference system. Two access constraints applied:

1. **Network egress to `https://hyper-pos.eshopweb.store/` is blocked** in this execution
   environment (confirmed via `WebFetch` → `EGRESS_BLOCKED`, and `curl` → `CONNECT tunnel
   failed, response 403`). No page on the reference domain — not even the login page —
   could be reached, regardless of credentials.
2. No login credentials were provided for the reference system.

Because of (1), the user instead supplied a **35-second screen recording**
(`Screen_Recording_20260909_112309.mp4`, 1920×1020) of themselves navigating the live
admin panel at `hyper-pos.eshopweb.store/admin`. The recording was decoded with `ffmpeg`
into 35 still frames (1 fps) and every frame was visually inspected. That recording is the
**entire evidentiary basis** for this document — nothing below was guessed from a generic
POS template, and nothing was invented beyond what a frame directly shows, **except where
explicitly marked `ASSUMPTION`**. Anything not observed and not safely inferable is marked
`UNKNOWN`.

The recording shows, in order: the Suppliers page → clicking "Quotations" in the sidebar →
the empty Quotations list page → clicking "New quotation" → the New Quotation form (top
section, then scrolled to the Items section) → opening the Store dropdown → opening the
Existing Customer dropdown (showing real seeded customer rows) → opening the phone
country-code dropdown. **The recording ends before any product is added, before Save is
pressed, and before any saved quotation, its detail/print view, or its edit view is ever
shown.** This is the single biggest gap in the source material and is called out
throughout.

## 1. URL

- Reference: `https://hyper-pos.eshopweb.store/admin/quotations` (list) and
  `https://hyper-pos.eshopweb.store/admin/quotations/create` (create form), gated behind
  `/admin` login.
- Rebuild: `/admin/quotations` (list), `/admin/quotations/new` (create),
  `/admin/quotations/[id]` (view), `/admin/quotations/[id]?edit=1` (edit) — the same
  `/admin/...` path shape was kept deliberately for closeness to the reference.

## 2. Page Structure

### 2.1 Global chrome (present on every `/admin/*` page)

| Region | Contents (as observed) |
|---|---|
| Sidebar (fixed left, ~268px) | Logo "HYPER POS" + collapse icon at top; grouped nav below with uppercase group labels; footer status row "● All systems online" + version "v1.1.1" |
| Header (top, full remaining width, ~64–70px tall) | Breadcrumb ("Back office / Quotations"); global search input "Search products, orders, customers..." with a `⌘K` hint chip; **STORE** dropdown ("Main Store"); **LANGUAGE** dropdown ("English"); bell/notification icon; two solid-orange square icon buttons (a download-tray icon and a monitor/screen icon — purpose not opened in the recording, `UNKNOWN` exact function, reproduced visually only); user menu (circular initials avatar "DC"/"admin", name, role label "Administrator", chevron) |
| Footer | Centered "© 2026 Hyper POS. All rights reserved." |

Sidebar nav groups actually seen across frames (Suppliers-page frame + Quotations-page
frame), in order:

```
OPERATIONS   Dashboard, POS, Shift History, Cash Mismatch Reasons
SALES        Sales History, New sale, Quotations, Kiosk orders, Channel orders,
             Customer payments, Return reasons
CUSTOMERS    Customers, Customer groups
PRODUCTS     Products, Print labels
INVENTORY    Inventory reports
SUPPLY       Suppliers            (breadcrumb "Back office / Supply / Suppliers")
```

Every item above was read directly off a frame; none were invented. Icons for each item
were not always legible at video resolution — the rebuild assigns a reasonable Lucide icon
per item (`ASSUMPTION` on exact icon glyph only, not on the item's existence or grouping).

### 2.2 Quotations list page (`/admin/quotations`)

Empty state (this is the only state the recording shows — the seeded account had 0
quotations):

- H1 "Quotations", subtitle "Prepare, share, revise, and convert customer quotations
  without changing stock." (verbatim, read from the frame)
- Top-right primary button "+ New quotation" (orange)
- A single card containing:
  - Header row "Quotations (0)" + a refresh icon button
  - Filter row: **STATUS** select ("All statuses"), **FROM** date, **TO** date, a search
    input "Number, customer, product, or SKU...", "✕ Reset filters" button
  - Empty-state block: a document icon, "No quotations found", "Create a quotation or
    change the filters."

No column headers, rows, pagination control, or row-action menu were ever visible (0
results). Their existence, and their construction as **Number / Customer / Issue date /
Valid until / Items / Status / Total / actions-menu**, is an `ASSUMPTION` built from the
filter bar's own vocabulary (it filters by status, a date range, and "Number, customer,
product, or SKU"), not from an observed table.

### 2.3 New quotation form (`/admin/quotations/create`)

Fully observed down to the "Items" section; the video was cut before scrolling to any
possible section after "Delivery, terms, and notes" other than what's listed below.

- Back arrow + H1 "New quotation" + subtitle "Build a formal offer using the same product
  pricing and tax rules as a sale."
- Top-right: "Discard" (plain/ghost button) and "✓ Save draft" (primary orange button)
- Info banner (light blue background, info icon): **"A quotation does not reserve or
  deduct stock. Availability is checked when it is converted to a sale."** (verbatim —
  this is the single most important piece of business logic in the whole recording)
- Card **"Quotation details"** — "Store, customer or prospect, document dates, and
  delivery addresses."
  - Row 1: **STORE\*** (select, default "Main Store"), **EXISTING CUSTOMER** (searchable
    combobox, placeholder "Use prospect details", opens a "Search..." box plus a scrollable
    list of real customers rendered as `"{name-or-phone} · {phone-or-code}"`, e.g.
    `"010111111 · C-000043"`, `"9654323456 · C-000056"`, `"Aarav Singh · +9187654..."`),
    **ISSUE DATE\*** (date, defaults to today), **VALID UNTIL** (date, empty by default —
    the rebuild defaults it to +7 days for the seed data only, the form itself leaves it
    blank)
  - Row 2 (only when no existing customer is selected — inferred from the field being
    literally named "Prospect ..." and the toggle option "Use prospect details"):
    **PROSPECT NAME\***, **EMAIL**, **PHONE** (a country-flag dial-code dropdown + number
    input, placeholder `+1 201-555-0123`)
  - Row 3: **BILLING ADDRESS** (textarea), **SHIPPING ADDRESS** (textarea)
- Card **"Items"** — "Add catalog products and variants. Prices and taxes resolve
  automatically."
  - "⠿ Scan a product barcode" input with an `F8` keyboard-shortcut chip and a camera icon
    button (camera → presumably opens a device-camera barcode scanner; never triggered in
    the recording, so its exact behavior is `UNKNOWN`)
  - **ADD PRODUCT** label + "Search product, SKU, or barcode..." input
  - Empty-state text: "Add at least one product to prepare the quotation."
- Card **"Delivery, terms, and notes"** — "Customer-facing conditions plus private staff
  notes."
  - **EXPECTED DELIVERY DATE** (date)
  - **TERMS AND CONDITIONS** (textarea)
  - **CUSTOMER NOTES** (textarea — label visible, field itself was cut off at the bottom
    of the last frame)
- Right sidebar, sticky: card **"Quotation summary"**: `Subtotal`, `Discount`, `Tax`, a
  divider, then bold `Total`, all `$0.00` in the empty state, plus the caption **"Totals
  are calculated by the server using the selected store, customer discount, and current
  tax rules."** (verbatim). This sentence is why the rebuild treats "Discount" as
  **customer-level data** (see §6 Business Logic) rather than a form field — no discount
  input of any kind appears anywhere in the recording.

Nothing past this point (a product actually being added, computed non-zero totals, the
Save action, a resulting detail page, an edit page, a print/PDF view, or any validation
message) was ever shown on the reference site. Every one of those is `UNKNOWN` for the
reference and was designed from scratch for the rebuild, following the interaction
patterns the *visible* parts of the form already established (labels, empty-state copy
style, card structure).

## 3. Quotation List — column/action detail

`UNKNOWN` for the reference (0 rows shown). The rebuild's `ASSUMPTION`s:

- Columns: Number, Customer, Issue date, Valid until, Items (count), Status (badge),
  Total, row-actions (⋯ menu: View / Edit / Print / Delete).
- Edit/Delete are only offered when the row's status allows it (see §6).
- Sorting: not implemented (never observed); Search/Filter/Pagination pattern mirrors the
  filter bar that *was* observed (Status / From / To / free-text).
- Clicking a row's Number navigates to the detail page (`ASSUMPTION`, standard pattern).

## 4. Create Quotation — field-by-field

Covered in full in §2.3. Everything under "Customer", "Quotation information",
"Products", not explicitly listed there was never shown, in particular:

- **No visible "Quotation number" field** on the create form — the rebuild infers it is
  server-generated on save (pattern matched from the Suppliers page's own `S-000017`-style
  codes) and shows it only after saving, as `QT-000001`, `QT-000002`, ….
- **No "Salesperson" field** was observed (the header's logged-in user — "Demo Cashier /
  Administrator" or "admin / Administrator" — appears to implicitly be the creator; the
  rebuild stores `createdBy` this way and shows it as read-only on the detail page).
- **No visible Status field on the create form** — new quotations are assumed to start as
  `Draft` (`ASSUMPTION`), with status changes happening after creation.

## 5. Totals — the one formula actually documented by the source

The reference never shows non-zero totals (no product was ever added), so the *exact*
arithmetic is `UNKNOWN`. What **is** directly quoted from the UI is the summary panel's
own explanation: **"Totals are calculated by the server using the selected store,
customer discount, and current tax rules."** The rebuild takes that sentence literally:

```
Per line:
  lineGross    = quantity × unitPrice
  lineDiscount = discountType === PERCENT ? lineGross × discountValue/100 : discountValue
  lineTaxable  = lineGross − lineDiscount
  lineTax      = lineTaxable × (taxRate / 100)
  lineTotal    = lineTaxable + lineTax

Quotation:
  subtotal          = Σ lineGross                      (pre-discount, pre-tax)
  quotationDiscount  = customer.discountType === PERCENT ? subtotal × customer.discountValue/100
                                                          : customer.discountValue
  discountTotal      = Σ lineDiscount + quotationDiscount
  taxTotal            = Σ lineTax                        (computed on line-level discount only)
  total              = subtotal − discountTotal + taxTotal
```

This is implemented once, server-side, in `src/lib/calculations.ts`, and is the **only**
place totals are computed — the client never computes a number that gets persisted; it
only calls `POST /api/quotations/calculate` for a live preview, and the real `POST/PUT
/api/quotations` handlers recompute independently from the product/customer records in
the database (never trusting client-submitted prices).

`ASSUMPTION`s baked into this formula, all flagged because none were observable:

- Per-item discount exists and can be `PERCENT` or `FIXED` (a `$`/`%` toggle next to the
  discount value in the rebuild's item row) — **no discount UI of any kind appears in the
  recording**, this is a standard-POS convenience the audit could not verify either way.
- Quotation-level discount comes from `Customer.discountType`/`discountValue`, **not** a
  form field — directly justified by the "customer discount" wording quoted above, and
  consistent with no discount input ever appearing on the form.
- Tax is per-product (`Product.tax → Tax.rate`), resolved automatically as the "Items"
  card subtitle claims ("Prices and taxes resolve automatically") — the *rate itself* is
  never shown in the recording, so `15%`/`0%` sample rates in the seed data are invented
  for demonstration only.
- No shipping/"other charges" line was ever seen; none is implemented.
- Whether tax is computed before or after the quotation-level discount could not be
  determined; the rebuild computes tax on line-level-discounted amounts only, before the
  quotation-level discount is subtracted (a common simplification), and documents this
  choice inline in `calculations.ts`.

## 6. Business Logic

| Question | Answer |
|---|---|
| How is the quotation number generated? | `UNKNOWN` on the reference (never shown). Rebuild: sequential `QT-000001`, `QT-000002`, … mirroring the `S-000017` supplier-code style seen on the Suppliers page. |
| What statuses exist? | `UNKNOWN` beyond the fact that a **Status filter** exists on the list page ("All statuses"). Rebuild defines `Draft, Sent, Accepted, Rejected, Expired, Converted` as a reasonable POS-quotation lifecycle — `ASSUMPTION`. |
| When can a quotation be edited? | `UNKNOWN`. Rebuild: `Draft` and `Sent` only — `ASSUMPTION`. |
| When can it be deleted? | `UNKNOWN`. Rebuild: anything except `Converted` — `ASSUMPTION`. |
| Can a quotation become a sale? | **Confirmed, partially.** The info banner explicitly says stock "is checked when it is converted to a sale," proving a convert action exists. The trigger UI for it, and what happens on insufficient stock, are `UNKNOWN`. Rebuild: an `Accepted → Converted` status transition (`PATCH /api/quotations/:id/status`); no `Sale`/inventory model exists in this rebuild (out of scope per the task's "don't build unrelated pages" instruction), so conversion is a status-only stub, clearly commented as such in the route handler. |
| Does a quotation affect inventory before conversion? | **No — confirmed verbatim**: "A quotation does not reserve or deduct stock." |
| How is tax calculated? | See §5. Exact reference formula `UNKNOWN`; "resolve automatically" from the product is confirmed. |
| How is discount calculated / is it % or fixed? | `UNKNOWN` whether percent or fixed on the reference — the UI shows a single dollar amount, compatible with either. Rebuild supports both, keyed off a `DiscountType` enum, defaulting to `FIXED`. See §5 for why it's customer-level, not typed on the form. |
| Multiple taxes per item? | `UNKNOWN` — never observed. Rebuild: one tax per product (simplest reading of "current tax rules"). |
| Shipping / other charges? | `UNKNOWN` — never observed, not implemented. |
| Notes? | **Confirmed**: "Terms and conditions" and "Customer notes" fields exist on the form. |
| Print / PDF? | `UNKNOWN` — never observed or triggered in the recording. Rebuild adds a "Print" button using the browser's native `window.print()` with print-only CSS hiding the sidebar/header/footer, since no evidence of a dedicated PDF-generation flow (vs. browser print-to-PDF) exists either way. |

## 7. Validation

**None observed** — the recording never submits the form, so no required-field error, no
toast, no disabled-button state, and no server error message from the reference exists to
copy. Every validation rule in the rebuild is therefore an `ASSUMPTION`, built from what
the form itself marks as required (`*` on Store, Existing customer OR Prospect name,
Issue date) and standard-POS common sense (quantity > 0, non-negative prices/discounts, a
percent discount clamped to 0–100, valid-until ≥ issue date, no duplicate product line —
"adjust the quantity instead" is the rebuild's own message, not the reference's). Rules
actually implemented (`src/lib/validations/quotation.ts` + client-side mirroring in
`quotation-form.tsx`):

- Store is required.
- Either an existing customer is selected, or a non-empty prospect name is entered.
- Issue date is required; Valid until (if set) must be ≥ issue date.
- At least one item is required.
- Item quantity must be > 0; item discount must be ≥ 0 (and ≤ 100 if percent).
- A product cannot be added twice (the picker greys out already-added products and shows
  "already added"; a duplicate exact-barcode scan shows a toast instead of adding a
  second line).
- Server re-validates everything the client does (product/customer/store still exist,
  status allows editing, etc.) and never trusts client-submitted prices or tax rates.

Tested interactively (Playwright) and confirmed working: empty submit → inline errors +
toast "Please fix the highlighted fields"; negative quantity → row-level red error text +
blocked save; duplicate product → picker item disabled + "already added" label; invalid
date range → inline error "Valid until must be on or after the issue date".

## 8. Responsive Design

`UNKNOWN` for the reference — the recording is desktop-only (1920×1020), no tablet/mobile
view was ever shown. The rebuild was independently tested at 1440px (desktop), 834px
(tablet), and 390px (mobile) via Playwright screenshots:

- **Desktop / tablet (≥768px):** sidebar always visible; header shows breadcrumb, search,
  store/language selectors, all icons.
- **Mobile (<768px):** sidebar is hidden and replaced by a hamburger button (`ASSUMPTION —
  not observed; added because hiding all navigation with no replacement would be a real
  regression, not a faithful "unknown"**) opening a full-height slide-in panel with the
  same grouped nav; breadcrumb and the store/language selectors collapse (hidden) to save
  space; the filter bar and form fields stack to a single column; the items table and any
  wide table scroll horizontally inside their own bordered container (`overflow-x-auto`)
  rather than the page scrolling horizontally; the summary card moves below the form
  instead of sitting in a sticky sidebar; dialogs (delete-confirm, mobile nav) remain
  full-width/full-height appropriately.
- Table responsiveness: every `<Table>` is wrapped in a horizontally-scrollable container
  so a wide table never breaks the page layout on narrow viewports.

## 9. UI Design System

Extracted from the recording via pixel inspection of the frames (colors are close
approximations read off screenshots, not exact hex values from devtools, since devtools
access to the live site was never possible):

| Token | Value (approx., from frames) |
|---|---|
| Primary | Orange, ~`#EA6A2E`–`#F2662A` range (buttons, active nav item, links, brand mark) |
| Background | White `#FFFFFF` |
| Sidebar background | Off-white, very slightly tinted vs. main background |
| Text (primary) | Near-black `#171717`-ish |
| Text (muted) | Mid-gray, used for labels/subtitles/hints |
| Borders | Very light gray, low-contrast hairlines |
| Success (badges/status dots) | Green |
| Info banner | Light blue/indigo background with blue text + icon |
| Typography | Sans-serif system/UI font; field labels are small, uppercase, letter-spaced, gray; page titles are bold and larger; body text is regular weight |
| Border radius | Small-to-medium (~6–8px) on inputs/buttons/cards, fully round on badges/avatars |
| Shadows | Very subtle, low-elevation card shadows |
| Buttons | Solid orange primary, plain/ghost secondary (no visible border), bordered outline for tertiary actions |
| Inputs | White fill, thin gray border, rounded, comfortable padding, uppercase small labels above each field |
| Tables | Plain white rows, light divider lines, uppercase gray column headers, no zebra striping observed |
| Badges (status) | Small pill/dot + label, color-coded (only "Active" toggle switches were observed on the Suppliers page; quotation status badge colors are an `ASSUMPTION`) |

The rebuild encodes this as a Tailwind v4 `@theme` token set in `src/app/globals.css`
(OKLCH colors, orange primary, light/dark variants) and shadcn/ui-style components in
`src/components/ui/*` built by hand (see §11 — the shadcn CLI registry itself was
network-blocked).

## 10. Database Model

```
Store 1───* Quotation *───1 User (createdBy)
Store 1───* User
Customer 1───* Quotation
Quotation 1───* QuotationItem *───1 Product *───1 Tax (optional)
```

Prisma schema — `prisma/schema.prisma` (PostgreSQL):

```prisma
enum UserRole { ADMINISTRATOR CASHIER }
enum QuotationStatus { DRAFT SENT ACCEPTED REJECTED EXPIRED CONVERTED }
enum DiscountType { PERCENT FIXED }

model Store {
  id String @id @default(cuid())
  name String
  code String @unique
  isDefault Boolean @default(false)
  quotations Quotation[]
  users User[]
}

model User {
  id String @id @default(cuid())
  name String
  email String @unique
  role UserRole @default(CASHIER)
  storeId String?
  store Store? @relation(fields: [storeId], references: [id])
  quotations Quotation[]
}

model Customer {
  id String @id @default(cuid())
  code String @unique
  name String
  email String?
  phone String?
  billingAddress String?
  shippingAddress String?
  discountType DiscountType @default(FIXED)
  discountValue Decimal @default(0) @db.Decimal(12, 2)
  quotations Quotation[]
}

model Tax {
  id String @id @default(cuid())
  name String
  rate Decimal @db.Decimal(6, 3)
  isDefault Boolean @default(false)
  products Product[]
}

model Product {
  id String @id @default(cuid())
  sku String @unique
  barcode String? @unique
  name String
  unit String @default("pcs")
  price Decimal @db.Decimal(12, 2)
  taxId String?
  tax Tax? @relation(fields: [taxId], references: [id])
  quotationItems QuotationItem[]
}

model Quotation {
  id String @id @default(cuid())
  number String @unique
  storeId String
  store Store @relation(fields: [storeId], references: [id])
  createdById String
  createdBy User @relation(fields: [createdById], references: [id])
  customerId String?
  customer Customer? @relation(fields: [customerId], references: [id])
  prospectName String?
  prospectEmail String?
  prospectPhone String?
  billingAddress String?
  shippingAddress String?
  issueDate DateTime
  validUntil DateTime?
  expectedDeliveryDate DateTime?
  termsAndConditions String?
  customerNotes String?
  status QuotationStatus @default(DRAFT)
  discountType DiscountType @default(FIXED)
  discountValue Decimal @default(0) @db.Decimal(12, 2)
  subtotal Decimal @default(0) @db.Decimal(12, 2)
  discountTotal Decimal @default(0) @db.Decimal(12, 2)
  taxTotal Decimal @default(0) @db.Decimal(12, 2)
  total Decimal @default(0) @db.Decimal(12, 2)
  convertedSaleId String?
  convertedAt DateTime?
  items QuotationItem[]
}

model QuotationItem {
  id String @id @default(cuid())
  quotationId String
  quotation Quotation @relation(fields: [quotationId], references: [id], onDelete: Cascade)
  productId String
  product Product @relation(fields: [productId], references: [id])
  quantity Decimal @db.Decimal(12, 3)
  unitPrice Decimal @db.Decimal(12, 2)
  discountType DiscountType @default(FIXED)
  discountValue Decimal @default(0) @db.Decimal(12, 2)
  taxRate Decimal @default(0) @db.Decimal(6, 3)
  subtotal Decimal @db.Decimal(12, 2)
  taxAmount Decimal @default(0) @db.Decimal(12, 2)
  lineTotal Decimal @db.Decimal(12, 2)
  sortOrder Int @default(0)
}
```

Everything here beyond the scalar fields directly implied by observed form labels
(`prospectName`, `billingAddress`, `issueDate`, `validUntil`, `expectedDeliveryDate`,
`termsAndConditions`, `customerNotes`) is an `ASSUMPTION` (status enum values,
convert-to-sale fields, discount/tax modeling, sequential numbering).

## 11. API

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/quotations` | List, with `status`, `from`, `to`, `q`, `page`, `pageSize` query params |
| `POST` | `/api/quotations` | Create a new (`DRAFT`) quotation; server recomputes totals from DB product/customer data |
| `GET` | `/api/quotations/:id` | Fetch one quotation with store/customer/items/product |
| `PUT` | `/api/quotations/:id` | Update (only while `isEditable(status)`); replaces all items and recomputes totals |
| `DELETE` | `/api/quotations/:id` | Delete (blocked once `CONVERTED`) |
| `PATCH` | `/api/quotations/:id/status` | Status transition, validated against the allowed state machine; `CONVERTED` requires `ACCEPTED` |
| `POST` | `/api/quotations/calculate` | Stateless live-preview totals calculator used by the form while editing (not persisted) |
| `GET` | `/api/customers?q=` | Customer search/autocomplete for the "Existing customer" combobox |
| `GET` | `/api/products?q=` | Product search/autocomplete + barcode/SKU lookup for the Items picker |
| `GET` | `/api/stores` | Store list for the Store select |

No endpoints beyond what the observed UI needs were added (no auth API, no reporting API,
no Sale/inventory API — those belong to pages outside this task's scope).

## 12. States

All implemented and manually verified:

- **Loading** — `loading.tsx` skeletons for the list and detail routes (Next.js route-level Suspense).
- **Empty** — "No quotations found / Create a quotation or change the filters." on the list; "Add at least one product to prepare the quotation." on the item table.
- **Error** — `error.tsx` boundary for the quotations segment; `not-found.tsx` for a missing quotation id; every API failure surfaces as a `sonner` toast with the server's actual error message.
- **Success** — toasts on save/update/delete/status-change ("QT-000006 saved as draft", "Quotation updated", "QT-000005 deleted", "Status changed to Sent", …).
- **Form validation** — inline field errors + `aria-invalid` + a summary toast; see §7.
- **Saving** — Save button shows "Saving…" and disables itself; totals panel dims (`opacity-60`) while a live recalculation request is in flight.
- **Deleting** — confirm dialog, then "Deleting…" disabled state on the destructive button.
- **Disabled** — "Reset filters" disables itself once no filters are active; Edit/Delete/status actions are hidden entirely (not just disabled) once a quotation's status makes them illegal, per §6.

## 13. Unknown Behavior (consolidated)

Everything the reference recording never showed, listed once here for convenience (each
is also called out inline above where it's relevant):

- Login flow / auth model (site was unreachable; this rebuild has **no auth** — see
  Implementation Notes).
- Quotation number generation scheme.
- Full status list, and which transitions are legal.
- Exact tax/discount formula, and whether discount is % or fixed.
- Whether multiple taxes can apply to one line.
- Shipping / other-charges support.
- What the "Customer notes" field looks like once scrolled into view, and whether
  anything exists below it.
- Save behavior: does "Save draft" always create a `DRAFT`, or can a submitted quotation
  bypass draft entirely? What does a success/redirect look like?
- The saved-quotation detail page layout entirely.
- Edit-page layout/behavior for an existing quotation.
- Delete confirmation UI/copy.
- Print/PDF: whether a dedicated PDF is generated server-side, or it's browser
  print-to-PDF; what a printed quotation looks like.
- Convert-to-sale UI: where the trigger lives, what happens on insufficient stock, what
  the resulting sale looks like, whether it links back to the quotation.
- Table columns/sorting/pagination on the list (0 rows were ever present).
- Row action menu contents on the list.
- Barcode camera-scan behavior (`Camera` icon in the Items card).
- The two solid-orange icon buttons in the header (download-tray and monitor icons) —
  their destinations were never opened.
- Mobile/tablet layout of any page.
- Exact color hex values, font family name, and precise spacing scale (approximated
  visually from the recording only).

## 14. Implementation Notes

- **Stack**: the target repository (`azzaalkiyumi/mod`) was **completely empty** (no
  commits, no branches) at the start of this task, so there was no existing stack to
  respect. Built with the user's stated preferred stack: **Next.js 16 (App Router) +
  TypeScript + Tailwind CSS v4 + Prisma 7 + PostgreSQL + Zod + React Hook Form**, plus
  hand-written shadcn/ui-style components (Radix UI primitives + `class-variance-authority`
  + `tailwind-merge`) since the `shadcn` CLI's registry (`ui.shadcn.com`) was **also**
  network-blocked in this environment — every `src/components/ui/*` file was authored
  from scratch rather than fetched.
- **Database**: a local PostgreSQL 16 instance was started in the sandbox
  (`quotation_db` / user `quotation_app`); `.env` holds `DATABASE_URL` (gitignored). A
  fresh clone needs its own Postgres — see §16 "Running locally".
- **Auth**: out of scope for a page-scoped rebuild, and the reference login was
  unreachable anyway. `src/lib/current-user.ts` is an explicit stub returning the first
  seeded user, standing in for a real session; this is called out in a comment at its
  definition.
- **Prisma 7 specifics**: this version moved the datasource `url` out of `schema.prisma`
  into `prisma7.config.ts`, and the generated client requires an explicit driver adapter
  (`@prisma/adapter-pg`) rather than reading `DATABASE_URL` implicitly — both are wired up
  in `src/lib/prisma.ts` and `prisma/seed.ts`.
- **`prisma init` side effect**: running it auto-installed AI-agent "skill" documentation
  folders (`.claude/skills`, `.agents/skills`, `.windsurf/skills`, `skills-lock.json`,
  `AGENTS.md`, `CLAUDE.md`) unrelated to the app. Removing `.claude/` was blocked by this
  session's own safety classifier, so these were left in place rather than fought over —
  they are inert documentation, not application code.
- **npm install bug**: `npm@10.9.7`'s dependency resolver (`arborist`) crashed
  (`Cannot read properties of null (reading 'edgesOut')`) on this dependency set; every
  install in this project therefore uses `--legacy-peer-deps`.

## 15. Testing Results

Manually driven with Playwright (Chromium, pre-installed in this sandbox) against the
running dev server, screenshotting each step:

1. ✅ Open Quotations list — sidebar/header/breadcrumb render; seed data (5 quotations)
   displays with correct columns/badges/totals.
2. ✅ Search — "Number, customer, product, or SKU..." filters the list via URL query
   params (server-rendered, so it also works with JS disabled / on refresh).
3. ✅ Filter — Status select narrows results correctly (tested "Draft" → only Draft rows
   remained); From/To date range wired the same way.
4. ✅ Open an existing quotation — detail view renders customer/dates/addresses/items/
   summary correctly.
5. ✅ Create quotation — full form renders pixel-close to the four observed reference
   frames (verified side-by-side).
6. ✅ Select customer — combobox search works, auto-fills billing/shipping address from
   the customer record, customer's discount is picked up silently (no manual field, per
   §5/§6).
7. ✅ Add product — search-and-select and duplicate-prevention both work; barcode-scan
   input adds by exact SKU/barcode match on Enter.
8. ✅ Change quantity — live totals recompute via `/api/quotations/calculate`.
9. ✅ Change price — not a manual field (price is resolved from the product, matching
   "Prices... resolve automatically"); verified the resolved price displays and feeds the
   total correctly.
10. ✅ Discount — verified via customer selection (5% customer → correct discount amount
    shown and persisted) and via per-item discount value/type.
11. ✅ Tax — verified 15%/0% product tax rates flow into line tax and quotation tax total
    correctly.
12. ✅ Total calculation — spot-checked arithmetic by hand against the UI in three
    separate quotations; all matched the formula in §5.
13. ✅ Save quotation — `POST /api/quotations` returns 201, redirects to the new detail
    page, toast confirms.
14. ✅ Edit quotation — `?edit=1` pre-fills the same form component with existing data;
    `PUT` updates and recomputes; blocked entirely (server + hidden Edit button) once a
    quotation is not `Draft`/`Sent`.
15. ✅ Delete quotation — confirm dialog → `DELETE` → row disappears, toast confirms;
    blocked once `Converted`.
16. ✅ Status change — dropdown offers only legally-next statuses per the state machine in
    §6; `Accepted → Converted` exercises the "convert to sale" stub.
17. ✅ Print — "Print" button calls `window.print()`; sidebar/header/footer carry a
    `no-print` class so only the quotation content prints.
18. ✅ Validation — empty submit, negative quantity, duplicate product, and an invalid
    (earlier-than-issue) valid-until date were each triggered and correctly blocked with
    inline errors + toasts (see §7 for exact copy and screenshots taken during this
    session).
19. ✅ Responsive — desktop/tablet/mobile screenshots taken; mobile hamburger nav opens
    and navigates correctly; forms and tables reflow without horizontal page scroll.

No unresolved bugs remained after this pass. Two real bugs were found and fixed during
testing (both root-caused to the Next.js dev server holding a stale Prisma Client
singleton across a schema migration): a `NaN` discount total, and a "customer" it derives
from not yet having the new `Customer.discountType/discountValue` columns until the dev
server was restarted post-migration.

## 16. Running locally

```bash
# 1. PostgreSQL must be running and reachable at DATABASE_URL (see .env.example below)
createdb quotation_db   # or use an existing Postgres instance

# 2. Install dependencies (note --legacy-peer-deps, see §14)
npm install --legacy-peer-deps

# 3. Configure environment
cp .env.example .env
# edit .env if your DATABASE_URL differs from the default

# 4. Create the schema and seed demo data
npx prisma migrate dev
npx prisma db seed

# 5. Run the app
npm run dev
# → http://localhost:3000/admin/quotations
```
