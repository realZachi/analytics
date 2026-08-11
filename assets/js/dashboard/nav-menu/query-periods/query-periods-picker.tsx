import React, { useState } from 'react'
import classNames from 'classnames'
import { useQueryContext } from '../../query-context'
import { isComparisonEnabled } from '../../query-time-periods'
import { MovePeriodArrows } from './move-period-arrows'
import { MainCalendar, QueryPeriodMenu } from './query-period-menu'
import {
  ComparisonCalendarMenu,
  ComparisonPeriodMenu
} from './comparison-period-menu'

export function QueryPeriodsPicker({ className }: { className?: string }) {
  const { query } = useQueryContext()
  const isComparing = isComparisonEnabled(query.comparison)
  const [periodMenuOpen, setPeriodMenuOpen] = useState(false)
  const [mainCalendarOpen, setMainCalendarOpen] = useState(false)
  const [comparisonMenuOpen, setComparisonMenuOpen] = useState(false)
  const [comparisonCalendarOpen, setComparisonCalendarOpen] = useState(false)

  return (
    <div className={classNames('flex shrink-0', className)}>
      <MovePeriodArrows className={isComparing ? 'hidden md:flex' : ''} />
      <div className="min-w-36 lg:w-48">
        <QueryPeriodMenu
          open={periodMenuOpen}
          setOpen={setPeriodMenuOpen}
          openCalendar={() => setMainCalendarOpen(true)}
        />
      </div>
      <MainCalendar open={mainCalendarOpen} setOpen={setMainCalendarOpen} />
      {isComparing && (
        <>
          <div className="my-auto px-1 text-sm font-medium text-foreground">
            <span className="px-1">vs.</span>
          </div>
          <div className="min-w-36 lg:w-48">
            <ComparisonPeriodMenu
              open={comparisonMenuOpen}
              setOpen={setComparisonMenuOpen}
              openCalendar={() => setComparisonCalendarOpen(true)}
            />
          </div>
          <ComparisonCalendarMenu
            open={comparisonCalendarOpen}
            setOpen={setComparisonCalendarOpen}
          />
        </>
      )}
    </div>
  )
}
