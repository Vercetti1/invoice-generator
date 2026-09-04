import type { ReactNode } from 'react'

const inputBase =
  'w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 shadow-xs outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10'

export function Label({ children }: { children: ReactNode }) {
  return <span className="mb-1 block text-xs font-medium tracking-wide text-slate-500 uppercase">{children}</span>
}

type TextFieldProps = {
  label?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: 'text' | 'date' | 'email'
  className?: string
}

export function TextField({ label, value, onChange, placeholder, type = 'text', className = '' }: TextFieldProps) {
  return (
    <label className={`block ${className}`}>
      {label ? <Label>{label}</Label> : null}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={inputBase}
      />
    </label>
  )
}

type NumberFieldProps = {
  label?: string
  value: string
  onChange: (value: string) => void
  step?: string
  min?: string
  suffix?: string
  className?: string
  align?: 'left' | 'right'
}

export function NumberField({
  label,
  value,
  onChange,
  step = '0.01',
  min = '0',
  suffix,
  className = '',
  align = 'left',
}: NumberFieldProps) {
  return (
    <label className={`block ${className}`}>
      {label ? <Label>{label}</Label> : null}
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          step={step}
          min={min}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${inputBase} tabular-nums ${align === 'right' ? 'text-right' : ''} ${suffix ? 'pr-7' : ''}`}
        />
        {suffix ? (
          <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-xs text-slate-400">
            {suffix}
          </span>
        ) : null}
      </div>
    </label>
  )
}

export function TextArea({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  label?: string
  value: string
  onChange: (value: string) => void
  rows?: number
  placeholder?: string
}) {
  return (
    <label className="block">
      {label ? <Label>{label}</Label> : null}
      <textarea
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputBase} resize-y leading-relaxed`}
      />
    </label>
  )
}

export function Select<T extends string>({
  label,
  value,
  onChange,
  options,
  className = '',
}: {
  label?: string
  value: T
  onChange: (value: T) => void
  options: ReadonlyArray<{ value: T; label: string }>
  className?: string
}) {
  return (
    <label className={`block ${className}`}>
      {label ? <Label>{label}</Label> : null}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className={`${inputBase} appearance-none bg-[length:16px] bg-[right_0.5rem_center] bg-no-repeat pr-8`}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2394a3b8'%3E%3Cpath d='M5.5 7.5 10 12l4.5-4.5z'/%3E%3C/svg%3E\")",
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-b border-slate-200 px-5 py-4 last:border-b-0">
      <h2 className="mb-3 text-sm font-semibold text-slate-900">{title}</h2>
      {children}
    </section>
  )
}
