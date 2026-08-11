/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, useCallback } from 'react'
import * as api from '../../api'
import * as storage from '../../util/storage'
import TopStats from './top-stats'
import { IntervalPicker, getCurrentInterval } from './interval-picker'
import StatsExport from './stats-export'
import WithImportedSwitch from './with-imported-switch'
import { getSamplingNotice, NoticesIcon } from './notices'
import FadeIn from '../../fade-in'
import * as url from '../../util/url'
import { isComparisonEnabled } from '../../query-time-periods'
import LineGraphWithRouter from './line-graph'
import { useQueryContext } from '../../query-context'
import { useSiteContext } from '../../site-context'
import { Card } from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'
import { METRIC_LABELS } from './graph-util'

function fetchTopStats(site, query) {
  const q = { ...query }

  if (!isComparisonEnabled(q.comparison) && query.period !== 'realtime') {
    q.comparison = 'previous_period'
  }

  return api.get(url.apiPath(site, '/top-stats'), q)
}

function fetchMainGraph(site, query, metric, interval) {
  const params = { metric, interval }
  return api.get(url.apiPath(site, '/main-graph'), query, params)
}

export default function VisitorGraph({ updateImportedDataInView }) {
  const { query } = useQueryContext()
  const site = useSiteContext()

  const isRealtime = query.period === 'realtime'

  const topStatsBoundary = useRef(null)

  const [topStatData, setTopStatData] = useState(null)
  const [topStatsLoading, setTopStatsLoading] = useState(true)
  const [graphData, setGraphData] = useState(null)
  const [graphLoading, setGraphLoading] = useState(true)

  // This state is explicitly meant for the situation where either graph interval
  // or graph metric is changed. That results in behaviour where Top Stats stay
  // intact, but the graph container alone will display a loading spinner for as
  // long as new graph data is fetched.
  const [graphRefreshing, setGraphRefreshing] = useState(false)

  const onIntervalUpdate = useCallback(
    (newInterval) => {
      setGraphData(null)
      setGraphRefreshing(true)
      fetchGraphData(getStoredMetric(), newInterval)
    },
    [query]
  )

  const onMetricUpdate = useCallback(
    (newMetric) => {
      setGraphData(null)
      setGraphRefreshing(true)
      fetchGraphData(newMetric, getCurrentInterval(site, query))
    },
    [query]
  )

  useEffect(() => {
    setTopStatData(null)
    setTopStatsLoading(true)
    setGraphData(null)
    setGraphLoading(true)
    fetchTopStatsAndGraphData()

    if (isRealtime) {
      document.addEventListener('tick', fetchTopStatsAndGraphData)
    }

    return () => {
      document.removeEventListener('tick', fetchTopStatsAndGraphData)
    }
  }, [query])

  async function fetchTopStatsAndGraphData() {
    const response = await fetchTopStats(site, query)

    let metric = getStoredMetric()
    const availableMetrics = response.graphable_metrics

    if (!availableMetrics.includes(metric)) {
      metric = availableMetrics[0]
      storage.setItem(`metric__${site.domain}`, metric)
    }

    const interval = getCurrentInterval(site, query)

    if (response.updateImportedDataInView) {
      updateImportedDataInView(response.includes_imported)
    }

    setTopStatData(response)
    setTopStatsLoading(false)

    fetchGraphData(metric, interval)
  }

  function fetchGraphData(metric, interval) {
    fetchMainGraph(site, query, metric, interval).then((res) => {
      setGraphData(res)
      setGraphLoading(false)
      setGraphRefreshing(false)
    })
  }

  function getStoredMetric() {
    return storage.getItem(`metric__${site.domain}`)
  }

  function importedSwitchVisible() {
    return (
      !!topStatData?.with_imported_switch &&
      topStatData?.with_imported_switch.visible
    )
  }

  function getImportedIntervalUnsupportedNotice() {
    const unsupportedInterval = ['hour', 'minute'].includes(
      getCurrentInterval(site, query)
    )
    const showingImported =
      importedSwitchVisible() && query.with_imported === true

    if (showingImported && unsupportedInterval) {
      return 'Interval is too short to graph imported data'
    }

    return null
  }

  function getGraphTitle() {
    const metric = graphData?.metric || getStoredMetric()

    if (metric === 'visitors') {
      return 'Unique visitors'
    }

    return METRIC_LABELS[metric] || 'Trend'
  }

  return (
    <Card className="relative mt-2 w-full gap-0 py-0 shadow-none">
      {topStatsLoading || graphLoading ? (
        renderLoader()
      ) : (
        <FadeIn show>
          <div
            id="top-stats-container"
            className="grid grid-cols-2 gap-px border-b border-border/70 bg-border/70 sm:grid-cols-3 lg:grid-cols-6"
            ref={topStatsBoundary}
          >
            <TopStats
              graphableMetrics={topStatData?.graphable_metrics || []}
              data={topStatData}
              onMetricUpdate={onMetricUpdate}
              tooltipBoundary={topStatsBoundary.current}
            />
          </div>

          <div className="flex min-h-11 flex-wrap items-center justify-between gap-3 border-b border-border/70 px-4 py-2 sm:px-5">
            <p className="min-w-0 truncate text-sm font-medium text-foreground">
              {getGraphTitle()}{' '}
              <span className="font-normal text-muted-foreground">
                {isRealtime ? 'live' : 'over time'}
              </span>
            </p>

            <div className="flex items-center gap-1">
              <NoticesIcon
                notices={[
                  getImportedIntervalUnsupportedNotice(),
                  getSamplingNotice(topStatData)
                ].filter((n) => !!n)}
              />
              {!isRealtime && <StatsExport />}
              {importedSwitchVisible() && (
                <WithImportedSwitch
                  tooltipMessage={topStatData.with_imported_switch.tooltip_msg}
                  disabled={!topStatData.with_imported_switch.togglable}
                />
              )}
              <IntervalPicker onIntervalUpdate={onIntervalUpdate} />
            </div>
          </div>

          <div className="relative px-3 pb-3 sm:px-4">
            {graphRefreshing && renderGraphLoader()}
            <LineGraphWithRouter
              graphData={
                graphData
                  ? {
                      ...graphData,
                      interval: getCurrentInterval(site, query)
                    }
                  : null
              }
            />
          </div>
        </FadeIn>
      )}
    </Card>
  )
}

function renderLoader() {
  return (
    <div aria-label="Loading chart" role="status">
      <div className="grid grid-cols-2 gap-px border-b border-border/70 bg-border/70 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div className="bg-card px-4 py-4" key={index}>
            <Skeleton className="h-3 w-24 max-w-full" />
            <Skeleton className="mt-3 h-7 w-16" />
          </div>
        ))}
      </div>
      <div className="flex min-h-12 items-center justify-between border-b border-border/70 px-4 py-2.5 sm:px-5">
        <div>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-2 h-3 w-20" />
        </div>
        <Skeleton className="h-7 w-24" />
      </div>
      <div className="p-4">
        <Skeleton className="h-64 w-full sm:h-72" />
      </div>
    </div>
  )
}

function renderGraphLoader() {
  return (
    <div
      aria-label="Refreshing chart"
      className="absolute inset-3 z-10 bg-card/85 sm:inset-4"
      role="status"
    >
      <Skeleton className="size-full" />
    </div>
  )
}
