defmodule PlausibleWeb.Components.Dashboard.ReportList do
  @moduledoc """
  ReportList component.
  """

  use PlausibleWeb, :component

  alias PlausibleWeb.Components.Dashboard.Base
  alias PlausibleWeb.Components.Dashboard.Metric

  @max_items 9
  @min_height 380
  @row_height 32
  @row_gap_height 4
  @data_container_height (@row_height + @row_gap_height) * (@max_items - 1) + @row_height
  @col_min_width 70

  def height, do: @min_height

  def report(assigns) do
    assigns =
      assign(assigns,
        max_items: @max_items,
        min_height: @min_height,
        row_height: @row_height,
        row_gap_height: @row_gap_height,
        data_container_height: @data_container_height,
        col_min_width: @col_min_width
      )

    if assigns.results.loading || !assigns.results.ok? do
      ~H"""
      """
    else
      results = assigns.results.result
      metrics = assigns.metrics.result
      meta = assigns.meta.result
      skip_imported_reason = assigns.skip_imported_reason.result

      max_value =
        results
        |> Enum.map(& &1.visitors)
        |> Enum.max(&>=/2, fn -> 0 end)

      assigns =
        assign(assigns,
          max_value: max_value,
          results: results,
          metrics: metrics,
          meta: meta,
          skip_imported_reason: skip_imported_reason,
          empty?: Enum.empty?(results)
        )

      ~H"""
      <.no_data :if={@empty?} min_height={@min_height} />

      <div :if={not @empty?} class="h-full flex flex-col">
        <div style={"row-height: #{@row_height}px;"}>
          <.report_header key_label={@key_label} metrics={@metrics} col_min_width={@col_min_width} />
        </div>

        <div class="grow" style={"min-height: #{@data_container_height}px;"}>
          <.report_row
            :for={item <- @results}
            link_fn={assigns[:external_link_fn]}
            item={item}
            metrics={@metrics}
            bar_value={item.visitors}
            bar_max_value={@max_value}
            site={@site}
            params={@params}
            filter_dimension={@filter_dimension}
            row_height={@row_height}
            row_gap_height={@row_gap_height}
            col_min_width={@col_min_width}
          />
        </div>

        <div class="w-full text-center">
          <.details_link
            site={@site}
            params={@params}
            path="/pages"
          />
        </div>
      </div>
      """
    end
  end

  defp no_data(assigns) do
    ~H"""
    <div
      class="w-full h-full flex flex-col justify-center group-has-[.tile-tabs.phx-hook-loading]:hidden"
      style={"min-height: #{@min_height}px;"}
    >
      <div class="mx-auto font-medium text-muted-foreground">
        No data yet
      </div>
    </div>
    """
  end

  defp external_link(assigns) do
    url = if(assigns[:link_fn], do: assigns.link_fn.(assigns.item))

    assigns = assign(assigns, :url, url)

    ~H"""
    <.link
      :if={@url}
      target="_blank"
      rel="noreferrer"
      href={@url}
      class="invisible ml-1 inline-flex size-4 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-primary group-hover:visible"
    >
      <span
        aria-hidden="true"
        class="pointer-events-none block size-full"
        data-dashboard-icon="external-link"
      >
      </span>
    </.link>
    """
  end

  defp report_header(assigns) do
    ~H"""
    <div class="flex w-full items-center pt-3 text-xs font-bold tracking-wide text-muted-foreground">
      <span class="grow truncate">{@key_label}</span>
      <div
        :for={metric <- @metrics}
        class={[metric.key, "text-right"]}
        style={"min-width: #{@col_min_width}px;"}
      >
        {metric.label}
      </div>
    </div>
    """
  end

  def report_row(assigns) do
    ~H"""
    <div style={"min-height: #{@row_height}px;"}>
      <div
        class="group flex w-full items-center rounded-md transition-colors duration-150 hover:bg-muted"
        style={"margin-top: #{@row_gap_height}px;"}
      >
        <div class="grow w-full overflow-hidden">
          <Base.bar
            width={@bar_value}
            max_width={@bar_max_value}
            background_class="bg-primary/10 group-hover:bg-primary/15"
          >
            <div class="relative z-9 flex w-full justify-start px-2 py-1.5 text-sm text-card-foreground break-all group">
              <span class="w-full md:truncate">
                <Base.filter_link
                  class="max-w-max w-full flex items-center md:overflow-hidden hover:underline"
                  site={@site}
                  params={@params}
                  filter={[:is, @filter_dimension, [@item.name]]}
                >
                  {trim_name(@item.name, @col_min_width)}
                </Base.filter_link>
              </span>
              <.external_link item={@item} link_fn={assigns[:link_fn]} />
            </div>
          </Base.bar>
        </div>
        <div
          :for={metric <- @metrics}
          class="text-right"
          style={"width: #{@col_min_width}px; min-width: #{@col_min_width}px;"}
        >
          <span class="text-right text-sm font-medium text-card-foreground">
            <Metric.value name={metric.key} value={@item[metric.key]} />
          </span>
        </div>
      </div>
    </div>
    """
  end

  defp details_link(assigns) do
    ~H"""
    <Base.dashboard_link
      class="inline-flex items-center leading-snug text-sm font-bold tracking-wide text-muted-foreground transition-colors duration-150 hover:text-primary"
      site={@site}
      params={@params}
      path={@path}
    >
      <span
        aria-hidden="true"
        class="pointer-events-none -mt-0.5 mr-1 block size-3.5"
        data-dashboard-icon="expand"
      >
      </span>
      DETAILS
    </Base.dashboard_link>
    """
  end

  defp trim_name(name, max_length) do
    if String.length(name) <= max_length do
      name
    else
      left_length = div(max_length, 2)
      right_length = max_length - left_length

      left_side = String.slice(name, 0..left_length)
      right_side = String.slice(name, -right_length..-1)

      left_side <> "..." <> right_side
    end
  end
end
