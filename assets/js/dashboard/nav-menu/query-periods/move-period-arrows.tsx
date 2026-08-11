import React, { useMemo } from 'react'
import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { shiftQueryPeriod, getDateForShiftedPeriod } from '../../query'
import classNames from 'classnames'
import { useQueryContext } from '../../query-context'
import { useSiteContext } from '../../site-context'
import { NavigateKeybind } from '../../keybinding'
import { AppNavigationLink } from '../../navigation/use-app-navigate'
import { QueryPeriod } from '../../query-time-periods'
import { useMatch } from 'react-router-dom'
import { rootRoute } from '../../router'
import { DashboardIcon } from '../../components/dashboard-icon'
import { Button } from '../../components/ui/button'

const ArrowKeybind = ({
  keyboardKey
}: {
  keyboardKey: 'ArrowLeft' | 'ArrowRight'
}) => {
  const site = useSiteContext()
  const { query } = useQueryContext()

  const search = useMemo(
    () =>
      shiftQueryPeriod({
        query,
        site,
        direction: ({ ArrowLeft: -1, ArrowRight: 1 } as const)[keyboardKey],
        keybindHint: keyboardKey
      }),
    [site, query, keyboardKey]
  )

  return (
    <NavigateKeybind
      type="keydown"
      keyboardKey={keyboardKey}
      navigateProps={{ search }}
    />
  )
}

function ArrowIcon({
  direction,
  disabled = false
}: {
  direction: 'left' | 'right'
  disabled?: boolean
}) {
  return (
    <DashboardIcon
      icon={direction === 'left' ? ArrowLeft01Icon : ArrowRight01Icon}
      className={classNames(
        'size-4',
        disabled ? 'text-muted-foreground/50' : 'text-foreground'
      )}
    />
  )
}

export function MovePeriodArrows({ className }: { className?: string }) {
  const periodsWithArrows = [
    QueryPeriod.year,
    QueryPeriod.month,
    QueryPeriod.day
  ]
  const { query } = useQueryContext()
  const site = useSiteContext()
  const dashboardRouteMatch = useMatch(rootRoute.path)

  if (!periodsWithArrows.includes(query.period)) {
    return null
  }

  const canGoBack =
    getDateForShiftedPeriod({ site, query, direction: -1 }) !== null
  const canGoForward =
    getDateForShiftedPeriod({ site, query, direction: 1 }) !== null

  const sharedClass = 'shrink-0 transition-colors duration-150'
  const enabledClass = 'hover:bg-accent hover:text-accent-foreground'
  const disabledClass = 'cursor-not-allowed bg-muted text-muted-foreground'

  return (
    <div
      className={classNames(
        'mr-2 flex rounded-lg shadow-sm sm:mr-4',
        className
      )}
    >
      <Button
        render={
          <AppNavigationLink
            aria-disabled={!canGoBack}
            search={
              canGoBack
                ? shiftQueryPeriod({
                    site,
                    query,
                    direction: -1,
                    keybindHint: null
                  })
                : (search) => search
            }
          />
        }
        nativeButton={false}
        variant="outline"
        size="icon-lg"
        className={classNames(sharedClass, 'rounded-e-none focus:z-10', {
          [enabledClass]: canGoBack,
          [disabledClass]: !canGoBack
        })}
      >
        <ArrowIcon direction="left" disabled={!canGoBack} />
      </Button>
      <Button
        render={
          <AppNavigationLink
            aria-disabled={!canGoForward}
            search={
              canGoForward
                ? shiftQueryPeriod({
                    site,
                    query,
                    direction: 1,
                    keybindHint: null
                  })
                : (search) => search
            }
          />
        }
        nativeButton={false}
        variant="outline"
        size="icon-lg"
        className={classNames(sharedClass, 'rounded-s-none', {
          [enabledClass]: canGoForward,
          [disabledClass]: !canGoForward
        })}
      >
        <ArrowIcon direction="right" disabled={!canGoForward} />
      </Button>
      {!!dashboardRouteMatch && <ArrowKeybind keyboardKey="ArrowLeft" />}
      {!!dashboardRouteMatch && <ArrowKeybind keyboardKey="ArrowRight" />}
    </div>
  )
}
