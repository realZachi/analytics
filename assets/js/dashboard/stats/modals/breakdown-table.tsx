import React, { ReactNode, useRef } from 'react'
import { Cancel01Icon, Loading03Icon } from '@hugeicons/core-free-icons'

import { SearchInput } from '../../components/search-input'
import { ColumnConfiguraton, Table } from '../../components/table'
import { QueryStatus } from '@tanstack/react-query'
import { useAppNavigate } from '../../navigation/use-app-navigate'
import { rootRoute } from '../../router'
import { Button } from '../../components/ui/button'
import { Separator } from '../../components/ui/separator'
import { Skeleton } from '../../components/ui/skeleton'
import { DashboardIcon } from '../../components/dashboard-icon'
import { ErrorPanel } from '../../components/error-panel'

export const BreakdownTable = <TListItem extends { name: string }>({
  title,
  isPending,
  isFetching,
  onSearch,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  columns,
  data,
  status,
  error,
  displayError,
  onClose
}: {
  title: ReactNode
  onSearch?: (input: string) => void
  isPending: boolean
  isFetching: boolean
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
  columns: ColumnConfiguraton<TListItem>[]
  data?: { pages: TListItem[][] }
  status?: QueryStatus
  error?: Error | null
  /** Controls whether the component displays API request errors or ignores them. */
  displayError?: boolean
  onClose?: () => void
}) => {
  const searchRef = useRef<HTMLInputElement>(null)
  const navigate = useAppNavigate()
  const handleClose =
    onClose ?? (() => navigate({ path: rootRoute.path, search: (s) => s }))

  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full">
          <h1 className="mb-0.5 shrink-0 font-heading text-base font-medium text-foreground md:text-lg">
            {title}
          </h1>
          {!isPending && isFetching && <SmallLoadingSpinner />}
          {!!onSearch && (
            <SearchInput
              searchRef={searchRef}
              onSearch={onSearch}
              className={
                displayError && status === 'error' ? 'pointer-events-none' : ''
              }
            />
          )}
        </div>
        <Button
          type="button"
          onClick={handleClose}
          aria-label="Close modal"
          size="icon-sm"
          variant="ghost"
        >
          <DashboardIcon icon={Cancel01Icon} className="size-4" />
        </Button>
      </div>
      <Separator className="my-3 md:my-4" />
      <div className="flex-1 overflow-auto pr-4 -mr-4">
        {displayError && status === 'error' && <ErrorMessage error={error} />}
        {isPending && <InitialLoadingSpinner />}
        {data && <Table<TListItem> data={data} columns={columns} />}
        {!isPending && !isFetching && hasNextPage && (
          <LoadMore
            onClick={() => fetchNextPage()}
            isFetchingNextPage={isFetchingNextPage}
          />
        )}
      </div>
    </>
  )
}

const InitialLoadingSpinner = () => (
  <div className="grid w-full gap-2 py-2" aria-label="Loading report">
    {Array.from({ length: 8 }).map((_, index) => (
      <Skeleton key={index} className="h-8 w-full" />
    ))}
  </div>
)

const SmallLoadingSpinner = () => (
  <DashboardIcon
    icon={Loading03Icon}
    className="size-4 animate-spin text-muted-foreground"
  />
)

const ErrorMessage = ({ error }: { error?: unknown }) => (
  <ErrorPanel
    className="mx-auto mt-8 max-w-lg"
    errorMessage={
      error
        ? (error as { message: string }).message
        : 'Error loading data. Refresh the page to try again'
    }
  />
)

const LoadMore = ({
  onClick,
  isFetchingNextPage
}: {
  onClick: () => void
  isFetchingNextPage: boolean
}) => (
  <div className="flex flex-col w-full my-4 items-center justify-center h-10">
    {isFetchingNextPage ? (
      <SmallLoadingSpinner />
    ) : (
      <Button onClick={onClick} type="button">
        Load more
      </Button>
    )}
  </div>
)
