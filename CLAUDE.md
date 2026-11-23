@AGENTS.md

# Brand colors (mandatory)

The UI uses only these colors. Do not add any other color, in a class, a style or a constant.
The tokens are defined in `app/globals.css` (`@theme`). Use the token classes, not raw hex values.

| Role | Hex | Token class |
|---|---|---|
| Primary (buttons, links, prices, active states, icons) | `#38C792` | `bg-primary`, `text-primary`, `border-primary` |
| Secondary (soft fills, active chips, selected rows, info boxes) | `#ADE3CF` | `bg-secondary`, `border-secondary` |
| Main text | `#202939` | `text-ink` |
| Secondary text (hints, labels, placeholders, struck-out prices) | `#697586` | `text-muted` |
| Borders and dividers | `#F7F5F3` | `border-line`, `divide-line` |
| Filter chip border (All, categories, statuses) | `#CECECE` | `border-chip` |
| Disabled button | `#38C79280` | `disabled:bg-primary-disabled` |

Layout surfaces:

- Left navigation rail (profile, chat icons), the chat space and the middle canvas: `#F7F5F3` (`bg-surface`).
- Top bar (header) and the right-hand side panel: `#FFFFFF` (`bg-panel` or `bg-white`).
- Cards on the chat space are white (`bg-white`), so they stand out from `#F7F5F3`.

Rules:

- Hover on a primary button: `hover:bg-primary/90`. Do not invent a darker green.
- Opacity of a palette color (`bg-secondary/60`, `bg-muted/40`) is allowed. A new hue is not.
- A disabled primary button uses `disabled:bg-primary-disabled`, not `disabled:opacity-50`.
- Text on a primary or secondary fill is white or `text-ink`.
- Every green + button and the Join Now button use `btn-raised` (2px white border and a soft shadow, in
  `app/globals.css`): a filled `bg-primary` circle with a white +. Do not draw outlined + buttons.

Allowed exceptions (meaning, not decoration). Use these only for the purpose given:

- Error or danger (delete, failed, blocked): `#d64545`, with light fills `#fdecec` and `#fde8e8`.
- Warning (amber `#b7791f`, fill `#fff4e5`).
- Rating stars: `#f5a524`.
- Payment brand marks: bKash `#e2136e`, Nagad `#f6921e`.
- The names of chat participants (`NAME_COLORS` in `MessageBubble.tsx`).
- Dark-mode colors (`dark:` and `isDarkMode` branches) are not covered by this palette yet.

# Icons (mandatory)

- Every UI icon comes from Hugeicons (https://hugeicons.com/icons), through `@hugeicons/core-free-icons` and
  `<HugeiconsIcon>` from `@hugeicons/react`. Do not add icon files to `public/` or use another icon set.
- `public/` keeps only pictures that are not icons: the brand logo, store badges, the QR code, illustrations.
- Left-rail icons use `RailIconButton` / `railIconClass` (`components/super-app/RailIconButton.tsx`):
  selected = `bg-secondary` circle with a white border around it; not selected = no background.

# One layout (mandatory)

- The app is one page (`app/page.tsx`): rail, sidebar list, canvas, right panel. A tab changes only the components and
  data inside these four areas, never their size, fonts or colors.
- Every staff sidebar header is `StaffSidebarHeader` (`components/super-app/admin/AdminProfileHeader.tsx`): 44px photo,
  15px name, role badge, 40px green +. Do not build another profile header.
- Buttons: 40px high, `text-[14px] font-semibold`, `rounded-[10px]`. The one larger action is the Tap to Schedule bar.
- Every row of filters or tabs (sidebar filters, Overview · FAQ · How to Order · Review · Details, editor tabs) is
  `ChipRow` / `filterChipClass` (`components/super-app/ChipRow.tsx`). Do not style a new chip or tab by hand.
