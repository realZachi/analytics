import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { Calendar } from '../../components/ui/calendar'

export interface DateRangeCalendarProps {
  id: string
  minDate?: string
  maxDate?: string
  defaultDates?: [string, string]
  onCloseWithNoSelection?: () => void
  onCloseWithSelection?: ([selectionStart, selectionEnd]: [Date, Date]) => void
}

const parseDate = (value?: string): Date | undefined =>
  value ? new Date(`${value}T00:00:00`) : undefined

const rangeFromDefaultDates = (
  defaultDates?: [string, string]
): DateRange | undefined => {
  if (!defaultDates) {
    return undefined
  }

  const [from, to] = defaultDates.map(parseDate)
  return from && to ? { from, to } : undefined
}

export function DateRangeCalendar({
  id,
  minDate,
  maxDate,
  defaultDates,
  onCloseWithNoSelection,
  onCloseWithSelection
}: DateRangeCalendarProps) {
  const [selected, setSelected] = useState<DateRange | undefined>(() =>
    rangeFromDefaultDates(defaultDates)
  )
  const completedSelectionRef = useRef(false)
  const min = useMemo(() => parseDate(minDate), [minDate])
  const max = useMemo(() => parseDate(maxDate), [maxDate])

  useEffect(() => {
    setSelected(rangeFromDefaultDates(defaultDates))
    completedSelectionRef.current = false
  }, [defaultDates])

  useEffect(
    () => () => {
      if (!completedSelectionRef.current) {
        onCloseWithNoSelection?.()
      }
    },
    [onCloseWithNoSelection]
  )

  return (
    <Calendar
      id={id}
      mode="range"
      selected={selected}
      resetOnSelect
      onSelect={(range) => {
        setSelected(range)
        if (range?.from && range.to) {
          completedSelectionRef.current = true
          onCloseWithSelection?.([range.from, range.to])
        }
      }}
      disabled={[
        ...(min ? [{ before: min }] : []),
        ...(max ? [{ after: max }] : [])
      ]}
      defaultMonth={selected?.from ?? min}
      numberOfMonths={1}
    />
  )
}
