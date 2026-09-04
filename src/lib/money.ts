import type { Cents } from '../types'

/** Round half-away-from-zero, matching how invoices are normally rounded. */
export function roundCents(value: number): Cents {
  return Math.sign(value) * Math.round(Math.abs(value))
}

export function formatMoney(cents: Cents, currency: string, locale: string): string {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(cents / 100)
  } catch {
    // Unknown currency or locale code — fall back to a plain decimal.
    return `${(cents / 100).toFixed(2)} ${currency}`
  }
}

/** Parse a user-typed amount ("1,234.50") into cents. Returns 0 for unparseable input. */
export function parseAmountToCents(input: string): Cents {
  const cleaned = input.replace(/[^0-9.-]/g, '')
  const value = Number.parseFloat(cleaned)
  return Number.isFinite(value) ? roundCents(value * 100) : 0
}

export function centsToInput(cents: Cents): string {
  return (cents / 100).toFixed(2)
}

export function parseQuantity(input: string): number {
  const value = Number.parseFloat(input.replace(/[^0-9.-]/g, ''))
  return Number.isFinite(value) ? value : 0
}
