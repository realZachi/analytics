import React from 'react'
import { Tooltip } from '../../util/tooltip'
import { SecondsSinceLastLoad } from '../../util/seconds-since-last-load'
import classNames from 'classnames'
import * as storage from '../../util/storage'
import { formatDateRange } from '../../util/date'
import { useQueryContext } from '../../query-context'
import { useSiteContext } from '../../site-context'
import { useLastLoadContext } from '../../last-load-context'
import { ChangeArrow } from '../reports/change-arrow'
import {
  MetricFormatterShort,
  MetricFormatterLong
} from '../reports/metric-formatter'

function topStatNumberShort(metric, value) {
  const formatter = MetricFormatterShort[metric]
  return formatter(value)
}

function topStatNumberLong(metric, value) {
  const formatter = MetricFormatterLong[metric]
  return formatter(value)
}

export default function TopStats({
  data,
  onMetricUpdate,
  tooltipBoundary,
  graphableMetrics
}) {
  const { query } = useQueryContext()
  const lastLoadTimestamp = useLastLoadContext()
  const site = useSiteContext()

  const isComparison = query.comparison && data && data.comparing_from

  function tooltip(stat) {
    let statName = stat.name.toLowerCase()
    const warning = warningText(stat.graph_metric, site)
    statName = stat.value === 1 ? statName.slice(0, -1) : statName

    return (
      <div>
        {isComparison && (
          <div className="whitespace-nowrap">
            {topStatNumberLong(stat.graph_metric, stat.value)} vs.{' '}
            {topStatNumberLong(stat.graph_metric, stat.comparison_value)}{' '}
            {statName}
            <ChangeArrow
              metric={stat.graph_metric}
              change={stat.change}
              className="pl-4 text-xs text-background"
            />
          </div>
        )}

        {!isComparison && (
          <div className="whitespace-nowrap">
            {topStatNumberLong(stat.graph_metric, stat.value)} {statName}
          </div>
        )}

        {stat.name === 'Current visitors' && (
          <p className="font-normal text-xs">
            Last updated{' '}
            <SecondsSinceLastLoad lastLoadTimestamp={lastLoadTimestamp} />s ago
          </p>
        )}

        {warning ? (
          <p className="font-normal text-xs whitespace-nowrap">* {warning}</p>
        ) : null}
      </div>
    )
  }

  function warningText(metric) {
    const warning = data.meta.metric_warnings?.[metric]
    if (!warning) {
      return null
    }

    if (
      metric === 'scroll_depth' &&
      warning.code === 'no_imported_scroll_depth'
    ) {
      return 'Does not include imported data'
    }

    if (metric === 'time_on_page') {
      return warning.message
    }

    return null
  }

  function canMetricBeGraphed(stat) {
    return graphableMetrics.includes(stat.graph_metric)
  }

  function maybeUpdateMetric(stat) {
    if (canMetricBeGraphed(stat)) {
      storage.setItem(`metric__${site.domain}`, stat.graph_metric)
      onMetricUpdate(stat.graph_metric)
    }
  }

  function getStoredMetric() {
    return storage.getItem(`metric__${site.domain}`)
  }

  function renderStatName(stat, isSelected) {
    const [statDisplayName, statExtraName] = stat.name.split(/(\(.+\))/g)

    const statDisplayNameClass = classNames(
      'flex max-w-full items-center truncate text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase',
      {
        'text-primary': isSelected,
        'group-hover:text-foreground': !isSelected
      }
    )

    return (
      <div className={statDisplayNameClass} title={stat.name}>
        <span className="truncate">{statDisplayName}</span>
        {statExtraName && (
          <span className="ml-1 hidden shrink-0 sm:inline-block">
            {statExtraName}
          </span>
        )}
        {warningText(stat.graph_metric) && (
          <span className="ml-1 inline-block shrink-0">*</span>
        )}
        {stat.name === 'Current visitors' && (
          <span className="relative ml-2 flex size-2 shrink-0">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60 motion-reduce:animate-none" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
        )}
      </div>
    )
  }

  function renderStat(stat) {
    const isSelected = stat.graph_metric === getStoredMetric()
    const graphable = canMetricBeGraphed(stat)
    const statClassName = classNames(
      'group relative flex min-h-24 w-full min-w-0 flex-col items-start justify-between gap-3 bg-card px-4 py-3.5 text-left select-none',
      {
        'cursor-pointer transition-colors hover:bg-muted/50 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50':
          graphable,
        'bg-primary/[0.04] after:absolute after:inset-x-4 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary':
          isSelected
      }
    )

    const statContent = (
      <>
        {renderStatName(stat, isSelected)}
        <div className="min-w-0">
          <div className="flex min-w-0 items-baseline gap-2">
            <p
              className="truncate font-mono text-xl leading-none font-semibold tracking-tight text-foreground xl:text-2xl"
              id={stat.graph_metric}
            >
              {topStatNumberShort(stat.graph_metric, stat.value)}
            </p>
            {!isComparison && stat.change != null ? (
              <ChangeArrow
                metric={stat.graph_metric}
                change={stat.change}
                className="shrink-0 text-xs font-medium text-muted-foreground"
              />
            ) : null}
          </div>
          {isComparison ? (
            <p className="mt-1 truncate text-[11px] text-muted-foreground">
              {formatDateRange(site, data.from, data.to)}
            </p>
          ) : null}
        </div>

        {isComparison ? (
          <div className="min-w-0 border-t border-border/70 pt-2">
            <p className="truncate font-mono text-lg leading-none font-medium text-muted-foreground">
              {topStatNumberShort(stat.graph_metric, stat.comparison_value)}
            </p>
            <p className="mt-1 truncate text-[11px] text-muted-foreground">
              {formatDateRange(site, data.comparing_from, data.comparing_to)}
            </p>
          </div>
        ) : null}
      </>
    )

    return (
      <Tooltip
        key={stat.name}
        info={tooltip(stat)}
        className="h-full w-full min-w-0"
        boundary={tooltipBoundary}
      >
        {graphable ? (
          <button
            aria-pressed={isSelected}
            className={statClassName}
            onClick={() => maybeUpdateMetric(stat)}
            type="button"
          >
            {statContent}
          </button>
        ) : (
          <div className={statClassName}>{statContent}</div>
        )}
      </Tooltip>
    )
  }

  const stats =
    data && data.top_stats.filter((stat) => stat.value !== null).map(renderStat)

  return stats || null
}
