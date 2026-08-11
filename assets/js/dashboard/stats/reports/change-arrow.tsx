import React from 'react'
import { Metric } from '../../../types/query-api'
import { numberShortFormatter } from '../../util/number-formatter'
import {
  ArrowDownRight01Icon,
  ArrowUpRight01Icon
} from '@hugeicons/core-free-icons'
import classNames from 'classnames'
import { DashboardIcon } from '../../components/dashboard-icon'

export function ChangeArrow({
  change,
  metric,
  className,
  hideNumber
}: {
  change: number
  metric: Metric
  className: string
  hideNumber?: boolean
}) {
  let icon = null
  const arrowClassName = classNames(
    color(change, metric),
    'mb-0.5 inline-block size-3'
  )

  if (change > 0) {
    icon = (
      <DashboardIcon icon={ArrowUpRight01Icon} className={arrowClassName} />
    )
  } else if (change < 0) {
    icon = (
      <DashboardIcon icon={ArrowDownRight01Icon} className={arrowClassName} />
    )
  }

  const formattedChange = hideNumber
    ? null
    : `${icon ? ' ' : ''}${numberShortFormatter(Math.abs(change))}%`

  return (
    <span className={className} data-testid="change-arrow">
      {icon}
      {formattedChange}
    </span>
  )
}

function color(change: number, metric: Metric) {
  const invert = metric === 'bounce_rate'

  return change > 0 != invert ? 'text-chart-2' : 'text-destructive'
}
