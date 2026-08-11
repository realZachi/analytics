import classNames from 'classnames'
import React from 'react'

interface MapTooltipProps {
  name: string
  value: string
  label: string
  x: number
  y: number
}

export const MapTooltip = ({ name, value, label, x, y }: MapTooltipProps) => (
  <div
    className={classNames(
      'absolute',
      'z-50',
      'p-2',
      'translate-x-2',
      'translate-y-2',
      'pointer-events-none',
      'rounded-md',
      'border',
      'border-border',
      'bg-popover',
      'text-popover-foreground',
      'shadow-md'
    )}
    style={{
      left: x,
      top: y
    }}
  >
    <div className="font-semibold">{name}</div>
    <strong className="text-primary">{value}</strong> {label}
  </div>
)
