import type { Discount, Invoice, Party, TaxMode } from '../types'
import { NumberField, Section, Select, TextArea, TextField } from './Fields'
import { LineItemsEditor } from './LineItemsEditor'
import { MoneyInput } from './NumericInput'

const CURRENCIES = [
  { value: 'USD', label: 'USD · US Dollar' },
  { value: 'EUR', label: 'EUR · Euro' },
  { value: 'GBP', label: 'GBP · Pound Sterling' },
  { value: 'NGN', label: 'NGN · Nigerian Naira' },
  { value: 'CAD', label: 'CAD · Canadian Dollar' },
  { value: 'AUD', label: 'AUD · Australian Dollar' },
  { value: 'JPY', label: 'JPY · Japanese Yen' },
  { value: 'INR', label: 'INR · Indian Rupee' },
  { value: 'ZAR', label: 'ZAR · South African Rand' },
] as const

const LOCALES = [
  { value: 'en-US', label: 'en-US · 1,234.56' },
  { value: 'en-GB', label: 'en-GB · 1,234.56' },
  { value: 'de-DE', label: 'de-DE · 1.234,56' },
  { value: 'fr-FR', label: 'fr-FR · 1 234,56' },
  { value: 'en-NG', label: 'en-NG · 1,234.56' },
  { value: 'ja-JP', label: 'ja-JP · 1,235' },
] as const

const DISCOUNT_KINDS = [
  { value: 'none', label: 'No discount' },
  { value: 'percent', label: 'Percentage' },
  { value: 'fixed', label: 'Fixed amount' },
] as const

const TAX_MODES = [
  { value: 'exclusive', label: 'Added on top of prices' },
  { value: 'inclusive', label: 'Already included in prices' },
] as const

type Props = {
  invoice: Invoice
  patch: (patch: Partial<Invoice>) => void
}

export function Editor({ invoice, patch }: Props) {
  const patchParty = (key: 'from' | 'to', partyPatch: Partial<Party>) =>
    patch({ [key]: { ...invoice[key], ...partyPatch } })

  const setDiscountKind = (kind: Discount['kind']) => {
    if (kind === 'none') return patch({ discount: { kind: 'none' } })
    if (kind === 'percent') {
      const rate = invoice.discount.kind === 'percent' ? invoice.discount.rate : 10
      return patch({ discount: { kind: 'percent', rate } })
    }
    const amount = invoice.discount.kind === 'fixed' ? invoice.discount.amount : 0
    return patch({ discount: { kind: 'fixed', amount } })
  }

  return (
    <div className="divide-y divide-slate-200">
      <Section title="Invoice details">
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Invoice no." value={invoice.number} onChange={(number) => patch({ number })} />
          <Select label="Currency" value={invoice.currency} onChange={(currency) => patch({ currency })} options={CURRENCIES} />
          <TextField label="Issue date" type="date" value={invoice.issueDate} onChange={(issueDate) => patch({ issueDate })} />
          <TextField label="Due date" type="date" value={invoice.dueDate} onChange={(dueDate) => patch({ dueDate })} />
          <Select className="col-span-2" label="Number format" value={invoice.locale} onChange={(locale) => patch({ locale })} options={LOCALES} />
        </div>
      </Section>

      <Section title="From">
        <div className="space-y-3">
          <TextField label="Name" value={invoice.from.name} onChange={(name) => patchParty('from', { name })} />
          <TextField label="Email" type="email" value={invoice.from.email} onChange={(email) => patchParty('from', { email })} />
          <TextArea label="Address" value={invoice.from.address} onChange={(address) => patchParty('from', { address })} />
        </div>
      </Section>

      <Section title="Bill to">
        <div className="space-y-3">
          <TextField label="Name" value={invoice.to.name} onChange={(name) => patchParty('to', { name })} />
          <TextField label="Email" type="email" value={invoice.to.email} onChange={(email) => patchParty('to', { email })} />
          <TextArea label="Address" value={invoice.to.address} onChange={(address) => patchParty('to', { address })} />
        </div>
      </Section>

      <Section title="Line items">
        <LineItemsEditor
          items={invoice.items}
          currency={invoice.currency}
          locale={invoice.locale}
          onChange={(items) => patch({ items })}
        />
      </Section>

      <Section title="Discount & tax">
        <div className="grid grid-cols-2 gap-3">
          <Select label="Discount" value={invoice.discount.kind} onChange={setDiscountKind} options={DISCOUNT_KINDS} />

          {invoice.discount.kind === 'percent' ? (
            <NumberField
              label="Rate"
              suffix="%"
              align="right"
              step="0.1"
              value={String(invoice.discount.rate)}
              onChange={(value) => patch({ discount: { kind: 'percent', rate: Number(value) || 0 } })}
            />
          ) : null}

          {invoice.discount.kind === 'fixed' ? (
            <label className="block">
              <span className="mb-1 block text-xs font-medium tracking-wide text-slate-500 uppercase">Amount</span>
              <MoneyInput
                value={invoice.discount.amount}
                onChange={(amount) => patch({ discount: { kind: 'fixed', amount } })}
              />
            </label>
          ) : null}

          {invoice.discount.kind === 'none' ? <div /> : null}

          <TextField label="Tax label" value={invoice.taxLabel} onChange={(taxLabel) => patch({ taxLabel })} />
          <NumberField
            label="Tax rate"
            suffix="%"
            align="right"
            step="0.01"
            value={String(invoice.taxRate)}
            onChange={(value) => patch({ taxRate: Number(value) || 0 })}
          />
          <Select
            className="col-span-2"
            label="Tax treatment"
            value={invoice.taxMode}
            onChange={(taxMode: TaxMode) => patch({ taxMode })}
            options={TAX_MODES}
          />
        </div>
        <p className="mt-2.5 text-xs leading-relaxed text-slate-500">
          Tax applies only to lines with <strong className="font-medium text-slate-700">Tax</strong> checked, and is
          calculated after the discount is prorated across taxable and non-taxable lines.
        </p>
      </Section>

      <Section title="Notes & payment">
        <div className="space-y-3">
          <TextArea label="Notes" rows={2} value={invoice.notes} onChange={(notes) => patch({ notes })} />
          <TextArea
            label="Payment details"
            rows={2}
            value={invoice.paymentDetails}
            onChange={(paymentDetails) => patch({ paymentDetails })}
          />
        </div>
      </Section>
    </div>
  )
}
