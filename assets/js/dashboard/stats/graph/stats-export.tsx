import React, { useState } from 'react'
import * as api from '../../api'
import { getCurrentInterval } from './interval-picker'
import { useSiteContext } from '../../site-context'
import { useQueryContext } from '../../query-context'
import { Tooltip } from '../../util/tooltip'
import { Download01Icon, Loading03Icon } from '@hugeicons/core-free-icons'
import { DashboardIcon } from '../../components/dashboard-icon'
import { buttonVariants } from '../../components/ui/button'

export default function StatsExport() {
  const site = useSiteContext()
  const { query } = useQueryContext()
  const [exporting, setExporting] = useState(false)

  function startExport() {
    setExporting(true)
    document.cookie = 'exporting='
    pollExportReady()
  }

  function pollExportReady() {
    if (document.cookie.includes('exporting')) {
      setTimeout(pollExportReady, 1000)
    } else {
      setExporting(false)
    }
  }

  function renderLoading() {
    return (
      <span
        aria-label="Preparing export"
        className={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}
        role="status"
      >
        <DashboardIcon
          icon={Loading03Icon}
          className="size-4 animate-spin text-primary"
        />
      </span>
    )
  }

  function renderExportLink() {
    const interval = getCurrentInterval(site, query)
    const queryParams = api.queryToSearchParams(query, [
      { interval, comparison: undefined }
    ])
    const endpoint = `/${encodeURIComponent(site.domain)}/export?${queryParams}`

    return (
      <a
        aria-label="Export stats"
        className={buttonVariants({
          variant: 'ghost',
          size: 'icon-sm',
          className: 'text-muted-foreground hover:text-foreground'
        })}
        href={endpoint}
        download
        onClick={startExport}
      >
        <DashboardIcon icon={Download01Icon} className="size-4" />
      </a>
    )
  }

  return (
    <Tooltip
      info={<div className="font-normal truncate">Click to export stats</div>}
      className="size-7"
    >
      {exporting && renderLoading()}
      {!exporting && renderExportLink()}
    </Tooltip>
  )
}
