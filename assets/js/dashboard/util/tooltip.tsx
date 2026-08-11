import React, { ReactNode, RefObject, useState } from 'react'
import { cn } from '../lib/utils'
import {
  Tooltip as ShadcnTooltip,
  TooltipContent,
  TooltipTrigger
} from '../components/ui/tooltip'

export function Tooltip({
  children,
  info,
  className,
  onClick,
  boundary,
  containerRef
}: {
  info: ReactNode
  children: ReactNode
  className?: string
  onClick?: () => void
  /** if provided, the tooltip is confined to the particular element */
  boundary?: HTMLElement | null
  /** if defined, the tooltip is rendered in a portal to this element */
  containerRef?: RefObject<HTMLElement>
}) {
  const [open, setOpen] = useState(false)

  return (
    <ShadcnTooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger
        render={
          <span
            className={cn('relative inline-flex', className)}
            onBlur={() => setOpen(false)}
            onClick={onClick}
            onFocus={() => setOpen(true)}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          />
        }
      >
        {children}
      </TooltipTrigger>
      {!!info && (
        <TooltipContent
          collisionBoundary={boundary ?? undefined}
          container={containerRef?.current ?? undefined}
          sideOffset={6}
        >
          {info}
        </TooltipContent>
      )}
    </ShadcnTooltip>
  )
}
