import React, { useMemo, useRef } from 'react'
import { useQueryContext } from '../../query-context'
import { useSiteContext } from '../../site-context'
import {
  isModifierPressed,
  isTyping,
  Keybind,
  KeybindHint
} from '../../keybinding'
import {
  AppNavigationLink,
  useAppNavigate
} from '../../navigation/use-app-navigate'
import {
  getCompareLinkItem,
  getDatePeriodGroups,
  LinkItem,
  QueryPeriod,
  getCurrentPeriodDisplayName,
  getSearchToApplyCustomDates,
  isComparisonForbidden
} from '../../query-time-periods'
import { useMatch } from 'react-router-dom'
import { rootRoute } from '../../router'
import { BlurMenuButtonOnEscape } from '../blur-menu-button-on-escape'
import { buttonVariants } from '../../components/ui/button'
import { Popover, PopoverTrigger } from '../../components/ui/popover'
import {
  datemenuButtonClassName,
  DateMenuChevron,
  CalendarPanel,
  hiddenCalendarButtonClassName
} from './shared-menu-items'
import { DateRangeCalendar } from './date-range-calendar'
import { formatISO, nowForSite } from '../../util/date'
import { MenuSeparator } from '../nav-menu-components'

type QueryPeriodMenuProps = {
  open: boolean
  setOpen: (open: boolean) => void
  openCalendar: () => void
}

function QueryPeriodMenuKeybinds({
  closeDropdown,
  groups
}: {
  groups: LinkItem[][]
  closeDropdown: () => void
}) {
  const dashboardRouteMatch = useMatch(rootRoute.path)
  const navigate = useAppNavigate()

  if (!dashboardRouteMatch) {
    return null
  }

  return (
    <>
      {groups.flatMap((group) =>
        group
          .filter(([[_name, keyboardKey]]) => !!keyboardKey)
          .map(([[_name, keyboardKey], { search, onEvent }]) => (
            <Keybind
              key={keyboardKey}
              keyboardKey={keyboardKey}
              type="keydown"
              handler={(event) => {
                if (typeof search === 'function') {
                  navigate({ search })
                }
                if (typeof onEvent === 'function') {
                  onEvent(event)
                } else {
                  closeDropdown()
                }
              }}
              shouldIgnoreWhen={[isModifierPressed, isTyping]}
              targetRef="document"
            />
          ))
      )}
    </>
  )
}

export const QueryPeriodMenu = ({
  open,
  setOpen,
  openCalendar
}: QueryPeriodMenuProps) => {
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
          {getCurrentPeriodDisplayName({ query, site })}
        </span>
        <DateMenuChevron />
      </PopoverTrigger>
      <QueryPeriodMenuInner
        open={open}
        closeDropdown={closeDropdown}
        toggleCalendar={() => {
          closeDropdown()
          openCalendar()
        }}
      />
    </Popover>
  )
}

const QueryPeriodMenuInner = ({
  open,
  closeDropdown,
  toggleCalendar
}: {
  open: boolean
  closeDropdown: () => void
  toggleCalendar: () => void
}) => {
  const site = useSiteContext()
  const { query, expandedSegment } = useQueryContext()

  const groups = useMemo(() => {
    const compareLink = getCompareLinkItem({
      site,
      query,
      onEvent: closeDropdown
    })

    return getDatePeriodGroups({
      site,
      onEvent: closeDropdown,
      extraItemsInLastGroup: [
        [
          ['Custom Range', 'C'],
          {
            search: (search) => search,
            isActive: ({ query }) => query.period === QueryPeriod.custom,
            onEvent: toggleCalendar
          }
        ]
      ],
      extraGroups: isComparisonForbidden({
        period: query.period,
        segmentIsExpanded: !!expandedSegment
      })
        ? []
        : [[compareLink]]
    })
  }, [site, query, closeDropdown, toggleCalendar, expandedSegment])

  return (
    <>
      <QueryPeriodMenuKeybinds closeDropdown={closeDropdown} groups={groups} />
      {open && (
        <CalendarPanel className="w-56 p-1">
          <div data-testid="datemenu">
            {groups.map((group, index) => (
              <React.Fragment key={index}>
                {group.map(
                  ([
                    [label, keyboardKey],
                    { search, isActive, onEvent, hidden }
                  ]) => {
                    if (hidden) {
                      return null
                    }

                    return (
                      <AppNavigationLink
                        key={label}
                        data-selected={isActive({ site, query })}
                        className="flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/50 data-[selected=true]:bg-accent data-[selected=true]:font-semibold"
                        search={search}
                        onClick={onEvent && ((event) => onEvent(event))}
                      >
                        {label}
                        {!!keyboardKey && (
                          <KeybindHint>{keyboardKey}</KeybindHint>
                        )}
                      </AppNavigationLink>
                    )
                  }
                )}
                {index < groups.length - 1 && <MenuSeparator />}
              </React.Fragment>
            ))}
          </div>
        </CalendarPanel>
      )}
    </>
  )
}

export const MainCalendar = ({
  open,
  setOpen
}: {
  open: boolean
  setOpen: (open: boolean) => void
}) => {
  const site = useSiteContext()
  const { query } = useQueryContext()
  const navigate = useAppNavigate()
  const calendarButtonRef = useRef<HTMLButtonElement | null>(null)

  return (
    <div className="relative h-9 w-0">
      <Popover open={open} onOpenChange={setOpen}>
        <BlurMenuButtonOnEscape targetRef={calendarButtonRef} />
        <PopoverTrigger
          aria-label="Choose custom date range"
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
                  search: getSearchToApplyCustomDates(selection)
                })
                setOpen(false)
              }}
              minDate={site.statsBegin}
              maxDate={formatISO(nowForSite(site))}
              defaultDates={
                query.from && query.to
                  ? [formatISO(query.from), formatISO(query.to)]
                  : undefined
              }
            />
          </CalendarPanel>
        )}
      </Popover>
    </div>
  )
}
