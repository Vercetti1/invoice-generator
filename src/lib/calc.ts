import type { Cents, Discount, Invoice, LineItem, Totals } from '../types'
import { roundCents } from './money'

export function lineTotal(item: LineItem): Cents {
  return roundCents(item.quantity * item.unitPrice)
}

function discountAmount(discount: Discount, subtotal: Cents): Cents {
  switch (discount.kind) {
    case 'none':
      return 0
    case 'percent':
      return roundCents((subtotal * clamp(discount.rate, 0, 100)) / 100)
    case 'fixed':
      // Never discount below zero.
      return Math.min(Math.max(discount.amount, 0), Math.max(subtotal, 0))
  }
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(Math.max(value, min), max)
}

/**
 * Order of operations: line totals -> discount on the subtotal -> tax on the
 * discounted taxable portion. The discount is prorated across taxable and
 * non-taxable items so a discount never shifts the tax base unfairly.
 */
export function computeTotals(invoice: Invoice): Totals {
  const rate = clamp(invoice.taxRate, 0, 100)
  const subtotal = invoice.items.reduce((sum, item) => sum + lineTotal(item), 0)
  const taxableGross = invoice.items.reduce(
    (sum, item) => (item.taxable ? sum + lineTotal(item) : sum),
    0,
  )

  const discount = discountAmount(invoice.discount, subtotal)
  const taxableShare = subtotal === 0 ? 0 : taxableGross / subtotal
  const taxableAfterDiscount = taxableGross - roundCents(discount * taxableShare)

  if (invoice.taxMode === 'inclusive') {
    // Prices already contain tax: extract the tax component from the taxable part.
    const total = subtotal - discount
    const tax = roundCents((taxableAfterDiscount * rate) / (100 + rate))
    return { subtotal, discount, tax, net: total - tax, total }
  }

  const net = subtotal - discount
  const tax = roundCents((taxableAfterDiscount * rate) / 100)
  return { subtotal, discount, tax, net, total: net + tax }
}
