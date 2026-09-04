/** All monetary amounts are integer minor units (cents) to avoid float drift. */
export type Cents = number

export type LineItem = {
  id: string
  description: string
  /** May be fractional, e.g. 1.5 hours. */
  quantity: number
  unitPrice: Cents
  taxable: boolean
}

export type Discount =
  | { kind: 'none' }
  | { kind: 'percent'; /** 0–100 */ rate: number }
  | { kind: 'fixed'; amount: Cents }

/**
 * `exclusive` — unit prices are pre-tax, tax is added on top.
 * `inclusive` — unit prices already contain tax, which is extracted for display.
 */
export type TaxMode = 'exclusive' | 'inclusive'

export type Party = {
  name: string
  address: string
  email: string
}

export type Invoice = {
  number: string
  issueDate: string
  dueDate: string
  currency: string
  locale: string
  from: Party
  to: Party
  items: LineItem[]
  discount: Discount
  /** Percentage, e.g. 7.5 for 7.5%. */
  taxRate: number
  taxLabel: string
  taxMode: TaxMode
  notes: string
  paymentDetails: string
}

export type Totals = {
  /** Sum of line totals, before discount. */
  subtotal: Cents
  discount: Cents
  /** Tax charged (extracted from the total when `taxMode` is inclusive). */
  tax: Cents
  /** Amount excluding tax, after discount. */
  net: Cents
  total: Cents
}
