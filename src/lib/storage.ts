import type { Invoice } from '../types'

const KEY = 'invoice-generator:draft'

export function newId(): string {
  return Math.random().toString(36).slice(2, 10)
}

function today(offsetDays = 0): string {
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)
  return date.toISOString().slice(0, 10)
}

export function blankInvoice(): Invoice {
  return {
    number: 'INV-0001',
    issueDate: today(),
    dueDate: today(14),
    currency: 'USD',
    locale: 'en-US',
    from: { name: 'Your Company', address: '123 Market St\nSan Francisco, CA 94103', email: 'billing@yourcompany.com' },
    to: { name: 'Client Name', address: '456 Client Ave\nAustin, TX 78701', email: 'accounts@client.com' },
    items: [
      { id: newId(), description: 'Design system audit', quantity: 1, unitPrice: 240000, taxable: true },
      { id: newId(), description: 'Implementation support (hours)', quantity: 12.5, unitPrice: 15000, taxable: true },
      { id: newId(), description: 'Reimbursed hosting costs', quantity: 1, unitPrice: 4200, taxable: false },
    ],
    discount: { kind: 'percent', rate: 10 },
    taxRate: 8.25,
    taxLabel: 'Sales tax',
    taxMode: 'exclusive',
    notes: 'Thanks for your business. Late payments accrue 1.5% interest per month.',
    paymentDetails: 'Bank transfer · Acct 0123456789 / Routing 110000000',
  }
}

export function loadInvoice(): Invoice {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return blankInvoice()
    // Merge over defaults so a draft saved by an older version stays usable.
    return { ...blankInvoice(), ...(JSON.parse(raw) as Partial<Invoice>) }
  } catch {
    return blankInvoice()
  }
}

export function saveInvoice(invoice: Invoice): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(invoice))
  } catch {
    // Storage unavailable (private mode, quota) — drafts just won't persist.
  }
}
