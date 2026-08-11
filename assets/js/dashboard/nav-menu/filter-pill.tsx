import React, { ReactNode } from 'react'
import {
  AppNavigationLink,
  AppNavigationTarget
} from '../navigation/use-app-navigate'
import classNames from 'classnames'
import { Cancel01Icon } from '@hugeicons/core-free-icons'
import { DashboardIcon } from '../components/dashboard-icon'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'

export type FilterPillProps = {
  className?: string
  plainText: string
  interactive:
    | {
        onRemoveClick?: () => void
        navigationTarget: AppNavigationTarget
      }
    | false
  children: ReactNode
  actions?: ReactNode
}

const PillContent = ({ children }: { children?: ReactNode }) => (
  <span className="inline-block max-w-2xs md:max-w-xs truncate">
    {children}
  </span>
)

export function FilterPill({
  className,
  plainText,
  children,
  interactive,
  actions
}: FilterPillProps) {
  const contentClassName = 'flex w-full h-full items-center py-2 pl-3 last:pr-3'

  return (
    <Badge
      variant="outline"
      className={classNames(
        'flex h-9 max-w-full rounded-lg bg-card px-0 py-0 text-sm text-foreground shadow-sm',
        className
      )}
    >
      {interactive ? (
        <>
          <AppNavigationLink
            className={contentClassName}
            title={`Edit filter: ${plainText}`}
            {...interactive.navigationTarget}
          >
            <PillContent>{children}</PillContent>
          </AppNavigationLink>
          {!!interactive.onRemoveClick && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              title={`Remove filter: ${plainText}`}
              className="mr-1 h-full shrink-0 rounded-md text-muted-foreground hover:text-primary"
              onClick={interactive.onRemoveClick}
            >
              <DashboardIcon icon={Cancel01Icon} className="size-4" />
            </Button>
          )}
          {actions}
        </>
      ) : (
        <>
          <div className={contentClassName} title={plainText}>
            <PillContent>{children}</PillContent>
          </div>
          {actions}
        </>
      )}
    </Badge>
  )
}
