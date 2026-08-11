import React, { useMemo, useRef, useState } from 'react'
import {
  FILTER_MODAL_TO_FILTER_GROUP,
  formatFilterGroup
} from '../util/filters'
import { PlausibleSite, useSiteContext } from '../site-context'
import { filterRoute } from '../router'
import classNames from 'classnames'
import { Search02Icon } from '@hugeicons/core-free-icons'
import { AppNavigationLink } from '../navigation/use-app-navigate'
import { SearchableSegmentsSection } from './segments/searchable-segments-section'
import { useSegmentsContext } from '../filtering/segments-context'
import { BlurMenuButtonOnEscape } from './blur-menu-button-on-escape'
import { DashboardIcon } from '../components/dashboard-icon'
import { buttonVariants } from '../components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '../components/ui/popover'

export function getFilterListItems({
  propsAvailable
}: Pick<PlausibleSite, 'propsAvailable'>): Array<
  Array<{
    title: string
    modals: Array<false | keyof typeof FILTER_MODAL_TO_FILTER_GROUP>
  }>
> {
  return [
    [
      {
        title: 'URL',
        modals: ['page', 'hostname']
      },
      {
        title: 'Acquisition',
        modals: ['source', 'utm']
      }
    ],
    [
      {
        title: 'Device',
        modals: ['location', 'screen', 'browser', 'os']
      },
      {
        title: 'Behaviour',
        modals: ['goal', !!propsAvailable && 'props']
      }
    ]
  ]
}

const FilterMenuItems = ({
  closeDropdown,
  open,
  setOpen
}: {
  closeDropdown: () => void
  open: boolean
  setOpen: (open: boolean) => void
}) => {
  const site = useSiteContext()
  const columns = useMemo(() => getFilterListItems(site), [site])
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const { limitedToSegment } = useSegmentsContext()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <BlurMenuButtonOnEscape targetRef={buttonRef} />
      <PopoverTrigger
        onFocus={(event) => {
          buttonRef.current = event.currentTarget
        }}
        className={buttonVariants({
          variant: 'ghost',
          size: 'lg',
          className: 'justify-center gap-1 px-3 text-foreground'
        })}
      >
        <DashboardIcon icon={Search02Icon} className="size-4" />
        <span className="truncate font-medium">Filter</span>
      </PopoverTrigger>
      {open && (
        <PopoverContent
          ref={panelRef}
          align="end"
          className="w-[min(20rem,calc(100vw-1rem))] gap-0 p-1"
          data-testid="filtermenu"
        >
          <div className="flex">
            {columns.map((filterGroups, index) => (
              <div key={index} className="flex w-1/2 flex-col">
                {filterGroups.map(({ title, modals }) => (
                  <div key={title}>
                    <div className={titleClassName}>{title}</div>
                    {modals
                      .filter((m) => !!m)
                      .map((modalKey) => (
                        <AppNavigationLink
                          className={menuItemClassName}
                          onClick={closeDropdown}
                          key={modalKey}
                          path={filterRoute.path}
                          params={{ field: modalKey }}
                          search={(s) => s}
                        >
                          {formatFilterGroup(modalKey)}
                        </AppNavigationLink>
                      ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
          {limitedToSegment === null && (
            <SearchableSegmentsSection
              closeList={closeDropdown}
              tooltipContainerRef={panelRef}
            />
          )}
        </PopoverContent>
      )}
    </Popover>
  )
}

export const FilterMenu = () => {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative shrink-0">
      <FilterMenuItems
        closeDropdown={() => setOpen(false)}
        open={open}
        setOpen={setOpen}
      />
    </div>
  )
}

const titleClassName =
  'px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wide text-primary'

const menuItemClassName = classNames(
  'flex items-center rounded-md px-3 py-2 text-sm font-medium text-foreground outline-none transition-colors',
  'hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/50'
)
