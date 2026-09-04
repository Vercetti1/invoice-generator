# Invoice Generator

A client-side invoice builder: edit on the left, see a print-ready invoice on the right,
then **Export PDF** to save it. Built with Vite + React + TypeScript + Tailwind CSS v4.

## Running

```bash
npm install
npm run dev
```

Other scripts: `npm run build`, `npm run lint`, `npm run preview`.

## How it works

**Money is integer cents.** Every amount is stored as `Cents` (a whole number of minor
units) so totals never accumulate float error. Conversion happens only at the edges —
`parseAmountToCents` on input, `formatMoney` (via `Intl.NumberFormat`) on output.

**Tax and discount order of operations** (`src/lib/calc.ts`):

1. Line totals — `round(quantity × unitPrice)` per line.
2. Discount — percentage or fixed amount, applied to the subtotal and clamped so it
   can never exceed it.
3. Tax — charged only on lines marked taxable. The discount is **prorated** across
   taxable and non-taxable lines by their share of the subtotal, so discounting a
   non-taxable line doesn't wrongly shrink the tax base.

Two tax treatments are supported:

| Mode | Meaning | Tax formula |
| --- | --- | --- |
| `exclusive` | Prices are pre-tax; tax is added on top | `base × rate / 100` |
| `inclusive` | Prices already contain tax; it's extracted for display | `base × rate / (100 + rate)` |

**PDF export uses native print** (`window.print()`) rather than rasterising the DOM to a
canvas. Text stays vector — sharp at any zoom, and selectable/searchable in the PDF. The
`@media print` block in `src/index.css` hides the editor chrome (`.no-print`), strips the
sheet's screen styling, and unwinds the full-height flex layout back to block flow so long
invoices paginate instead of clipping at one page.

**Drafts autosave** to `localStorage` on every edit, merged over defaults on load so an
older saved draft stays usable after the shape changes.

## Layout

```
src/
  types.ts              Invoice, LineItem, Discount, TaxMode, Totals
  lib/
    money.ts            cents <-> display conversion, rounding
    calc.ts             totals: line -> discount -> prorated tax
    storage.ts          localStorage persistence + seed invoice
  components/
    Editor.tsx          left panel, all form sections
    Fields.tsx          form primitives (text/number/select/textarea)
    NumericInput.tsx    money & quantity inputs that keep a text draft while focused
    LineItemsEditor.tsx line item rows
    InvoicePreview.tsx  the printed sheet
  App.tsx               shell, state, autosave, print trigger
```

## Ideas for next steps

- Export/import the invoice as JSON, and support multiple saved invoices.
- Per-line tax rates instead of one invoice-wide rate.
- Logo upload, and a couple of alternative sheet templates.
- Unit tests over `computeTotals` — it's pure, so the rounding edge cases are easy to pin down.
