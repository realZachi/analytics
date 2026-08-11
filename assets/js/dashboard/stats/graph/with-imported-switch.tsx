import React from 'react'
import classNames from 'classnames'
import { useQueryContext } from '../../query-context'
import { AppNavigationLink } from '../../navigation/use-app-navigate'
import { Tooltip } from '../../util/tooltip'
import { ChartIncreaseIcon } from '@hugeicons/core-free-icons'
import { DashboardIcon } from '../../components/dashboard-icon'
import { buttonVariants } from '../../components/ui/button'

export default function WithImportedSwitch({
  tooltipMessage,
  disabled
}: {
  tooltipMessage: string
  disabled?: boolean
}) {
  const { query } = useQueryContext()
  const importsSwitchedOn = query.with_imported

  const iconClass = classNames('size-4', {
    'text-foreground': importsSwitchedOn,
    'text-muted-foreground': !importsSwitchedOn
  })

  return (
    <Tooltip
      info={<div className="font-normal truncate">{tooltipMessage}</div>}
      className="size-7"
    >
      <AppNavigationLink
        aria-label={
          importsSwitchedOn ? 'Hide imported data' : 'Show imported data'
        }
        search={
          disabled
            ? (search) => search
            : (search) => ({ ...search, with_imported: !importsSwitchedOn })
        }
        className={buttonVariants({
          variant: 'ghost',
          size: 'icon-sm',
          className: 'text-muted-foreground hover:text-foreground'
        })}
      >
        <DashboardIcon icon={ChartIncreaseIcon} className={iconClass} />
      </AppNavigationLink>
    </Tooltip>
  )
}
