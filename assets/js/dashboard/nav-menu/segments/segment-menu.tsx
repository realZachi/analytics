import React, { useEffect } from 'react'
import classNames from 'classnames'
import {
  AppNavigationLink,
  useAppNavigate
} from '../../navigation/use-app-navigate'
import {
  ArrowDown01Icon,
  Cancel01Icon,
  Copy01Icon,
  Delete02Icon
} from '@hugeicons/core-free-icons'
import { useQueryContext } from '../../query-context'
import { useRoutelessModalsContext } from '../../navigation/routeless-modals-context'
import { SavedSegment } from '../../filtering/segments'
import { DashboardQuery } from '../../query'
import { DashboardIcon } from '../../components/dashboard-icon'
import { Button, buttonVariants } from '../../components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../../components/ui/dropdown-menu'

const linkClassName = classNames(
  'w-full rounded-md px-3 py-2 text-sm font-medium text-foreground',
  'focus:bg-accent focus:text-accent-foreground'
)

export const useClearExpandedSegmentModeOnFilterClear = ({
  expandedSegment,
  query
}: {
  expandedSegment: SavedSegment | null
  query: DashboardQuery
}) => {
  const navigate = useAppNavigate()
  useEffect(() => {
    // clear edit mode on clearing all filters or removing last filter
    if (!!expandedSegment && !query.filters.length) {
      navigate({
        search: (s) => s,
        state: {
          expandedSegment: null
        },
        replace: true
      })
    }
  }, [query.filters, expandedSegment, navigate])
}

export const SegmentMenu = () => {
  const { setModal } = useRoutelessModalsContext()
  const { expandedSegment } = useQueryContext()

  if (!expandedSegment) {
    return null
  }

  return (
    <div className="flex rounded-lg shadow-sm">
      <Button
        render={
          <AppNavigationLink
            search={(s) => s}
            state={{ expandedSegment }}
            onClick={() => {
              setModal('update')
            }}
          />
        }
        nativeButton={false}
        size="lg"
        className={classNames(
          'relative rounded-e-none px-3 font-medium',
          'focus:z-10'
        )}
      >
        <span className="whitespace-nowrap">Update segment</span>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="More segment actions"
          className={buttonVariants({
            size: 'icon-lg',
            className: 'rounded-s-none border-s border-primary-foreground/30'
          })}
        >
          <DashboardIcon icon={ArrowDown01Icon} className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 p-1">
          <DropdownMenuItem
            render={
              <AppNavigationLink
                search={(s) => s}
                state={{ expandedSegment }}
                onClick={() => setModal('create')}
              />
            }
            className={linkClassName}
          >
            <DashboardIcon icon={Copy01Icon} className="size-4" />
            <span className="whitespace-nowrap">Save as a new segment</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            render={
              <AppNavigationLink
                search={(s) => s}
                state={{ expandedSegment }}
                onClick={() => setModal('delete')}
              />
            }
            className={linkClassName}
          >
            <DashboardIcon icon={Delete02Icon} className="size-4" />
            <span className="whitespace-nowrap">Delete segment</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            render={
              <AppNavigationLink
                search={(s) => ({
                  ...s,
                  filters: [],
                  labels: {}
                })}
                state={{ expandedSegment: null }}
              />
            }
            className={linkClassName}
          >
            <DashboardIcon icon={Cancel01Icon} className="size-4" />
            <span className="whitespace-nowrap">Close without saving</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
