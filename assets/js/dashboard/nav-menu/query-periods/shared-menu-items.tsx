import React, { ReactNode } from 'react'
import classNames from 'classnames'
import { ArrowDown01Icon } from '@hugeicons/core-free-icons'
import { DashboardIcon } from '../../components/dashboard-icon'
import { PopoverContent } from '../../components/ui/popover'

export const linkClassName = classNames(
  'flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-foreground outline-none transition-colors',
  'hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/50',
  'data-[selected=true]:bg-accent data-[selected=true]:font-semibold data-[selected=true]:text-accent-foreground'
)

export const datemenuButtonClassName = classNames(
  'w-full justify-between bg-card px-2 font-medium text-foreground shadow-sm'
)

export const hiddenCalendarButtonClassName =
  'absolute h-9 w-px overflow-hidden opacity-0 pointer-events-none'

export const DateMenuChevron = () => (
  <DashboardIcon
    icon={ArrowDown01Icon}
    className="ml-1 hidden size-4 text-muted-foreground lg:inline-block md:ml-2 md:size-5"
  />
)

type CalendarPanelProps = {
  className?: string
  children: ReactNode
}

export const CalendarPanel = React.forwardRef<
  HTMLDivElement,
  CalendarPanelProps
>(({ children, className }, ref) => {
  return (
    <PopoverContent
      ref={ref}
      align="end"
      className={classNames('w-auto gap-0 p-0', className)}
    >
      {children}
    </PopoverContent>
  )
})
