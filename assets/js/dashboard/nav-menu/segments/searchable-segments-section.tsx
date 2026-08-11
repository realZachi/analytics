import React, { RefObject, useCallback, useState } from 'react'
import { useQueryContext } from '../../query-context'
import { useSiteContext } from '../../site-context'
import {
  SavedSegmentPublic,
  SavedSegment,
  SEGMENT_TYPE_LABELS,
  isListableSegment,
  getSearchToSetSegmentFilter
} from '../../filtering/segments'
import classNames from 'classnames'
import { Tooltip } from '../../util/tooltip'
import { SegmentAuthorship } from '../../segments/segment-authorship'
import { AppNavigationLink } from '../../navigation/use-app-navigate'
import { MenuSeparator } from '../nav-menu-components'
import { Role, useUserContext } from '../../user-context'
import { useSegmentsContext } from '../../filtering/segments-context'
import { useSearchableItems } from '../../hooks/use-searchable-items'
import { MoreHorizontalIcon } from '@hugeicons/core-free-icons'
import { isModifierPressed, Keybind } from '../../keybinding'
import { useDebounce } from '../../custom-hooks'
import { DashboardIcon } from '../../components/dashboard-icon'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'

const linkClassName = classNames(
  'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-foreground outline-none transition-colors',
  'hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/50'
)

const INITIAL_SEGMENTS_SHOWN = 5

export const SearchableSegmentsSection = ({
  closeList,
  tooltipContainerRef
}: {
  closeList: () => void
  tooltipContainerRef: RefObject<HTMLElement>
}) => {
  const site = useSiteContext()
  const segmentsContext = useSegmentsContext()

  const { expandedSegment } = useQueryContext()
  const user = useUserContext()

  const isPublicListQuery = !user.loggedIn || user.role === Role.public

  const {
    data,
    filteredData,
    showableData,
    showSearch,
    countOfMoreToShow,
    handleShowAll,
    handleClearSearch,
    handleSearchInput,
    searchRef,
    searching
  } = useSearchableItems({
    data: segmentsContext.segments.filter((segment) =>
      isListableSegment({ segment, site, user })
    ),
    maxItemsInitially: INITIAL_SEGMENTS_SHOWN,
    itemMatchesSearchValue: (segment, trimmedSearch) =>
      segment.name.toLowerCase().includes(trimmedSearch.toLowerCase())
  })

  if (expandedSegment) {
    return null
  }

  if (!data.length) {
    return null
  }

  return (
    <>
      <MenuSeparator />
      <div className="flex items-center py-2 px-4">
        <div className="mr-4 text-xs font-semibold uppercase tracking-wide text-primary">
          Segments
        </div>
        {showSearch && (
          <SegmentsSearchInput
            searchRef={searchRef}
            placeholderUnfocused="Press / to search"
            className="ml-auto w-full py-1"
            onSearch={handleSearchInput}
          />
        )}
      </div>

      <div className="max-h-[210px] overflow-y-auto">
        {showableData.map((segment) => {
          return (
            <Tooltip
              containerRef={tooltipContainerRef}
              className="group"
              key={segment.id}
              info={
                <div className="max-w-60">
                  <div className="break-all">{segment.name}</div>
                  <div className="font-normal text-xs">
                    {SEGMENT_TYPE_LABELS[segment.type]}
                  </div>

                  <SegmentAuthorship
                    className="font-normal text-xs"
                    {...(isPublicListQuery
                      ? {
                          showOnlyPublicData: true,
                          segment: segment as SavedSegmentPublic
                        }
                      : {
                          showOnlyPublicData: false,
                          segment: segment as SavedSegment
                        })}
                  />
                </div>
              }
            >
              <SegmentLink {...segment} closeList={closeList} />
            </Tooltip>
          )
        })}
        {countOfMoreToShow > 0 && (
          <Tooltip
            className="group"
            info={null}
            containerRef={tooltipContainerRef}
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={classNames(
                linkClassName,
                'h-auto justify-start py-2 font-bold text-primary hover:text-primary'
              )}
              onClick={handleShowAll}
            >
              {`Show ${countOfMoreToShow} more`}
              <DashboardIcon icon={MoreHorizontalIcon} className="size-5" />
            </Button>
          </Tooltip>
        )}
      </div>
      {searching && !filteredData.length && (
        <Tooltip
          className="group"
          info={null}
          containerRef={tooltipContainerRef}
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={classNames(
              linkClassName,
              'h-auto justify-start py-2 font-bold text-primary hover:text-primary'
            )}
            onClick={handleClearSearch}
          >
            No segments found. Clear search to show all.
          </Button>
        </Tooltip>
      )}
    </>
  )
}

const SegmentsSearchInput = ({
  searchRef,
  onSearch,
  className,
  placeholderUnfocused
}: {
  searchRef: RefObject<HTMLInputElement>
  onSearch: (value: string) => void
  className?: string
  placeholderUnfocused: string
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const debouncedSearch = useDebounce(onSearch)

  const focusSearch = useCallback(
    (event: KeyboardEvent) => {
      searchRef.current?.focus()
      event.stopPropagation()
    },
    [searchRef]
  )

  return (
    <>
      <Keybind
        keyboardKey="Escape"
        type="keyup"
        handler={() => searchRef.current?.blur()}
        shouldIgnoreWhen={[isModifierPressed, () => !isFocused]}
        targetRef={searchRef}
      />
      <Keybind
        keyboardKey="/"
        type="keyup"
        handler={focusSearch}
        shouldIgnoreWhen={[isModifierPressed, () => isFocused]}
        targetRef="document"
      />
      <Input
        ref={searchRef}
        type="search"
        className={classNames('h-7 min-w-0 text-sm', className)}
        placeholder={isFocused ? 'Search' : placeholderUnfocused}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={(event) => debouncedSearch(event.target.value)}
      />
    </>
  )
}

const SegmentLink = ({
  id,
  name,
  closeList
}: Pick<SavedSegment, 'id' | 'name'> & {
  closeList: () => void
}) => {
  return (
    <AppNavigationLink
      className={linkClassName}
      key={id}
      onClick={closeList}
      search={getSearchToSetSegmentFilter({ id, name })}
    >
      <div className="truncate">{name}</div>
    </AppNavigationLink>
  )
}
