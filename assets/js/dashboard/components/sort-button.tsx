import React, { ReactNode } from 'react'
import { cycleSortDirection, SortDirection } from '../hooks/use-order-by'
import classNames from 'classnames'
import { ArrowDown01Icon } from '@hugeicons/core-free-icons'
import { DashboardIcon } from './dashboard-icon'
import { Button } from './ui/button'

export const SortButton = ({
  children,
  toggleSort,
  sortDirection
}: {
  children: ReactNode
  toggleSort: () => void
  sortDirection: SortDirection | null
}) => {
  const next = cycleSortDirection(sortDirection)
  return (
    <Button
      variant="ghost"
      size="xs"
      onClick={toggleSort}
      title={next.hint}
      className={classNames(
        'group relative h-auto p-0 text-muted-foreground hover:bg-transparent hover:text-foreground'
      )}
    >
      {children}
      <DashboardIcon
        icon={ArrowDown01Icon}
        aria-label={next.hint}
        decorative={false}
        className={classNames(
          'absolute -right-4 inline-block size-3.5 rounded-sm',
          {
            [SortDirection.asc]: 'rotate-180',
            [SortDirection.desc]: 'rotate-0'
          }[sortDirection ?? next.direction],
          !sortDirection && 'opacity-0',
          !sortDirection && 'group-hover:opacity-100',
          'group-hover:bg-muted',
          'transition-all duration-100'
        )}
      />
    </Button>
  )
}
