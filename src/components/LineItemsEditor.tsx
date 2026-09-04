import type { LineItem } from '../types'
import { lineTotal } from '../lib/calc'
import { formatMoney } from '../lib/money'
import { newId } from '../lib/storage'
import { MoneyInput, QuantityInput } from './NumericInput'

type Props = {
  items: LineItem[]
  currency: string
  locale: string
  onChange: (items: LineItem[]) => void
}

export function LineItemsEditor({ items, currency, locale, onChange }: Props) {
  const update = (id: string, patch: Partial<LineItem>) =>
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)))

  const remove = (id: string) => onChange(items.filter((item) => item.id !== id))

  const add = () =>
    onChange([...items, { id: newId(), description: '', quantity: 1, unitPrice: 0, taxable: true }])

  return (
    <div>
      <div className="grid grid-cols-[1fr_4.5rem_6.5rem_2.5rem_2rem] items-center gap-2 px-1 pb-1.5 text-[11px] font-medium tracking-wide text-slate-500 uppercase">
        <span>Description</span>
        <span className="text-right">Qty</span>
        <span className="text-right">Unit price</span>
        <span className="text-center" title="Apply tax to this line">
          Tax
        </span>
        <span />
      </div>

      <div className="space-y-1.5">
        {items.map((item) => (
          <div key={item.id} className="grid grid-cols-[1fr_4.5rem_6.5rem_2.5rem_2rem] items-center gap-2">
            <input
              value={item.description}
              placeholder="What are you billing for?"
              onChange={(event) => update(item.id, { description: event.target.value })}
              className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm shadow-xs outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />
            <QuantityInput value={item.quantity} onChange={(quantity) => update(item.id, { quantity })} />
            <MoneyInput value={item.unitPrice} onChange={(unitPrice) => update(item.id, { unitPrice })} />
            <div className="flex justify-center">
              <input
                type="checkbox"
                checked={item.taxable}
                onChange={(event) => update(item.id, { taxable: event.target.checked })}
                className="size-4 cursor-pointer rounded border-slate-300 accent-slate-900"
                aria-label={`Tax ${item.description || 'this line'}`}
              />
            </div>
            <button
              type="button"
              onClick={() => remove(item.id)}
              aria-label="Remove line"
              className="flex size-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="size-4">
                <path d="M7.5 3h5l.5 1H16v1.5H4V4h3l.5-1ZM5.5 7h9l-.7 9.1a1.5 1.5 0 0 1-1.5 1.4H7.7a1.5 1.5 0 0 1-1.5-1.4L5.5 7Z" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={add}
          className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-700 shadow-xs transition hover:bg-slate-50 active:bg-slate-100"
        >
          + Add line
        </button>
        <span className="text-xs text-slate-500">
          {items.length} {items.length === 1 ? 'line' : 'lines'} ·{' '}
          <span className="tabular-nums">
            {formatMoney(
              items.reduce((sum, item) => sum + lineTotal(item), 0),
              currency,
              locale,
            )}
          </span>
        </span>
      </div>
    </div>
  )
}
