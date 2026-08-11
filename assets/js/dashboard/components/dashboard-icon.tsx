import React from 'react'
import { HugeiconsIcon, type HugeiconsIconProps } from '@hugeicons/react'

type DashboardIconProps = HugeiconsIconProps & {
  decorative?: boolean
}

export function DashboardIcon({
  decorative = true,
  strokeWidth = 1.8,
  ...props
}: DashboardIconProps) {
  return (
    <HugeiconsIcon
      aria-hidden={decorative ? true : undefined}
      focusable="false"
      strokeWidth={strokeWidth}
      {...props}
    />
  )
}
