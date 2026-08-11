import React, { useRef } from 'react'
import { clearedComparisonSearch } from '../../query'
import { useQueryContext } from '../../query-context'
import { useSiteContext } from '../../site-context'
import {
  AppNavigationLink,
  useAppNavigate
} from '../../navigation/use-app-navigate'
import {
  COMPARISON_MODES,
  ComparisonMode,
  isComparisonEnabled,
  COMPARISON_MATCH_MODE_LABELS,
  ComparisonMatchMode,
  getCurrentComparisonPeriodDisplayName,
  getSearchToApplyCustomComparisonDates
} from '../../query-time-periods'
import { BlurMenuButtonOnEscape } from '../blur-menu-button-on-escape'
import { buttonVariants } from '../../components/ui/button'
import { Popover, PopoverTrigger } from '../../components/ui/popover'
import {
  datemenuButtonClassName,
  DateMenuChevron,
  linkClassName,
  CalendarPanel,
  hiddenCalendarButtonClassName
} from './shared-menu-items'
import { DateRangeCalendar } from './date-range-calendar'
import { formatISO, nowForSite } from '../../util/date'
import { MenuSeparator } from '../nav-menu-components'

type ComparisonPeriodMenuProps = {
  open: boolean
  setOpen: (open: boolean) => void
  openCalendar: () => void
}

export const ComparisonPeriodMenuItems = ({
  closeDropdown,
  toggleCalendar
}: {
  closeDropdown: () => void
  toggleCalendar: () => void
}) => {
  const { query } = useQueryContext()

  if (!isComparisonEnabled(query.comparison)) {
    return null
  }

  return (
    <CalendarPanel className="w-56 p-1">
      {[
        ComparisonMode.off,
        ComparisonMode.previous_period,
        ComparisonMode.year_over_year
      ].map((comparisonMode) => (
        <AppNavigationLink
          key={comparisonMode}
          data-selected={query.comparison === comparisonMode}
          className={linkClassName}
          search={(search) => ({
            ...search,
            ...clearedComparisonSearch,
            comparison: comparisonMode
          })}
          onClick={closeDropdown}
        >
          {COMPARISON_MODES[comparisonMode]}
        </AppNavigationLink>
      ))}
      <AppNavigationLink
        data-selected={query.comparison === ComparisonMode.custom}
        className={linkClassName}
        search={(search) => search}
        onClick={toggleCalendar}
      >
        {COMPARISON_MODES[ComparisonMode.custom]}
      </AppNavigationLink>
      {query.comparison !== ComparisonMode.custom && (
        <>
          <MenuSeparator />
          <AppNavigationLink
            data-selected={query.match_day_of_week === true}
            className={linkClassName}
            search={(search) => ({ ...search, match_day_of_week: true })}
            onClick={closeDropdown}
          >
            {COMPARISON_MATCH_MODE_LABELS[ComparisonMatchMode.MatchDayOfWeek]}
          </AppNavigationLink>
          <AppNavigationLink
            data-selected={query.match_day_of_week === false}
            className={linkClassName}
            search={(search) => ({ ...search, match_day_of_week: false })}
            onClick={closeDropdown}
          >
            {COMPARISON_MATCH_MODE_LABELS[ComparisonMatchMode.MatchExactDate]}
          </AppNavigationLink>
        </>
      )}
    </CalendarPanel>
  )
}

export const ComparisonPeriodMenu = ({
  open,
  setOpen,
  openCalendar
}: ComparisonPeriodMenuProps) => {
  const site = useSiteContext()
  const { query } = useQueryContext()
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const closeDropdown = () => setOpen(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <BlurMenuButtonOnEscape targetRef={buttonRef} />
      <PopoverTrigger
        onFocus={(event) => {
          buttonRef.current = event.currentTarget
        }}
        className={buttonVariants({
          variant: 'outline',
          size: 'lg',
          className: datemenuButtonClassName
        })}
      >
        <span className="block truncate">
          {getCurrentComparisonPeriodDisplayName({ site, query })}
        </span>
        <DateMenuChevron />
      </PopoverTrigger>
      {open && (
        <ComparisonPeriodMenuItems
          closeDropdown={closeDropdown}
          toggleCalendar={() => {
            closeDropdown()
            openCalendar()
          }}
        />
      )}
    </Popover>
  )
}

export const ComparisonCalendarMenu = ({
  open,
  setOpen
}: {
  open: boolean
  setOpen: (open: boolean) => void
}) => {
  const site = useSiteContext()
  const navigate = useAppNavigate()
  const { query } = useQueryContext()
  const calendarButtonRef = useRef<HTMLButtonElement | null>(null)

  return (
    <div className="relative h-9 w-0">
      <Popover open={open} onOpenChange={setOpen}>
        <BlurMenuButtonOnEscape targetRef={calendarButtonRef} />
        <PopoverTrigger
          aria-label="Choose custom comparison date range"
          tabIndex={-1}
          onFocus={(event) => {
            calendarButtonRef.current = event.currentTarget
          }}
          className={hiddenCalendarButtonClassName}
        />
        {open && (
          <CalendarPanel>
            <DateRangeCalendar
              id="calendar"
              onCloseWithSelection={(selection) => {
                navigate({
                  search: getSearchToApplyCustomComparisonDates(selection)
                })
                setOpen(false)
              }}
              minDate={site.statsBegin}
              maxDate={formatISO(nowForSite(site))}
              defaultDates={
                query.compare_from && query.compare_to
                  ? [formatISO(query.compare_from), formatISO(query.compare_to)]
                  : undefined
              }
            />
          </CalendarPanel>
        )}
      </Popover>
    </div>
  )
}
