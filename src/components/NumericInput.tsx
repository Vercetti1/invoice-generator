import { useState } from 'react'
import type { Cents } from '../types'
import { centsToInput, parseAmountToCents, parseQuantity } from '../lib/money'

const inputBase =
  'w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm tabular-nums text-slate-900 shadow-xs outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10'

/**
 * Numeric inputs keep their own text draft while focused, so typing "12.5"
 * isn't rewritten to "12.50" mid-keystroke. The draft resyncs from props
 * whenever the field is blurred or the value changes elsewhere.
 */
function useDraft(value: number, format: (value: number) => string) {
  const [text, setText] = useState(() => format(value))
  const [focused, setFocused] = useState(false)
  const [lastValue, setLastValue] = useState(value)

  // Adjust during render rather than in an effect: React applies this before
  // committing, so there's no flash of the stale text.
  if (!focused && value !== lastValue) {
    setLastValue(value)
    setText(format(value))
  }

  return { text, setText, focused, setFocused }
}

export function MoneyInput({
  value,
  onChange,
  align = 'right',
}: {
  value: Cents
  onChange: (cents: Cents) => void
  align?: 'left' | 'right'
}) {
  const draft = useDraft(value, centsToInput)

  return (
    <input
      inputMode="decimal"
      value={draft.text}
      onFocus={() => draft.setFocused(true)}
      onBlur={() => {
        draft.setFocused(false)
        draft.setText(centsToInput(value))
      }}
      onChange={(event) => {
        draft.setText(event.target.value)
        onChange(parseAmountToCents(event.target.value))
      }}
      className={`${inputBase} ${align === 'right' ? 'text-right' : ''}`}
    />
  )
}

export function QuantityInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const draft = useDraft(value, (quantity) => String(quantity))

  return (
    <input
      inputMode="decimal"
      value={draft.text}
      onFocus={() => draft.setFocused(true)}
      onBlur={() => {
        draft.setFocused(false)
        draft.setText(String(value))
      }}
      onChange={(event) => {
        draft.setText(event.target.value)
        onChange(parseQuantity(event.target.value))
      }}
      className={`${inputBase} text-right`}
    />
  )
}
