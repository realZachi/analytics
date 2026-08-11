import classNames from 'classnames'
import React, { ReactNode, useState } from 'react'
import { useSearchableItems } from '../hooks/use-searchable-items'
import { SearchInput } from './search-input'
import { ArrowDown01Icon, MoreHorizontalIcon } from '@hugeicons/core-free-icons'
import { DashboardIcon } from './dashboard-icon'
import { Button } from './ui/button'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

export const TabWrapper = ({
  className,
  children
}: {
  className?: string
  children: ReactNode
}) => (
  <div
    className={classNames(
      'flex items-baseline gap-1 text-xs font-medium text-muted-foreground',
      className
    )}
  >
    {children}
  </div>
)

const TabButtonText = ({
  children,
  active
}: {
  children: ReactNode
  active: boolean
}) => (
  <span
    className={classNames('truncate text-left transition-colors', {
      'cursor-pointer hover:text-foreground': !active,
      'font-medium text-foreground': active
    })}
  >
    {children}
  </span>
)

export const TabButton = ({
  className,
  children,
  onClick,
  active
}: {
  className?: string
  children: ReactNode
  onClick: () => void
  active: boolean
}) => (
  <Button
    variant="ghost"
    size="xs"
    className={classNames(
      'h-7 px-2 data-[active=true]:bg-muted data-[active=true]:text-foreground',
      className
    )}
    data-active={active}
    onClick={onClick}
  >
    <TabButtonText active={active}>{children}</TabButtonText>
  </Button>
)

export const DropdownTabButton = ({
  className,
  transitionClassName,
  active,
  children,
  ...optionsProps
}: {
  className?: string
  transitionClassName?: string
  active: boolean
  children: ReactNode
} & Omit<ItemsProps, 'closeDropdown'>) => {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="xs"
            className={classNames(
              'h-7 px-2 data-[active=true]:bg-muted data-[active=true]:text-foreground',
              className
            )}
            data-active={active}
          />
        }
      >
        <TabButtonText active={active}>{children}</TabButtonText>
        <DashboardIcon icon={ArrowDown01Icon} className="size-3.5" />
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className={classNames(
          'w-(--anchor-width) min-w-64 gap-0.5 p-1',
          transitionClassName
        )}
      >
        <Items closeDropdown={() => setOpen(false)} {...optionsProps} />
      </PopoverContent>
    </Popover>
  )
}

type ItemsProps = {
  closeDropdown: () => void
  options: Array<{ selected: boolean; onClick: () => void; label: string }>
  searchable?: boolean
  collectionTitle?: string
}

const Items = ({
  options,
  searchable,
  collectionTitle,
  closeDropdown
}: ItemsProps) => {
  const {
    filteredData,
    showableData,
    showSearch,
    searching,
    searchRef,
    handleSearchInput,
    handleClearSearch,
    handleShowAll,
    countOfMoreToShow
  } = useSearchableItems({
    data: options,
    maxItemsInitially: searchable ? 5 : options.length,
    itemMatchesSearchValue: (option, trimmedSearchString) =>
      option.label.toLowerCase().includes(trimmedSearchString.toLowerCase())
  })

  const itemClassName =
    'w-full justify-start text-left font-normal data-[selected=true]:bg-muted data-[selected=true]:font-medium'

  return (
    <>
      {searchable && showSearch && (
        <div className="flex items-center py-2 px-4">
          {collectionTitle && (
            <div className="mr-4 text-sm font-medium text-foreground">
              {collectionTitle}
            </div>
          )}
          <SearchInput
            searchRef={searchRef}
            placeholderUnfocused="Press / to search"
            className="ml-auto w-full py-1"
            onSearch={handleSearchInput}
          />
        </div>
      )}
      <div className="no-scrollbar max-h-[210px] overflow-y-auto overscroll-contain">
        {showableData.map(({ selected, label, onClick }, index) => {
          return (
            <Button
              variant="ghost"
              size="default"
              key={index}
              onClick={() => {
                onClick()
                closeDropdown()
              }}
              data-selected={selected}
              className={itemClassName}
            >
              {label}
            </Button>
          )
        })}
        {countOfMoreToShow > 0 && (
          <Button
            variant="ghost"
            onClick={handleShowAll}
            className={classNames(
              itemClassName,
              'w-full justify-start text-left font-medium'
            )}
          >
            {`Show ${countOfMoreToShow} more`}
            <DashboardIcon icon={MoreHorizontalIcon} className="size-4" />
          </Button>
        )}
        {searching && !filteredData.length && (
          <Button
            variant="ghost"
            className={classNames(
              itemClassName,
              'w-full justify-start text-left font-medium'
            )}
            onClick={handleClearSearch}
          >
            No items found. Clear search to show all.
          </Button>
        )}
      </div>
    </>
  )
}
