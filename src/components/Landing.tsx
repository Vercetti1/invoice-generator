import { useEffect, useMemo, useRef, useState } from 'react'
import { InvoicePreview } from './InvoicePreview'
import { computeTotals } from '../lib/calc'
import { blankInvoice } from '../lib/storage'
import { formatMoney } from '../lib/money'

const OPEN_APP = '#/app'

function Rule() {
  return <span className="block h-px w-full bg-slate-200" />
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-medium tracking-[0.18em] text-slate-500 uppercase">{children}</p>
  )
}

/**
 * Scales a fixed-width design to exactly fill its container.
 *
 * A hard-coded scale has no way to know how wide the container actually is, so
 * it either clips or leaves a gap at every breakpoint. Measuring is exact at
 * any width.
 */
const SHEET_WIDTH = 820

function useFitScale(designWidth: number) {
  const frame = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0)

  useEffect(() => {
    const element = frame.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / designWidth)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [designWidth])

  return { frame, scale }
}

/**
 * The hero shows the real preview component rendering the real sample invoice,
 * scaled down inside a window frame. It cannot drift out of date the way a
 * screenshot or a hand-built mockup would.
 */
function HeroPreview() {
  const invoice = useMemo(blankInvoice, [])
  const totals = useMemo(() => computeTotals(invoice), [invoice])
  const { frame, scale } = useFitScale(SHEET_WIDTH)

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_24px_60px_-24px_rgb(15_23_42/0.35)]">
        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-3.5 py-2.5">
          <span aria-hidden className="flex items-center gap-[5px]">
            <span className="size-2.5 rounded-full bg-slate-300" />
            <span className="size-2.5 rounded-full bg-slate-300" />
            <span className="size-2.5 rounded-full bg-slate-300" />
          </span>
          <span className="mx-auto font-mono text-[11px] text-slate-400">INV-0001 · preview</span>
        </div>

        <div
          ref={frame}
          className="h-[300px] overflow-hidden sm:h-[360px] lg:h-[420px]"
        >
          <div
            className="origin-top-left transition-opacity duration-300"
            style={{
              width: SHEET_WIDTH,
              scale: scale || 1,
              opacity: scale ? 1 : 0,
            }}
          >
            <InvoicePreview invoice={invoice} totals={totals} />
          </div>
        </div>
      </div>

      {/* Fade the crop so the cut-off sheet reads as deliberate. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-px bottom-px h-24 rounded-b-xl bg-gradient-to-t from-white to-transparent"
      />
    </div>
  )
}

const FEATURES = [
  {
    title: 'Money is never a float',
    body: 'Every amount is stored as integer minor units and rounded half-away-from-zero, so totals do not drift by a cent on long invoices.',
  },
  {
    title: 'Tax that actually behaves',
    body: 'Tax-exclusive or tax-inclusive pricing, a taxable flag per line, and discounts prorated across the taxable and non-taxable portions.',
  },
  {
    title: 'Any currency, any locale',
    body: 'Amounts and dates are formatted with the Intl APIs, so ₦, €, ¥ and $ each render the way their own locale expects.',
  },
  {
    title: 'PDFs with real text',
    body: 'Export goes through the browser print pipeline instead of rasterising the page, so the output stays vector, selectable and searchable.',
  },
  {
    title: 'Autosaved as you type',
    body: 'Your draft is written to local storage on every edit. Close the tab, come back, and it is exactly where you left it.',
  },
  {
    title: 'No account, no upload',
    body: 'There is no backend. Your client names, rates and bank details never leave the browser, because there is nowhere for them to go.',
  },
]

const STEPS = [
  { n: '01', title: 'Fill in the details', body: 'Parties, dates, currency, line items, tax and discount.' },
  { n: '02', title: 'Watch it total up', body: 'The preview recalculates on every keystroke. No refresh, no submit.' },
  { n: '03', title: 'Export the PDF', body: 'One button, A4, print-ready, with the editor chrome stripped out.' },
]

/** A worked example of the order of operations, computed by the real engine. */
function MathsDemo() {
  const invoice = useMemo(blankInvoice, [])
  const totals = useMemo(() => computeTotals(invoice), [invoice])
  const money = (cents: number) => formatMoney(cents, invoice.currency, invoice.locale)

  const rows = [
    { label: 'Subtotal', hint: 'sum of every line', value: money(totals.subtotal) },
    { label: 'Discount (10%)', hint: 'applied to the subtotal', value: `−${money(totals.discount)}` },
    {
      label: 'Sales tax (8.25%)',
      hint: 'on the discounted taxable portion only',
      value: money(totals.tax),
    },
  ]

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
      <dl className="space-y-4">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline gap-4">
            <dt className="min-w-0">
              <span className="block text-sm font-medium text-slate-900">{row.label}</span>
              <span className="block text-xs text-slate-500">{row.hint}</span>
            </dt>
            <span aria-hidden className="mb-1 h-px flex-1 bg-slate-200" />
            <dd className="font-mono text-sm tabular-nums text-slate-900">{row.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 flex items-baseline gap-4 border-t-2 border-slate-900 pt-4">
        <span className="text-sm font-semibold text-slate-900">Total due</span>
        <span aria-hidden className="mb-1 h-px flex-1 bg-slate-200" />
        <span className="font-mono text-lg font-semibold tabular-nums text-slate-900">
          {money(totals.total)}
        </span>
      </div>
    </div>
  )
}

export function Landing() {
  return (
    <div className="min-h-full overflow-y-auto bg-white">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <a href="#/" className="text-sm font-semibold tracking-tight text-slate-900">
            Invoice Generator
          </a>
          <div className="flex items-center gap-6">
            <a
              href="#features"
              className="hidden text-sm text-slate-600 transition hover:text-slate-900 sm:block"
            >
              Features
            </a>
            <a
              href="#how"
              className="hidden text-sm text-slate-600 transition hover:text-slate-900 sm:block"
            >
              How it works
            </a>
            <a
              href={OPEN_APP}
              className="rounded-md bg-slate-900 px-3.5 py-2 text-sm font-medium text-white shadow-xs transition hover:bg-slate-800"
            >
              Open the app
            </a>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_-10%,rgb(241_245_249),transparent)]"
        />
        <div className="relative mx-auto max-w-6xl px-5 pt-16 pb-20 sm:px-8 sm:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <Eyebrow>Free · No sign-up</Eyebrow>
              <h1 className="mt-4 text-4xl leading-[1.08] font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.4rem]">
                Invoices that add up.
                <br />
                <span className="text-slate-400">Literally.</span>
              </h1>
              <p className="mt-6 max-w-md text-[17px] leading-relaxed text-slate-600">
                A fast, precise invoice builder that runs entirely in your browser. Multi-currency,
                proper tax handling, and a clean PDF in one click, with none of your client data
                ever leaving your machine.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href={OPEN_APP}
                  className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99]"
                >
                  Create an invoice
                </a>
                <a
                  href="#how"
                  className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  See how it works
                </a>
              </div>

              <p className="mt-6 flex items-center gap-2 text-[13px] text-slate-500">
                <span aria-hidden className="size-1.5 rounded-full bg-emerald-500" />
                Works offline · Nothing is uploaded · Drafts saved on this device
              </p>
            </div>

            <HeroPreview />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <Eyebrow>Built properly</Eyebrow>
        <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          The boring parts, done right.
        </h2>
        <div className="mt-4 max-w-xl">
          <Rule />
        </div>

        <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title}>
              <h3 className="text-[15px] font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The maths */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:gap-16">
          <div>
            <Eyebrow>Order of operations</Eyebrow>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Where most invoice tools quietly get it wrong.
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-slate-600">
              Apply a discount to an invoice that mixes taxable services with non-taxable
              reimbursements, and the tax base becomes ambiguous. Charge tax on the full amount and
              you overcharge; charge it on the discounted total and you undercharge the taxman.
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
              Here the discount is prorated across the taxable and non-taxable share, so tax lands on
              exactly the right base, and every step is rounded once, in integer cents.
            </p>
          </div>

          <MathsDemo />
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <Eyebrow>Three steps</Eyebrow>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          From blank to billed.
        </h2>

        <ol className="mt-12 grid gap-10 sm:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.n}>
              <span className="font-mono text-xs tracking-widest text-slate-400">{step.n}</span>
              <h3 className="mt-3 text-[15px] font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <div className="rounded-2xl bg-slate-900 px-8 py-14 text-center sm:px-12">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Your next invoice is about ninety seconds away.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-slate-400">
            No account to create, no trial to start, no watermark on the way out.
          </p>
          <a
            href={OPEN_APP}
            className="mt-8 inline-block rounded-lg bg-white px-6 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-100 active:scale-[0.99]"
          >
            Create an invoice
          </a>
        </div>
      </section>

      <footer className="border-t border-slate-200">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:px-8">
          <p>Built by Tomisin Adeyinka</p>
          <a
            href="https://adeyinkatomisin.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-slate-900"
          >
            adeyinkatomisin.netlify.app
          </a>
        </div>
      </footer>
    </div>
  )
}
