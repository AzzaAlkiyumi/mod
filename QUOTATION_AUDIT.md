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
  imageUrl String?
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
- **Internationalization (English/Arabic) and RTL/LTR**, added after the initial
  rebuild, at the user's request: the reference recording's header shows a functioning
  "LANGUAGE" selector (English/العربية) but the recording never actually switches it, so
  the *existence* of bilingual support is confirmed but its exact translated copy is
  `UNKNOWN` — every Arabic string in `src/i18n/dictionaries/ar.ts` is this rebuild's own
  translation, not the reference's.
  - **Architecture**: a lightweight custom dictionary system (no `next-intl`/`react-intl`
    dependency) — `src/i18n/dictionaries/{en,ar}.ts` are plain objects (`ar.ts` is typed
    `satisfies Dictionary` against `en.ts` so a missing key is a compile error), resolved
    per-request server-side via `getLocale()` (cookie, else `Accept-Language`, else
    English) and `getDictionary()`. `src/proxy.ts` (Next.js 16 renamed `middleware.ts` to
    `proxy.ts`) persists the auto-detected locale into a `NEXT_LOCALE` cookie on a
    visitor's first request. The header's language `<Select>` is a real, working control
    (`language-switcher.tsx`) that rewrites the cookie and calls `router.refresh()`.
  - **Server/Client boundary gotcha**: the dictionaries contain functions (for
    parameterized strings like "QT-000006 deleted"), and React Server Components cannot
    serialize functions into Client Components. `DictionaryProvider`
    (`src/i18n/dictionary-context.tsx`) therefore passes only the `locale` string through
    context; each Client Component calls the pure `getDictionary(locale)` itself via the
    `useDictionary()` hook, while Server Components (`page.tsx` files) call it directly.
  - **`dir="rtl"`/`dir="ltr"`** is set once, on `<html>`, from the resolved locale. Layout
    mostly self-mirrors for free because Tailwind's `flex`/`grid` respect the CSS
    `direction` property; the deliberate fixes on top of that were: logical properties
    (`ps-`/`pe-`/`ms-`/`me-`/`start-`/`end-`/`border-e`) in place of physical
    `pl-`/`pr-`/`ml-`/`mr-`/`left-`/`right-`/`border-r` wherever a component's own
    one-off className string set them (safe to rewrite outright); an explicit
    `rtl:left-auto rtl:right-0` override for the mobile-nav drawer's slide-in edge, since
    it *merges into* a shared `Dialog` base class via `cn()` and mixing a physical
    `left-*` override with a logical `start-*` one against that same base risked an
    unpredictable win between the two depending on Tailwind's internal utility-ordering
    (physical-vs-physical, `left-0` vs `left-1/2`, is a guaranteed, unambiguous override);
    `rtl:-scale-x-100` on the form's "back" arrow icon so it visually points the correct
    reading direction; `text-end` instead of `text-right` for numeric table columns.
  - **Arabic typography**: `Noto Sans Arabic` (via `next/font/google`) is layered in for
    `:dir(rtl)` content, falling back to the existing Geist/system sans stack.
  - **Bidi bug found and fixed during QA**: an ISO date (`2026-09-09`) interpolated
    *inline* inside a translated Arabic sentence (e.g. "Issued 2026-09-09 from Main
    Store") visually reordered itself to `09-09-2026` — a well-known Unicode Bidi
    Algorithm artifact where a run of digit-groups separated by hyphens has no strong
    directional character to anchor it, so it inherits reordering from the surrounding
    RTL paragraph. Fixed by wrapping such interpolated values in Unicode directional-
    isolate marks (U+2066/U+2069) inside `ar.ts` (see the `ltr()` helper there) — dates
    shown standalone in their own cell/field (not embedded in a sentence) were unaffected
    and needed no change. Quotation numbers and product/customer names embedded the same
    way were checked and found *not* affected, because they start with a strong-LTR
    Latin letter that anchors the whole run.
  - Currency/date formatting itself (`formatCurrency`/`formatDate` in `src/lib/utils.ts`)
    stays locale-invariant — the reference UI shows plain `YYYY-MM-DD` dates and `$`
    amounts regardless of language, so no per-locale number formatting was introduced.
- **Redesigned Print/PDF document** (`/quotation-preview/[id]`, rendered by
  `src/components/quotation/preview/quotation-print-preview.tsx`), added at the user's
  request after they supplied a reference invoice image (a Technical Line/TIS company
  invoice) to model the layout on: A4-sized document, red in place of black for headings/
  accents (scoped to this document only — the rest of the site's orange primary color is
  untouched), items table with `Item / Description / Product Image / Qty / Unit Price /
  VAT / Total With VAT` columns, single-language display that follows the site's current
  locale (no English/Arabic mixing), and print-only CSS (`@page { size: A4; margin: 0 }`,
  `print-color-adjust: exact` so background colors survive browsers that default to
  stripping them, `break-inside: avoid` on rows). The Print button on the real Quotation
  page/list (`quotation-detail-actions.tsx`, `quotation-row-actions.tsx`) opens this route
  in a new tab, which auto-triggers `window.print()` on load — no intermediate preview
  banner or manual toggle. Every value on the document is read from existing
  Quotation/Customer/Store/Product data; nothing is invented.
- **Product photo, tied to the Product record** (`Product.imageUrl`, added this round):
  the reference site's real catalog/POS pages (confirmed by a second screen recording of
  `hyper-pos.eshopweb.store/cashier`) show a small photo next to every product, with a
  colored letter-avatar fallback for products that have none — so a product's image is
  catalog data, not something uploaded per-quotation. This rebuild had **no** product
  image storage at all (`Product` had no image field, and there is no product-catalog
  admin page in this app — only `/api/products`, used by the quotation item search), so
  a nullable `Product.imageUrl String?` was added (migration
  `20260913082459_add_product_image_url`) — the smallest change that lets a quotation
  show "the product's own photo" rather than a mockup. `src/components/quotation/
  product-thumb.tsx` is the shared thumbnail (real `<img>`, or a neat dashed-border
  placeholder icon when `imageUrl` is null) used everywhere a product appears in the
  quotation flow: the product search dropdown, the selected-items row in the create/edit
  form, the Items table on the quotation detail page, and the print/PDF document's
  "Product Image" column. Demo products in `prisma/seed.ts` reference local SVG files
  under `public/products/`; one seeded product is deliberately left without an
  `imageUrl` to exercise the placeholder path.

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
20. ✅ Language/RTL — `Accept-Language: ar` auto-detected on first visit (`<html
    dir="rtl" lang="ar">` confirmed via `document.documentElement`); the header's
    language `<Select>` switches live between English/Arabic and back without a full
    reload, correctly toggling `dir` and every string each time; screenshotted the list,
    detail, create-form, customer-search popover, and mobile nav in Arabic — sidebar,
    header, table columns, form fields, and the mobile drawer's slide-in edge all mirror
    correctly; the English layout was re-screenshotted afterward to confirm no
    regressions.

No unresolved bugs remained after this pass. Three real bugs were found and fixed during
testing: two root-caused to the Next.js dev server holding a stale Prisma Client
singleton across a schema migration (a `NaN` discount total, and a "customer" it derives
from not yet having the new `Customer.discountType/discountValue` columns until the dev
server was restarted post-migration); and one Unicode bidi reordering bug on Arabic dates
embedded inline in a sentence, fixed as described in §14.

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

## 17. Point of Sale (`/admin/pos`) — beyond the original Quotation scope

Everything above this section covers the original task (rebuild the Quotation page).
The sidebar's other links (Dashboard, POS, Sales History, ...) were left as 404s by
design — see §14 — until the user explicitly asked to build the POS page too. This
section documents that addition.

- **Scope chosen**: the user picked "fully functional, not a pixel-exact match" over a
  minimal demo or a full match of the reference recording's payment sheet (QR/UPI/Bank
  Transfer/Cheque, Hold orders, camera barcode scan, receipt printing). So `/admin/pos`
  really persists a `Sale` to the database on checkout, but keeps the payment method to
  a two-option `PaymentMethod` enum (`CASH`/`CARD`) and the barcode field to manual entry
  (matching the precedent already set by the Quotation item search's own non-camera
  barcode field).
- **New database model**: `Sale`/`SaleItem`, mirroring `Quotation`/`QuotationItem`'s
  shape but simpler — no draft/status workflow (a sale is an immediate, one-shot
  transaction), no discount (kept out of scope). `Product.category` (nullable string)
  was also added, purely so the POS grid has something to build filter chips from — a
  full category CRUD was judged out of scope. Migration
  `20260913084721_add_pos_sales`.
- **UI**: `src/app/admin/pos/page.tsx` (server — fetches the full product catalog and
  store list) renders `src/components/pos/pos-view.tsx` (client): search + manual
  barcode entry, category filter chips, a product grid using the same `ProductThumb`
  component the Quotation flow uses (so a product's photo is consistent everywhere it
  appears), and a cart/checkout panel (quantity steppers, optional walk-in/customer
  picker reusing `CustomerSelector`, store, payment method, totals, "Complete sale").
  `CustomerSelector` gained an optional `emptyLabel` prop so POS can show "Walk-in
  customer" instead of the Quotation form's "Use prospect details" copy, without
  affecting the Quotation form's own default.
- **API**: `POST /api/sales` (`src/app/api/sales/route.ts`) recomputes price/tax
  server-side from the database (never trusts the client's copy), reusing
  `calculateQuotationTotals` purely for its per-line math. `GET /api/products` gained
  optional `category` and `take` (`take=all` for the POS grid's full-catalog fetch)
  query parameters, additive to its existing quotation-item-search usage.
- **Verified**: browsing/searching/category-filtering, add/remove/adjust-quantity,
  checkout persists a `Sale`+`SaleItem`s with correct totals (spot-checked against the
  database directly), the empty-cart guard disables "Complete sale", English/LTR and
  Arabic/RTL both render and calculate correctly, and the Quotation form's own customer
  selector was re-checked to confirm it still defaults to its original copy.

## 18. Real company data, OMR currency, and a bilingual print mode

The user supplied their own company's real invoice (TECHNICAL LINE / TIS, Oman) as a
reference and asked for the Quotation print document to match it "to the letter," using
their real data. Three decisions this required were put to the user explicitly before
implementing (each conflicted with, or went well beyond, an earlier instruction) —
their answers, and what was built:

1. **Language display**: the reference invoice shows Arabic and English together
   throughout — directly at odds with the earlier "one language only, matching the
   site's selection" rule. Resolution: the print document still *defaults* to the
   site's current language (unchanged, single-language behavior — same as before), but
   now has an English / Arabic / Both toggle (`quotation-print-preview.tsx`, no-print
   UI) so the user can switch to a bilingual rendering — every label, table header, and
   total shown in both languages, stacked — on demand. The toggle is local `useState`,
   defaulting to `initialLang`; only the initial site-language render auto-prints,
   matching prior behavior.
2. **Company data**: the invoice's legal/registration details (C.R No., P.O. Box,
   VAT No., address, mobile, email — real values, not invented) had nowhere to live —
   `Store` had no such fields, and the user had earlier explicitly asked not to add a
   Settings screen for company data. Resolution: added nullable fields directly to
   `Store` (`legalNameEn/Ar`, `crNumber`, `poBox`, `countryEn/Ar`, `addressEn/Ar`,
   `vatNumber`, `mobile`, `email`, `logoUrl` — migration
   `20260913090000_omr_currency_and_company_data`) and seeded them with the user's real
   values (`prisma/seed.ts`) — still no Settings screen. `legalNameAr` is left `null`:
   the reference invoice never gave a separate Arabic company name, only labels, so
   none was invented. The print header (`quotation-print-preview.tsx`) reads these
   fields and renders C.R/P.O.Box/VAT/Mobile/Email as labeled rows and
   country/address as plain lines, all through the same language-mode toggle as
   everything else on the document.
3. **Currency**: the reference invoice is in Omani Rial (OMR, 3 decimal places/baisa),
   while the app used USD (2 decimals) everywhere. Resolution (app-wide, not just the
   print document, per the user's choice): every monetary `Decimal` column widened from
   `(12,2)` to `(12,3)` (same migration as above — a safe, non-lossy precision
   widening), `calculateQuotationTotals`'s internal rounding moved from 2 to 3 decimal
   places, and `formatCurrency()` (`src/lib/utils.ts`) now always formats OMR
   (`Intl.NumberFormat` with `currency: "OMR"`, `numberingSystem: "latn"` so digits stay
   Western/Hindu-Arabic in both languages, matching the reference), taking a
   `locale: "en" | "ar"` parameter instead of a currency code — every call site across
   Quotation (list/detail/form/summary/print) and POS was updated to pass the current
   locale (client components via `useDictionary()`'s `locale`; server components via an
   explicit `locale` prop threaded from `getLocale()`). The seed's Standard VAT rate was
   also changed from 15% to 5% to match Oman's actual VAT rate and the reference
   invoice — a data-only change, not requested outright but a direct consequence of
   grounding the demo data in the same real-world context as the currency/company
   changes.
- **Bug found and fixed while re-seeding**: `prisma/seed.ts`'s cleanup order deleted
  `Product` rows before the `Sale`/`SaleItem` tables added in §17, which reference
  `Product` — a foreign-key violation on every re-seed after that point. Fixed by
  deleting `SaleItem`/`Sale` before `Product` in the cleanup sequence.
- **Company logo**: the reference invoice's circular "TiS" gradient logo mark could not
  be extracted as a reusable image asset in this environment (it was only ever seen
  inline in an uploaded screenshot, not as a separate file), so the print header keeps
  the existing simple brand-icon block rather than approximating that specific graphic.
  `Store.logoUrl` exists and is read by the header if the user later provides a real
  logo file to store there.
- **Verified**: the print document in English, Arabic, and Both modes (company header,
  bilingual column headers/totals/footer, OMR amounts); the live Quotation list, detail,
  form, and summary in both languages showing OMR with 3 decimals; the POS page's
  catalog/cart/totals in OMR; and a full create → edit → status-change → delete
  Quotation cycle plus a POS sale, all with correct 3-decimal totals and no console
  errors.

## 19. Real Products admin page — list + create, built on the approved schema change

Per explicit request, a redesigned "Add Product" form was first built and iterated as
an isolated preview (`/admin/product-preview/new`,
`src/components/products/product-form-preview.tsx`) before touching any real code —
at that point there was no real Products admin page in this app at all (the sidebar's
"Products" link 404s; only `/api/products` existed, used by the Quotation/POS item
search).

After review, the user approved one specific, scoped schema change beyond the existing
`Product` model: bilingual product name and description, entered manually (no
auto-translation), with **both languages' fields shown together on the form — no
language-switch toggle**. Every field the earlier draft had invented beyond what
already exists (Short description, Brand, Available-for-sale, Featured) was removed.

**Schema change**: added `nameAr`, `descriptionEn`, `descriptionAr` — all nullable
`String` — directly to the existing `Product` model. No new table. Migration
`20260913185322_add_bilingual_product_name_description`.

**Real implementation (this round)**, per the user's follow-up approval to build the
real thing at the existing, nav-linked location (`/admin/products`, already present in
`nav-config.ts`) rather than a separate path:

- `POST /api/products` (added to the existing `route.ts`, which already had `GET` —
  used unchanged by Quotation/POS item search): validates via
  `src/lib/validations/product.ts` (Zod), auto-generates a sequential SKU
  (`src/lib/product-sku.ts`, mirrors `generateQuotationNumber()`/`generateSaleNumber()`)
  when left blank, verifies an optional `taxId` still exists, and returns a friendly
  409 on a duplicate SKU/barcode (Prisma `P2002`).
- `/admin/products` — real list page (server component): table of real products
  (thumbnail, English + Arabic name, SKU, category, unit, tax, price), category filter,
  and search by name/SKU/barcode. Read-only — no edit/delete, since none was requested.
  Reuses the same `Table` primitive and list/filter/loading/error shell pattern as the
  Quotations list.
- `/admin/products/new` — real create page. The preview component was promoted into
  `src/components/products/product-form.tsx`, wired to a real `fetch("/api/products",
  { method: "POST" })` call in place of the preview's simulated `setTimeout`, with real
  loading/success/error states and the 409-duplicate case surfaced as a toast. Strings
  moved out of the preview's local `STRINGS` object into the global i18n dictionaries
  (`t.products.list` / `t.products.form` in `en.ts`/`ar.ts`), matching how every other
  page in the app is translated.
- The preview route and component (`/admin/product-preview/new`,
  `product-form-preview.tsx`) were removed now that the real page replaces them —
  there is exactly one Add Product page in the app, at the existing nav-linked path.
- Fixed a pre-existing breadcrumb bug surfaced by adding a second `/new` route:
  `app-header.tsx`'s breadcrumb hard-coded the Quotation form's "New quotation" title
  for any path ending in `/new`. Made it section-aware so `/admin/products/new` shows
  "New product" (Arabic: "منتج جديد") instead.

**Verified this round** (fresh `prisma generate` + dev server restart was required
first — the running dev server predated the migration and still had the stale
generated Prisma client, which briefly caused a 500 on save with "Unknown argument
`nameAr`"; this is the same stale-client class of issue noted elsewhere in this
document, not a code defect): created a product with English + Arabic name and
description via the real form, confirmed it saves (auto-generated SKU `PRD-000009`)
and appears in the products list without duplication; confirmed client-side validation
blocks an empty submit with the highlighted-fields message; repeated the create flow
under `NEXT_LOCALE=ar` and confirmed full RTL layout, `dir="rtl"` on the document, and
the Arabic name/description round-tripping correctly; confirmed no horizontal page
scroll on a 390px mobile viewport for both the list and the create form (the table's
own internal `overflow-x-auto` scroll container is identical to the pre-existing
Quotations table, not a new behavior); confirmed `/admin/quotations` and `/admin/pos`
both still return 200 with zero console/page errors — neither was modified beyond the
shared, backward-compatible `GET /api/products` route file gaining an unrelated `POST`
export.

`npx tsc --noEmit` and `npm run lint` were run clean after every file change in this
round.

## 20. Quotation print preview now shows a product's Arabic name/description

Follow-up, explicitly approved before touching this file: the user pointed out that
switching a quotation's print preview to Arabic left the line-item "Description"
column showing the product's English name — the print preview
(`quotation-print-preview.tsx`) had never been updated to use `Product.nameAr`/
`descriptionAr` after those columns were added in §19.

**Scope, exactly as approved**: only this print document changed — no schema,
Quotation calculation, POS, or any other Quotation UI was touched.

- Arabic mode (`ar`): the line item now shows `product.nameAr` (falling back to the
  English `name`, unchanged, for a product with no Arabic name) as the bold line, plus
  `product.descriptionAr` as a small muted line beneath it when present.
- "Both" mode: shows the site-language name first (bold) with the other language
  stacked beneath it (muted) — same convention this file already used for the store's
  bilingual address/country fields — plus the Arabic description if the product has
  one.
- English mode (`en`): byte-for-byte unchanged — no description line was shown before
  and none is added now, per the user's explicit request to leave untranslated/English
  behavior exactly as it was.
- `to-preview-quotation.ts`'s `PreviewQuotation` type and mapper were extended to pass
  `nameAr`/`descriptionEn`/`descriptionAr` through (the underlying Prisma query already
  fetches the full `Product` row via `include`, so no query changes were needed).

**Verified**: created a real quotation against a product with both `nameAr` and
`descriptionAr` set and confirmed Arabic mode shows the Arabic name + description,
"Both" mode shows the bilingual stack, and English mode is identical to before;
created a second quotation against a seeded product with no Arabic translation and
confirmed Arabic mode falls back to the English name with no extra description line,
matching the exact pre-change behavior for untranslated products. `npx tsc --noEmit`
and `npm run lint` both clean.

## 21. Add Product form expanded to 4 tabs (General/Inventory/Pricing & Tax/Compliance)

Follow-up, driven by a second reference video of the real site's New Product page
(previously only the General tab had been seen — this video also showed Inventory,
Pricing & Tax, and Compliance). Built as an isolated preview first
(`/admin/product-preview/new`, `product-form-preview-v2.tsx`, screenshots shared with
the user in both languages), then approved ("طبقها" — apply it) and promoted into the
real `/admin/products/new` page.

**Explicitly excluded**, per direction, from the reference's own Pricing & Tax and
Inventory tabs: **per-store pricing** and **per-store shelf locations** — this
business prices and stocks identically across its stores, so no `Store`-scoped
override table was added.

**Schema — 17 new nullable/defaulted columns on `Product`** (migration
`20260913202218_add_product_general_inventory_pricing_compliance`, purely additive,
verified with `prisma migrate deploy` — no data loss, existing rows got the column
defaults):

- General: `shortDescription`, `availableForSale` (default true), `featured` (default
  false)
- Inventory (display/config only — no stock ledger exists in this app, so these don't
  drive real quantity tracking): `trackStock` (default true), `soldByWeight`,
  `trackBatches`, `trackExpiry`, `expiryDate`, `reorderAt`, `reorderQuantity`
- Pricing & Tax: `costPrice`, `mrp` (for margin display only — never used in
  Quotation/POS price calculations, which still use `price` exclusively),
  `priceIncludesTax`
- Compliance: `hsnCode`, `drugSchedule` (default `"NOT_SCHEDULED"`, one of the
  reference's six values — kept even though this business doesn't sell scheduled
  drugs, per explicit request to mirror the tab's content), `genericName`,
  `manufacturer`

**"Easy to use" design**, per the user's explicit concern about a 4-tab form: only
the General tab's existing required fields (name, category, unit, price) are
mandatory — every new field across all four tabs is optional with a sensible default,
so the "just add a product fast" flow is byte-for-byte the same four fields as before.
Margin/Markup/Profit-per-unit in the Pricing & Tax tab are computed client-side from
`price`/`costPrice`, not stored columns.

**Verified**: full flow filling all four tabs end-to-end — created a product with
values in every new field and confirmed every one round-tripped exactly via the API;
separately created a product touching only the four original General fields (the
"quick path") and confirmed it saves with all-defaults on the rest, identical to the
pre-this-change behavior; confirmed a product created before this migration
(`Wireless Mouse`) now reads back with the new columns at their defaults
(`availableForSale: true`, `drugSchedule: "NOT_SCHEDULED"`, etc.) rather than erroring;
confirmed `/admin/pos` and `/admin/quotations/new` still render with zero console
errors and the POS grid still lists every product, new fields included, without
layout breakage. The preview route/component were removed once the real page replaced
them. `npx tsc --noEmit` and `npm run lint` clean throughout.

## 22. Real catalog taxonomy — Categories, Brands, Units, Unit Categories (Product Setup)

Driven by a third reference video showing the site's **Product Setup** sidebar section
with four full CRUD pages (Categories, Brands, Units, Unit Categories), each a
list + right-side detail-panel layout. The user explicitly approved building all four
for real, and — critically — **linking `Product.category`/`Product.unit` to these new
tables** (`categoryId`/`unitId`) instead of the free-text strings used since §19. Also
approved: a `brandId` relation on Product (a natural consequence of building a real
Brands page — an unlinked one would be pointless), and putting "Product Setup" in the
sidebar as one ordinary link (this app's sidebar has no expand/collapse mechanism to
begin with, so "not a dropdown" was automatically satisfied by adding it as a normal
`nav-config.ts` entry rather than inventing one).

**Explicitly excluded**, per direction, from the reference's fuller Categories page:
per-store tax overrides beyond the one `taxId` already modeled, and multi-level
category trees beyond one parent/child level (the schema's self-relation supports
deeper nesting; nothing in the UI restricts it, but it was only ever exercised one
level deep, matching the reference).

**New models** (`prisma/schema.prisma`): `UnitCategory` (name, slug, sortOrder,
active), `Unit` (shortCode, displayName, measurementCategoryId → UnitCategory,
optional self-referential baseUnitId/conversionFactor for future unit conversion —
not used in any calculation), `Category` (name, iconColor, optional taxId → Tax,
optional self-referential parentId for one level of nesting, active), `Brand` (name,
logoUrl, description, active).

**Migrating `Product.category`/`Product.unit` from strings to relations — done in two
separate migrations, never one, to avoid any data loss**:
1. Stage 1 (`20260913205435_add_catalog_taxonomy_stage1`, purely additive): create the
   four new tables; add nullable `categoryId`/`unitId`/`brandId` columns to `Product`
   alongside temporary relation fields (`categoryRef`/`unitRef`), while the old
   `category`/`unit` string columns stayed untouched.
2. A one-off script (`prisma/backfill-catalog.ts`, run once via `tsx` then deleted —
   not part of the regular seed flow) read every distinct existing `Product.unit` /
   `Product.category` string, created one real `Unit`/`Category` row per distinct
   value (units bucketed into Count/Weight/Volume/Length/Time by a simple name
   heuristic), and set every product's new `unitId`/`categoryId` to match. Verified
   with a direct SQL join that every product's new relation resolved to the exact
   same value as its old string before proceeding.
3. Stage 2 (`20260913205634_add_catalog_taxonomy_stage2`, hand-written — Prisma's own
   `migrate dev` refuses to even generate a migration file non-interactively once it
   detects the destructive "dropping a column with non-null values" warning, so this
   migration's SQL was written by hand and applied via `migrate deploy`): drop the now
   only-used-as-source-of-truth-once old `category`/`unit` string columns, and make
   `unitId` `NOT NULL` (every row was already backfilled, so this was safe).
   `schema.prisma` was rewritten in the same step to its final shape (`unit`/`category`
   as the real relation field names, replacing the temporary `unitRef`/`categoryRef`).

**Every call site updated** (mapped exhaustively first via a research pass before
touching any code, to avoid missing one): `prisma/seed.ts` (seeds UnitCategories/a
`pcs` Unit/Categories before products, references `unitId`/`categoryId`);
`src/lib/validations/product.ts` (`categoryId`/`unitId`/`brandId` replace the old
`category`/`unit` string fields — `unitId` required, `categoryId` required matching
the old field's required-in-practice UX, `brandId` optional); `src/app/api/products/
route.ts` (`GET` now filters by `?categoryId=`, not a category name string; `POST`
validates `unitId`/`categoryId`/`brandId` actually exist before creating, matching the
existing `taxId` check); `src/lib/types.ts` (`ProductWithTax` and `QuotationDetail`
now `include` the `unit`/`category`/`brand` relations they need); `product-form.tsx`
(Category and Unit are now real `<Select>` dropdowns over the managed tables, not a
free-text `<datalist>`/"type your own unit" escape hatch — plus a new optional Brand
dropdown); `product-table.tsx`/`product-filters.tsx`/`admin/products/page.tsx` (list,
filter, and the "new product" page's dropdown sources all read from the real
`Category`/`Unit`/`Brand`/`Tax` tables now, not `distinct()` over existing product
rows — which also fixes a latent bug where a category/unit could only ever appear in
a dropdown if at least one product already used it); `quotation-form.tsx` and
`admin/quotations/[id]/page.tsx` (the quotation cart's per-line "12.990 / pcs" unit
label now reads `product.unit.displayName` instead of a plain string column);
`admin/pos/page.tsx` (POS grid's category filter chips and cart line unit label —
`pos-view.tsx` itself needed no changes, since its `POSProduct` shape already modeled
`unit`/`category` as plain display strings, and the server page now resolves those
strings from the real relations before handing them to the client component).

**New CRUD API routes**: `/api/categories`, `/api/brands`, `/api/units`,
`/api/unit-categories` (each with a `GET`/`POST` at the collection route and a
`PATCH`/`DELETE` at `/[id]`), validated with new Zod schemas in
`src/lib/validations/catalog.ts`. A `P2003` (foreign-key violation) on delete returns
a friendly "still in use" error instead of a raw 500 (e.g. deleting a Category that
products still reference). Brand logo upload reuses the same pattern as the product
image upload from §20 (`/api/uploads/brands`, same JPG/PNG/WebP + 5MB validation,
writes to `public/uploads/brands/`).

**New `/admin/product-setup` page**: one route, one client-side tab bar (Categories /
Brands / Units / Unit Categories — no separate sidebar links, no dropdown), each tab a
list-on-the-left + detail-panel-on-the-right layout mirroring the reference exactly.
Selecting a row loads it into the detail form; "New" opens a blank one; Save does a
real `POST`/`PATCH` and refreshes; Delete goes through a confirmation dialog (reusing
the existing `Dialog` primitive, matching the Quotation delete-confirmation pattern)
before calling `DELETE`. Sidebar entry added as one ordinary `Products` group item
(`nav-config.ts`), linking to `/admin/product-setup` — the sidebar already had no
expand/collapse behavior for any group, so this reads as a normal link like every
other item, not a dropdown.

**Verified**: full CRUD round-trip on all four Product Setup tabs (create a
UnitCategory, create a Unit under it, create a Category, create a Brand — all
persisted and listed correctly, zero console errors); created a product through
`/admin/products/new` picking the new Category/Unit from real dropdowns and confirmed
it saved and displays the resolved names in the products list; confirmed the products
list's category filter dropdown and the POS grid's category filter chips both
correctly filter using the new relations (a product outside the selected category
disappears from the POS grid); added a pre-existing product (`Wireless Mouse`,
migrated from the old string-column data) to a new quotation and confirmed its unit
still shows correctly ("OMR 12.990 / pcs") and the quotation saves successfully end to
end with correct tax/total calculation; confirmed `/admin/product-setup` renders
correctly under `NEXT_LOCALE=ar` (full RTL mirroring, tab bar and both panes flipped)
and at a 390px mobile viewport (two-pane layout stacks vertically, no horizontal
scroll). `npx tsc --noEmit` and `npm run lint` clean throughout, including immediately
after the schema/migration changes (which surfaced the exact set of now-broken call
sites the research pass had predicted, one-for-one).
