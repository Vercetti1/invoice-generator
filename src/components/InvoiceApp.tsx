import { useEffect, useMemo, useState } from 'react'
import { Editor } from './Editor'
import { InvoicePreview } from './InvoicePreview'
import { computeTotals } from '../lib/calc'
import { blankInvoice, loadInvoice, saveInvoice } from '../lib/storage'
import type { Invoice } from '../types'

export function InvoiceApp() {
  const [invoice, setInvoice] = useState<Invoice>(loadInvoice)

  // Autosave the draft; the invoice object is small enough to write on every edit.
  useEffect(() => {
    saveInvoice(invoice)
  }, [invoice])

  const totals = useMemo(() => computeTotals(invoice), [invoice])

  const patch = (next: Partial<Invoice>) => setInvoice((current) => ({ ...current, ...next }))

  const reset = () => {
    if (confirm('Discard this invoice and start from the sample?')) setInvoice(blankInvoice())
  }

  return (
    <div className="print-root flex h-full flex-col">
      <header className="no-print flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-3">
        <div className="flex items-baseline gap-3">
          <a
            href="#/"
            className="text-sm font-semibold text-slate-900 transition hover:text-slate-600"
          >
            Invoice Generator
          </a>
          <span className="hidden text-xs text-slate-400 sm:inline">Autosaved locally</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-xs transition hover:bg-slate-50"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white shadow-xs transition hover:bg-slate-800"
          >
            Export PDF
          </button>
        </div>
      </header>

      <div className="print-row flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="no-print w-full shrink-0 overflow-y-auto border-slate-200 bg-white lg:w-[27rem] lg:border-r">
          <Editor invoice={invoice} patch={patch} />
        </aside>

        <main className="print-area min-h-0 flex-1 overflow-y-auto bg-slate-100 p-6 lg:p-10">
          <InvoicePreview invoice={invoice} totals={totals} />
        </main>
      </div>
    </div>
  )
}
