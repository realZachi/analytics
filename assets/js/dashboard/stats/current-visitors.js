import React, { useCallback, useEffect, useState } from 'react'
import { AppNavigationLink } from '../navigation/use-app-navigate'
import * as api from '../api'
import { Tooltip } from '../util/tooltip'
import { SecondsSinceLastLoad } from '../util/seconds-since-last-load'
import { useQueryContext } from '../query-context'
import { useSiteContext } from '../site-context'
import { useLastLoadContext } from '../last-load-context'
import classNames from 'classnames'
import { CircleIcon } from '@hugeicons/core-free-icons'
import { DashboardIcon } from '../components/dashboard-icon'
import { buttonVariants } from '../components/ui/button'

export default function CurrentVisitors({
  className = '',
  tooltipBoundaryRef
}) {
  const { query } = useQueryContext()
  const lastLoadTimestamp = useLastLoadContext()
  const site = useSiteContext()
  const [currentVisitors, setCurrentVisitors] = useState(null)

  const updateCount = useCallback(() => {
    api
      .get(`/api/stats/${encodeURIComponent(site.domain)}/current-visitors`)
      .then((res) => setCurrentVisitors(res))
  }, [site.domain])

  useEffect(() => {
    document.addEventListener('tick', updateCount)

    return () => {
      document.removeEventListener('tick', updateCount)
    }
  }, [updateCount])

  useEffect(() => {
    updateCount()
  }, [query, updateCount])

  if (currentVisitors !== null && query.filters.length === 0) {
    return (
      <Tooltip
        info={
          <div>
            <p className="whitespace-nowrap text-small">
              Last updated{' '}
              <SecondsSinceLastLoad lastLoadTimestamp={lastLoadTimestamp} />s
              ago
            </p>
            <p className="whitespace-nowrap font-normal text-xs">
              Click to view realtime dashboard
            </p>
          </div>
        }
        boundary={tooltipBoundaryRef.current}
      >
        <AppNavigationLink
          search={(prev) => ({ ...prev, period: 'realtime' })}
          className={buttonVariants({
            variant: 'ghost',
            size: 'lg',
            className: classNames(
              'h-9 px-0 text-xs font-bold text-muted-foreground hover:text-foreground md:text-sm',
              className
            )
          })}
        >
          <DashboardIcon
            icon={CircleIcon}
            className="mr-1 size-2 text-emerald-500"
          />
          <span>
            {currentVisitors}
            <span className="hidden lg:inline">
              {' '}
              current visitor{currentVisitors === 1 ? '' : 's'}
            </span>
          </span>
        </AppNavigationLink>
      </Tooltip>
    )
  } else {
    return null
  }
}
