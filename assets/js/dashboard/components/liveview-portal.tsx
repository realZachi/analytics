/**
 * Component used for embedding LiveView components inside React.
 *
 * The content of the portal is completely excluded from React re-renders with
 * a hardwired `React.memo`.
 */

import React from 'react'
import classNames from 'classnames'
import { Skeleton } from './ui/skeleton'

const MIN_HEIGHT = 380

type LiveViewPortalProps = {
  id: string
  className?: string
}

export const LiveViewPortal = React.memo(
  function ({ id, className }: LiveViewPortalProps) {
    return (
      <div
        id={id}
        className={classNames('group', className)}
        style={{ width: '100%', border: '0', minHeight: MIN_HEIGHT }}
      >
        <div
          className="w-full flex flex-col justify-center group-has-[[data-phx-teleported]]:hidden"
          style={{ minHeight: MIN_HEIGHT }}
        >
          <div className="grid w-full gap-2 px-4" aria-label="Loading report">
            <div className="mb-2 flex justify-between">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-40" />
            </div>
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-8 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  },
  () => true
)
