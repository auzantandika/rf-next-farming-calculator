import { useEffect, useState, type ChangeEvent } from 'react'
import { parseDecimal, parseWholeNumber } from '../lib/numbers'

interface NumberFieldProps {
  id: string
  label: string
  value: number | null
  onChange: (value: number | null) => void
  mode?: 'whole' | 'decimal'
  placeholder?: string
  hint?: string
}

export function NumberField({
  id,
  label,
  value,
  onChange,
  mode = 'whole',
  placeholder,
  hint,
}: NumberFieldProps) {
  const [text, setText] = useState(
    value == null || !Number.isFinite(value) ? '' : String(value),
  )

  useEffect(() => {
    const next =
      value == null || !Number.isFinite(value) ? '' : String(value)
    setText((prev) => {
      const currentParsed =
        mode === 'whole' ? parseWholeNumber(prev) : parseDecimal(prev)
      if (currentParsed === value) return prev
      return next
    })
  }, [value, mode])

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value
    setText(raw)
    if (!raw.trim()) {
      onChange(null)
      return
    }
    const parsed =
      mode === 'whole' ? parseWholeNumber(raw) : parseDecimal(raw)
    if (parsed != null) onChange(parsed)
  }

  const handleBlur = () => {
    if (!text.trim()) {
      setText('')
      onChange(null)
      return
    }
    const parsed =
      mode === 'whole' ? parseWholeNumber(text) : parseDecimal(text)
    if (parsed != null) {
      setText(String(parsed))
      onChange(parsed)
    }
  }

  return (
    <label className="field" htmlFor={id}>
      <span className="field-label">{label}</span>
      <input
        id={id}
        className="field-input"
        inputMode="decimal"
        autoComplete="off"
        placeholder={placeholder}
        value={text}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-describedby={hint ? `${id}-hint` : undefined}
      />
      {hint ? (
        <span className="field-hint" id={`${id}-hint`}>
          {hint}
        </span>
      ) : null}
    </label>
  )
}
