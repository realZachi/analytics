export const METRIC_LABELS = {
  visitors: 'Visitors',
  pageviews: 'Pageviews',
  events: 'Total conversions',
  views_per_visit: 'Views per visit',
  visits: 'Visits',
  bounce_rate: 'Bounce rate',
  visit_duration: 'Visit duration',
  conversions: 'Converted visitors',
  conversion_rate: 'Conversion rate',
  average_revenue: 'Average revenue',
  total_revenue: 'Total revenue',
  scroll_depth: 'Scroll depth',
  time_on_page: 'Time on page'
}

function plottable(dataArray) {
  return dataArray?.map((value) => {
    if (typeof value === 'object' && value !== null) {
      // Revenue metrics are returned as objects with a `value` property
      return value.value
    }

    return value || 0
  })
}

const withAlpha = function (color, alpha) {
  if (color.startsWith('oklch(')) {
    return color.replace(/\)$/, ` / ${alpha})`)
  }

  return color
}

const chartColors = function (ctx) {
  const styles = getComputedStyle(ctx.canvas)
  const line = styles.getPropertyValue('--chart-2').trim() || 'rgb(99 102 241)'

  return {
    line,
    lineMuted: withAlpha(line, 0.32),
    lineSoft: withAlpha(line, 0.16),
    lineFaint: withAlpha(line, 0.02)
  }
}

const buildComparisonDataset = function (comparisonPlot, colors) {
  if (!comparisonPlot) return []

  return [
    {
      data: plottable(comparisonPlot),
      backgroundColor: 'transparent',
      borderColor: colors.lineMuted,
      borderDash: [6, 5],
      fill: false,
      pointBackgroundColor: colors.lineMuted,
      pointHoverBackgroundColor: colors.line,
      yAxisID: 'yComparison'
    }
  ]
}

const buildDashedDataset = function (plot, presentIndex, colors, gradient) {
  if (!presentIndex) return []

  const dashedPart = plot.slice(presentIndex - 1, presentIndex + 1)
  const dashedPlot = new Array(presentIndex - 1).concat(dashedPart)

  return [
    {
      data: plottable(dashedPlot),
      backgroundColor: gradient,
      borderColor: colors.line,
      borderDash: [5, 4],
      fill: true,
      pointBackgroundColor: colors.line,
      pointHoverBackgroundColor: colors.line,
      yAxisID: 'y'
    }
  ]
}

const buildMainPlotDataset = function (plot, presentIndex, colors, gradient) {
  const data = presentIndex ? plot.slice(0, presentIndex) : plot

  return [
    {
      data: plottable(data),
      backgroundColor: gradient,
      borderColor: colors.line,
      fill: true,
      pointBackgroundColor: colors.line,
      pointHoverBackgroundColor: colors.line,
      yAxisID: 'y'
    }
  ]
}

export const buildDataSet = (
  plot,
  comparisonPlot,
  present_index,
  ctx,
  label
) => {
  const colors = chartColors(ctx)
  const gradient = ctx.createLinearGradient(
    0,
    0,
    0,
    Math.max(ctx.canvas.clientHeight, 280)
  )
  gradient.addColorStop(0, colors.lineSoft)
  gradient.addColorStop(1, colors.lineFaint)

  const defaultOptions = {
    label,
    borderWidth: 2.25,
    pointBorderColor: 'transparent',
    pointHoverBorderColor: colors.line,
    pointHoverRadius: 4
  }

  const dataset = [
    ...buildMainPlotDataset(plot, present_index, colors, gradient),
    ...buildDashedDataset(plot, present_index, colors, gradient),
    ...buildComparisonDataset(comparisonPlot, colors)
  ]

  return dataset.map((item) => ({ ...defaultOptions, ...item }))
}

export function hasMultipleYears(graphData) {
  return (
    graphData.labels
      .filter((date) => typeof date === 'string')
      .map((date) => date.split('-')[0])
      .filter((value, index, list) => list.indexOf(value) === index).length > 1
  )
}
