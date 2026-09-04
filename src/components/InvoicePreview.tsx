import type { Invoice, Totals } from '../types'
import { lineTotal } from '../lib/calc'
import { formatMoney } from '../lib/money'

function formatDate(value: string, locale: string): string {
  if (!value) return '–'
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date)
  } catch {
    return value
  }
}

function formatQuantity(quantity: number): string {
  return Number.isInteger(quantity) ? String(quantity) : quantity.toFixed(2)
}

function Multiline({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, index) => (
        <span key={index} className="block">
          {line || ' '}
        </span>
      ))}
    </>
  )
}

export function InvoicePreview({ invoice, totals }: { invoice: Invoice; totals: Totals }) {
  const money = (cents: number) => formatMoney(cents, invoice.currency, invoice.locale)
  const discountLabel =
    invoice.discount.kind === 'percent' ? `Discount (${invoice.discount.rate}%)` : 'Discount'
  const taxLabel = `${invoice.taxLabel || 'Tax'} (${invoice.taxRate}%)${
    invoice.taxMode === 'inclusive' ? ' (included)' : ''
  }`

  return (
    <article className="print-sheet mx-auto w-full max-w-[820px] rounded-lg border border-slate-200 bg-white p-10 shadow-sm">
      <header className="flex items-start justify-between gap-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Invoice</h1>
          <p className="mt-1 font-mono text-sm text-slate-500">{invoice.number || '–'}</p>
        </div>
        <dl className="grid grid-cols-[auto_auto] gap-x-4 gap-y-1 text-right text-sm">
          <dt className="text-slate-500">Issued</dt>
          <dd className="tabular-nums text-slate-900">{formatDate(invoice.issueDate, invoice.locale)}</dd>
          <dt className="text-slate-500">Due</dt>
          <dd className="tabular-nums text-slate-900">{formatDate(invoice.dueDate, invoice.locale)}</dd>
          <dt className="pt-1 text-slate-500">Total</dt>
          <dd className="pt-1 text-base font-semibold tabular-nums text-slate-900">{money(totals.total)}</dd>
        </dl>
      </header>

      <div className="mt-8 grid grid-cols-2 gap-8 border-t border-slate-200 pt-6 text-sm">
        <section>
          <h2 className="mb-2 text-xs font-medium tracking-wide text-slate-500 uppercase">From</h2>
          <p className="font-medium text-slate-900">{invoice.from.name || '–'}</p>
          <p className="mt-1 leading-relaxed text-slate-600">
            <Multiline text={invoice.from.address} />
          </p>
          {invoice.from.email ? <p className="mt-1 text-slate-600">{invoice.from.email}</p> : null}
        </section>
        <section>
          <h2 className="mb-2 text-xs font-medium tracking-wide text-slate-500 uppercase">Bill to</h2>
          <p className="font-medium text-slate-900">{invoice.to.name || '–'}</p>
          <p className="mt-1 leading-relaxed text-slate-600">
            <Multiline text={invoice.to.address} />
          </p>
          {invoice.to.email ? <p className="mt-1 text-slate-600">{invoice.to.email}</p> : null}
        </section>
      </div>

      <table className="mt-8 w-full text-sm">
        <thead>
          <tr className="border-b border-slate-300 text-xs tracking-wide text-slate-500 uppercase">
            <th className="pb-2 text-left font-medium">Description</th>
            <th className="pb-2 pl-3 text-right font-medium">Qty</th>
            <th className="pb-2 pl-3 text-right font-medium">Unit price</th>
            <th className="pb-2 pl-3 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-6 text-center text-slate-400">
                No line items yet.
              </td>
            </tr>
          ) : (
            invoice.items.map((item) => (
              <tr key={item.id} className="avoid-break border-b border-slate-100">
                <td className="py-2.5 pr-3 text-slate-900">
                  {item.description || <span className="text-slate-400">Untitled item</span>}
                  {!item.taxable && invoice.taxRate > 0 ? (
                    <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] tracking-wide text-slate-500 uppercase">
                      No tax
                    </span>
                  ) : null}
                </td>
                <td className="py-2.5 pl-3 text-right tabular-nums text-slate-600">{formatQuantity(item.quantity)}</td>
                <td className="py-2.5 pl-3 text-right tabular-nums text-slate-600">{money(item.unitPrice)}</td>
                <td className="py-2.5 pl-3 text-right tabular-nums text-slate-900">{money(lineTotal(item))}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="avoid-break mt-6 flex justify-end">
        <dl className="w-full max-w-xs space-y-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-600">Subtotal</dt>
            <dd className="tabular-nums text-slate-900">{money(totals.subtotal)}</dd>
          </div>

          {totals.discount > 0 ? (
            <div className="flex justify-between">
              <dt className="text-slate-600">{discountLabel}</dt>
              <dd className="tabular-nums text-slate-900">−{money(totals.discount)}</dd>
            </div>
          ) : null}

          {invoice.taxRate > 0 ? (
            <>
              {invoice.taxMode === 'exclusive' ? null : (
                <div className="flex justify-between">
                  <dt className="text-slate-600">Net</dt>
                  <dd className="tabular-nums text-slate-900">{money(totals.net)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-slate-600">{taxLabel}</dt>
                <dd className="tabular-nums text-slate-900">{money(totals.tax)}</dd>
              </div>
            </>
          ) : null}

          <div className="mt-1.5 flex justify-between border-t border-slate-300 pt-2.5 text-base font-semibold">
            <dt>Total due</dt>
            <dd className="tabular-nums">{money(totals.total)}</dd>
          </div>
        </dl>
      </div>

      {invoice.notes || invoice.paymentDetails ? (
        <footer className="avoid-break mt-10 grid grid-cols-2 gap-8 border-t border-slate-200 pt-6 text-sm">
          {invoice.paymentDetails ? (
            <section>
              <h2 className="mb-1.5 text-xs font-medium tracking-wide text-slate-500 uppercase">Payment details</h2>
              <p className="leading-relaxed text-slate-600">
                <Multiline text={invoice.paymentDetails} />
              </p>
            </section>
          ) : null}
          {invoice.notes ? (
            <section>
              <h2 className="mb-1.5 text-xs font-medium tracking-wide text-slate-500 uppercase">Notes</h2>
              <p className="leading-relaxed text-slate-600">
                <Multiline text={invoice.notes} />
              </p>
            </section>
          ) : null}
        </footer>
      ) : null}
    </article>
  )
}
