import React from 'react'
import FadeIn from '../fade-in'
import { useQueryContext } from '../query-context'
import { Tooltip } from '../util/tooltip'
import { AlertCircleIcon } from '@hugeicons/core-free-icons'
import { DashboardIcon } from '../components/dashboard-icon'

export default function ImportedQueryUnsupportedWarning({
  loading,
  skipImportedReason,
  altCondition,
  message
}) {
  const { query } = useQueryContext()
  const tooltipMessage =
    message || 'Imported data is excluded due to applied filters'
  const show =
    query &&
    query.with_imported &&
    skipImportedReason === 'unsupported_query' &&
    query.period !== 'realtime'

  if (show || altCondition) {
    return (
      <FadeIn show={!loading} className="h-6">
        <Tooltip
          info={<span className="font-normal">{tooltipMessage}</span>}
          className="size-6 cursor-default"
        >
          <DashboardIcon
            icon={AlertCircleIcon}
            className="size-6 text-foreground"
          />
        </Tooltip>
      </FadeIn>
    )
  } else {
    return null
  }
}
