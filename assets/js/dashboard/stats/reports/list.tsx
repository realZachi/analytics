import React, { useState, useEffect, useCallback, ReactNode } from 'react'
import { AppNavigationLinkProps } from '../../navigation/use-app-navigate'
import FlipMove from 'react-flip-move'

import FadeIn from '../../fade-in'
import MoreLink from '../more-link'
import Bar from '../bar'
import LazyLoader from '../../components/lazy-loader'
import { trimURL } from '../../util/url'
import {
  isRealTimeDashboard,
  hasConversionGoalFilter
} from '../../util/filters'
import { useQueryContext } from '../../query-context'
import { Metric } from './metrics'
import { DrilldownLink, FilterInfo } from '../../components/drilldown-link'
import { BreakdownResultMeta } from '../../query'
import { LinkSquare01Icon } from '@hugeicons/core-free-icons'
import { DashboardIcon } from '../../components/dashboard-icon'
import { Skeleton } from '../../components/ui/skeleton'

const MAX_ITEMS = 9
export const MIN_HEIGHT = 380
const ROW_HEIGHT = 32
const ROW_GAP_HEIGHT = 4
const DATA_CONTAINER_HEIGHT =
  (ROW_HEIGHT + ROW_GAP_HEIGHT) * (MAX_ITEMS - 1) + ROW_HEIGHT
const COL_MIN_WIDTH = 70

function ExternalLink<T>({
  item,
  getExternalLinkUrl,
  isTapped
}: {
  item: T
  getExternalLinkUrl?: (item: T) => string
  isTapped?: boolean
}) {
  const dest = getExternalLinkUrl && getExternalLinkUrl(item)
  if (dest) {
    const className = isTapped
      ? 'visible md:invisible md:group-hover/row:visible'
      : 'invisible md:group-hover/row:visible'

    return (
      <a
        target="_blank"
        rel="noreferrer"
        href={dest}
        className={className}
        aria-label="Open external link"
      >
        <DashboardIcon
          icon={LinkSquare01Icon}
          className="mb-0.5 inline size-3.5 text-muted-foreground hover:text-foreground"
        />
      </a>
    )
  }

  return null
}

export interface SharedReportProps<
  TListItem extends Record<string, unknown> = Record<string, unknown>,
  TResponse = { results: TListItem[]; meta: BreakdownResultMeta }
> {
  metrics: Metric[]
  /** A function that takes a list item and returns the filter
   *    that should be applied when the list item is clicked. All existing filters matching prefix
   *    are removed. If a list item is not supposed to be clickable, this function should
   *    return `null` for that list item. */
  getFilterInfo: (item: TListItem) => FilterInfo | null
  /** A function that takes a list item and returns the HTML of an icon */
  renderIcon?: (item: TListItem) => ReactNode
  /** A function that takes a list item and returns an external URL
   *     to navigate to. If this prop is given, an additional icon is rendered upon hovering
   *     the entry. */
  getExternalLinkUrl?: (item: TListItem) => string
  /** A function that defines the data
   *    to be rendered, and should return a list of objects under a `results` key. Think of
   *    these objects as rows. The number of columns that are **actually rendered** is also
   *    configurable through the `metrics` prop, which also defines the keys under which
   *    column values are read, and how they're rendered. */
  fetchData: () => Promise<TResponse>
  afterFetchData?: (response: TResponse) => void
  afterFetchNextPage?: (response: TResponse) => void
}

type ListReportProps = {
  /** What each entry in the list represents (for UI only). */
  keyLabel: string
  metrics: Metric[]
  colMinWidth?: number
  /** Navigation props to be passed to "More" link, if any. */
  detailsLinkProps?: AppNavigationLinkProps
  /** Function with additional action to be taken when a list entry is clicked. */
  onClick?: () => void
  /** Color of the comparison bars in light-mode. */
  color?: string
}

/**
 * @returns {HTMLElement} Table of metrics, in the following format:
 * | keyLabel           | METRIC_1.renderLabel(query) | METRIC_2.renderLabel(query) | ...
 * |--------------------|-----------------------------|-----------------------------| ---
 * | LISTITEM_1.name    | LISTITEM_1[METRIC_1.key]    | LISTITEM_1[METRIC_2.key]    | ...
 * | LISTITEM_2.name    | LISTITEM_2[METRIC_1.key]    | LISTITEM_2[METRIC_2.key]    | ...
 */
export default function ListReport<
  TListItem extends Record<string, unknown> & { name: string }
>({
  keyLabel,
  metrics,
  colMinWidth = COL_MIN_WIDTH,
  afterFetchData,
  detailsLinkProps,
  onClick,
  color,
  getFilterInfo,
  renderIcon,
  getExternalLinkUrl,
  fetchData
}: Omit<SharedReportProps<TListItem>, 'afterFetchNextPage'> & ListReportProps) {
  const { query } = useQueryContext()
  const [state, setState] = useState<{
    loading: boolean
    list: TListItem[] | null
    meta: BreakdownResultMeta | null
  }>({ loading: true, list: null, meta: null })
  const [visible, setVisible] = useState(false)
  const [tappedRow, setTappedRow] = useState<string | null>(null)

  const isRealtime = isRealTimeDashboard(query)
  const goalFilterApplied = hasConversionGoalFilter(query)

  const getData = useCallback(() => {
    if (!isRealtime) {
      setState({ loading: true, list: null, meta: null })
    }
    fetchData().then((response) => {
      if (afterFetchData) {
        afterFetchData(response)
      }

      setState({ loading: false, list: response.results, meta: response.meta })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyLabel, query])

  const onVisible = () => {
    setVisible(true)
  }

  useEffect(() => {
    if (isRealtime) {
      // When a goal filter is applied or removed, we always want the component to go into a
      // loading state, even in realtime mode, because the metrics list will change. We can
      // only read the new metrics once the new list is loaded.
      setState({ loading: true, list: null, meta: null })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goalFilterApplied])

  useEffect(() => {
    if (visible) {
      if (isRealtime) {
        document.addEventListener('tick', getData)
      }
      getData()
    }

    return () => {
      document.removeEventListener('tick', getData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyLabel, query, visible])

  // returns a filtered `metrics` list. Since currently, the backend can return different
  // metrics based on filters and existing data, this function validates that the metrics
  // we want to display are actually there in the API response.
  function getAvailableMetrics() {
    return metrics.filter((metric) =>
      state.list
        ? state.list.some((listItem) => listItem[metric.key] != null)
        : false
    )
  }

  function hiddenOnMobileClass(metric: Metric) {
    if (metric.meta.hiddenOnMobile) {
      return 'hidden md:block'
    } else {
      return ''
    }
  }

  function showOnHoverClass(metric: Metric, listItemName: string) {
    if (!metric.meta.showOnHover) {
      return ''
    }

    // On mobile: show if row is tapped, hide otherwise
    // On desktop: slide in from right when hovering
    if (tappedRow === listItemName) {
      return 'translate-x-0 opacity-100 transition-all duration-150'
    } else {
      return 'translate-x-[100%] opacity-0 transition-all duration-150 md:group-hover/report:translate-x-0 md:group-hover/report:opacity-100'
    }
  }

  function slideLeftClass(
    metricIndex: number,
    showOnHoverIndex: number,
    hasShowOnHoverMetric: boolean,
    listItemName: string
  ) {
    // Columns before the showOnHover column should slide left when it appears
    if (!hasShowOnHoverMetric || metricIndex >= showOnHoverIndex) {
      return ''
    }

    if (tappedRow === listItemName) {
      return 'transition-transform duration-150 translate-x-0'
    } else {
      return 'transition-transform duration-150 translate-x-[100%] md:group-hover/report:translate-x-0'
    }
  }

  function renderReport() {
    if (state.list && state.list.length > 0) {
      return (
        <div className="h-full flex flex-col">
          <div style={{ height: ROW_HEIGHT }}>{renderReportHeader()}</div>

          <div
            className="group/report"
            style={{ minHeight: DATA_CONTAINER_HEIGHT }}
          >
            <FlipMove className="grow">
              {state.list.slice(0, MAX_ITEMS).map(renderRow)}
            </FlipMove>
          </div>

          {!!detailsLinkProps && !state.loading && (
            <MoreLink
              onClick={undefined}
              className={'mt-3'}
              linkProps={detailsLinkProps}
              list={state.list}
            />
          )}
        </div>
      )
    }
    return renderNoDataYet()
  }

  function renderReportHeader() {
    const metricLabels = getAvailableMetrics()
      .filter((metric) => !metric.meta.showOnHover)
      .map((metric) => {
        return (
          <div
            key={metric.key}
            className={`${metric.key} text-right ${hiddenOnMobileClass(metric)}`}
            style={{ minWidth: colMinWidth }}
          >
            {metric.renderLabel(query)}
          </div>
        )
      })

    return (
      <div className="flex w-full items-center pt-3 text-xs font-semibold text-muted-foreground">
        <span className="grow truncate">{keyLabel}</span>
        {metricLabels}
      </div>
    )
  }

  function renderRow(listItem: TListItem) {
    const handleRowClick = (e: React.MouseEvent) => {
      if (window.innerWidth < 768 && !(e.target as HTMLElement).closest('a')) {
        if (tappedRow === listItem.name) {
          setTappedRow(null)
        } else {
          setTappedRow(listItem.name)
        }
      }
    }

    return (
      <div key={listItem.name} style={{ minHeight: ROW_HEIGHT }}>
        <div
          className="group/row flex w-full cursor-pointer items-center rounded-md hover:bg-muted/70 md:cursor-default"
          style={{ marginTop: ROW_GAP_HEIGHT }}
          onClick={handleRowClick}
        >
          {renderBarFor(listItem)}
          {renderMetricValuesFor(listItem)}
        </div>
      </div>
    )
  }

  function renderBarFor(listItem: TListItem) {
    const lightBackground =
      color || 'bg-primary/10 group-hover/row:bg-primary/20'
    const metricToPlot = metrics.find((metric) => metric.meta.plot)?.key

    return (
      <div className="grow w-full overflow-hidden">
        <Bar
          maxWidthDeduction={undefined}
          count={listItem[metricToPlot]}
          all={state.list}
          bg={lightBackground}
          plot={metricToPlot}
        >
          <div className="relative z-9 flex w-full items-center justify-start gap-x-1.5 break-all px-2 py-1.5 text-sm text-foreground">
            <DrilldownLink
              filterInfo={getFilterInfo(listItem)}
              onClick={onClick}
              extraClass="max-w-max w-full flex items-center md:overflow-hidden"
            >
              {maybeRenderIconFor(listItem)}

              <span className="w-full md:truncate">
                {trimURL(listItem.name, colMinWidth)}
              </span>
            </DrilldownLink>
            <ExternalLink
              item={listItem}
              getExternalLinkUrl={getExternalLinkUrl}
              isTapped={tappedRow === listItem.name}
            />
          </div>
        </Bar>
      </div>
    )
  }

  function maybeRenderIconFor(listItem: TListItem) {
    if (renderIcon) {
      return renderIcon(listItem)
    }
  }

  function renderMetricValuesFor(listItem: TListItem) {
    const availableMetrics = getAvailableMetrics()
    const showOnHoverIndex = availableMetrics.findIndex(
      (m) => m.meta.showOnHover
    )
    const hasShowOnHoverMetric = showOnHoverIndex !== -1

    return (
      <>
        {availableMetrics.map((metric, index) => {
          const isShowOnHover = metric.meta.showOnHover

          return (
            <div
              key={`${listItem.name}__${metric.key}`}
              className={`text-right ${hiddenOnMobileClass(metric)} ${showOnHoverClass(metric, listItem.name)} ${slideLeftClass(index, showOnHoverIndex, hasShowOnHoverMetric, listItem.name)}`}
              style={{ width: colMinWidth, minWidth: colMinWidth }}
            >
              <span
                className={`text-right text-sm font-medium ${isShowOnHover ? 'text-muted-foreground group-hover/row:text-foreground' : 'text-foreground'}`}
              >
                {metric.renderValue(listItem, state.meta, {
                  detailedView: false,
                  isRowHovered: false
                })}
              </span>
            </div>
          )
        })}
      </>
    )
  }

  function renderLoading() {
    return (
      <div
        className="w-full flex flex-col justify-center"
        style={{ minHeight: `${MIN_HEIGHT}px` }}
      >
        <div className="w-full space-y-2 px-2">
          {Array.from({ length: MAX_ITEMS }, (_, index) => (
            <Skeleton key={index} className="h-7 w-full" />
          ))}
        </div>
      </div>
    )
  }

  function renderNoDataYet() {
    return (
      <div
        className="w-full h-full flex flex-col justify-center"
        style={{ minHeight: `${MIN_HEIGHT}px` }}
      >
        <div className="mx-auto font-medium text-muted-foreground">
          No data yet
        </div>
      </div>
    )
  }

  return (
    <LazyLoader onVisible={onVisible}>
      <div className="w-full" style={{ minHeight: `${MIN_HEIGHT}px` }}>
        {state.loading && renderLoading()}
        {!state.loading && (
          <FadeIn show={!state.loading} className="h-full">
            {renderReport()}
          </FadeIn>
        )}
      </div>
    </LazyLoader>
  )
}
