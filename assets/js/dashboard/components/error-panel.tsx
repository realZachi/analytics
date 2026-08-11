import React, { ReactNode } from 'react'
import classNames from 'classnames'
import {
  Alert02Icon,
  Cancel01Icon,
  RefreshIcon
} from '@hugeicons/core-free-icons'
import { Alert, AlertAction, AlertDescription } from './ui/alert'
import { Button } from './ui/button'
import { DashboardIcon } from './dashboard-icon'

export const ErrorPanel = ({
  errorMessage,
  className,
  onClose,
  onRetry
}: {
  errorMessage: ReactNode
  className?: string
  onClose?: () => void
  onRetry?: () => void
}) => (
  <Alert
    variant="destructive"
    className={classNames('grid-cols-[auto_1fr] items-start', className)}
  >
    <DashboardIcon icon={Alert02Icon} className="size-4" />
    <AlertDescription className="break-all pr-14 text-destructive">
      {errorMessage}
    </AlertDescription>
    {(typeof onClose === 'function' || typeof onRetry === 'function') && (
      <AlertAction className="flex gap-1">
        {typeof onRetry === 'function' && (
          <Button
            aria-label="Retry"
            onClick={onRetry}
            size="icon-xs"
            title="Retry"
            variant="ghost"
          >
            <DashboardIcon icon={RefreshIcon} />
          </Button>
        )}
        {typeof onClose === 'function' && (
          <Button
            aria-label="Close notice"
            onClick={onClose}
            size="icon-xs"
            title="Close notice"
            variant="ghost"
          >
            <DashboardIcon icon={Cancel01Icon} />
          </Button>
        )}
      </AlertAction>
    )}
  </Alert>
)
