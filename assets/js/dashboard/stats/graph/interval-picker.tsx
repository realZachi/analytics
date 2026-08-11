import React, { useRef, useState } from 'react'
import { ArrowDown01Icon } from '@hugeicons/core-free-icons'
import * as storage from '../../util/storage'
import { isModifierPressed, isTyping, Keybind } from '../../keybinding'
import { useQueryContext } from '../../query-context'
import { useSiteContext, PlausibleSite } from '../../site-context'
import { useMatch } from 'react-router-dom'
import { rootRoute } from '../../router'
import { BlurMenuButtonOnEscape } from '../../nav-menu/blur-menu-button-on-escape'
import { DashboardQuery } from '../../query'
import { Dayjs } from 'dayjs'
import { QueryPeriod } from '../../query-time-periods'
import { DashboardIcon } from '../../components/dashboard-icon'
import { Button } from '../../components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '../../components/ui/popover'

const INTERVAL_LABELS: Record<string, string> = {
  minute: 'Minutes',
  hour: 'Hours',
  day: 'Days',
  week: 'Weeks',
  month: 'Months'
}

function validIntervals(site: PlausibleSite, query: DashboardQuery): string[] {
  if (query.period === QueryPeriod.custom && query.from && query.to) {
    if (query.to.diff(query.from, 'days') < 7) {
      return ['day']
    } else if (query.to.diff(query.from, 'months') < 1) {
      return ['day', 'week']
    } else if (query.to.diff(query.from, 'months') < 12) {
      return ['day', 'week', 'month']
    } else {
      return ['week', 'month']
    }
  } else {
    return site.validIntervalsByPeriod[query.period]
  }
}

function getDefaultInterval(
  query: DashboardQuery,
  validIntervals: string[]
): string {
  const defaultByPeriod: Record<string, string> = {
    day: 'hour',
    '7d': 'day',
    '6mo': 'month',
    '12mo': 'month',
    year: 'month'
  }

  if (query.period === QueryPeriod.custom && query.from && query.to) {
    return defaultForCustomPeriod(query.from, query.to)
  } else {
    return defaultByPeriod[query.period] || validIntervals[0]
  }
}

function defaultForCustomPeriod(from: Dayjs, to: Dayjs): string {
  if (to.diff(from, 'days') < 30) {
    return 'day'
  } else if (to.diff(from, 'months') < 6) {
    return 'week'
  } else {
    return 'month'
  }
}

function getStoredInterval(period: string, domain: string): string | null {
  const stored = storage.getItem(`interval__${period}__${domain}`)

  if (stored === 'date') {
    return 'day'
  } else {
    return stored
  }
}

function storeInterval(period: string, domain: string, interval: string): void {
  storage.setItem(`interval__${period}__${domain}`, interval)
}

export const getCurrentInterval = function (
  site: PlausibleSite,
  query: DashboardQuery
): string {
  const options = validIntervals(site, query)

  const storedInterval = getStoredInterval(query.period, site.domain)
  const defaultInterval = getDefaultInterval(query, options)

  if (storedInterval && options.includes(storedInterval)) {
    return storedInterval
  } else {
    return defaultInterval
  }
}

export function IntervalPicker({
  onIntervalUpdate
}: {
  onIntervalUpdate: (interval: string) => void
}): JSX.Element | null {
  const menuElement = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const { query } = useQueryContext()
  const site = useSiteContext()
  const dashboardRouteMatch = useMatch(rootRoute.path)

  if (query.period == 'realtime') {
    return null
  }

  const options = validIntervals(site, query)
  const currentInterval = getCurrentInterval(site, query)

  function updateInterval(interval: string): void {
    storeInterval(query.period, site.domain, interval)
    onIntervalUpdate(interval)
  }

  return (
    <>
      {!!dashboardRouteMatch && (
        <Keybind
          targetRef="document"
          type="keydown"
          keyboardKey="i"
          handler={() => {
            menuElement.current?.click()
          }}
          shouldIgnoreWhen={[isModifierPressed, isTyping]}
        />
      )}
      <div className="relative inline-block">
        <Popover open={open} onOpenChange={setOpen}>
          <BlurMenuButtonOnEscape targetRef={menuElement} />
          <PopoverTrigger
            ref={menuElement}
            render={<Button variant="ghost" size="sm" className="h-7" />}
          >
            {INTERVAL_LABELS[currentInterval]}
            <DashboardIcon icon={ArrowDown01Icon} className="size-3.5" />
          </PopoverTrigger>

          <PopoverContent align="end" className="w-56 gap-0.5 p-1 font-normal">
            {options.map((option) => (
              <Button
                key={option}
                variant="ghost"
                size="sm"
                onClick={() => {
                  updateInterval(option)
                  setOpen(false)
                }}
                data-selected={option == currentInterval}
                className="w-full justify-start font-normal data-[selected=true]:bg-muted data-[selected=true]:font-semibold"
              >
                {INTERVAL_LABELS[option]}
              </Button>
            ))}
          </PopoverContent>
        </Popover>
      </div>
    </>
  )
}
