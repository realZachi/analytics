defmodule PlausibleWeb.Components.Dashboard.Tile do
  @moduledoc """
  Components for rendering dashboard tile contents.
  """

  use PlausibleWeb, :component

  attr :id, :string, required: true
  attr :class, :string, default: ""
  attr :title, :string, required: true
  attr :height, :integer, required: true
  attr :connected?, :boolean, required: true

  slot :tabs
  slot :inner_block, required: true

  def tile(assigns) do
    ~H"""
    <div
      class={[@class, "group overflow-x-hidden rounded-lg bg-card text-card-foreground"]}
      data-tile
      id={@id}
    >
      <div class="w-full flex justify-between h-full">
        <div id={@id <> "-title"} class="flex gap-x-1" phx-update="ignore">
          <h3 data-title class="font-bold text-card-foreground">{@title}</h3>
        </div>

        <div
          :if={@tabs != []}
          id={@id <> "-tabs"}
          phx-hook="DashboardTabs"
          class="tile-tabs flex items-baseline space-x-2 text-xs font-medium text-muted-foreground"
        >
          {render_slot(@tabs)}
        </div>
      </div>

      <div
        class="w-full flex-col justify-center group-[.phx-navigation-loading]:flex group-has-[.tile-tabs.phx-hook-loading]:flex hidden"
        style={"min-height: #{@height}px;"}
      >
        <div
          class="mx-auto h-8 w-40 animate-pulse rounded-md bg-muted"
          role="status"
          aria-label="Loading dashboard tile"
        />
      </div>

      <div class="group-[.phx-navigation-loading]:hidden group-has-[.tile-tabs.phx-hook-loading]:hidden">
        {render_slot(@inner_block)}
      </div>
    </div>
    """
  end

  attr :label, :string, required: true
  attr :value, :string, required: true
  attr :active, :string, required: true
  attr :target, :any, required: true

  def tab(assigns) do
    assigns =
      assign(
        assigns,
        data_attrs:
          if(assigns.value == assigns.active,
            do: %{"data-active": "true"},
            else: %{"data-active": "false"}
          )
      )

    ~H"""
    <button
      class="rounded-md text-left truncate transition-colors duration-150"
      data-tab={@value}
      data-label={@label}
      data-storage-key="pageTab"
      data-target={@target}
    >
      <span
        {@data_attrs}
        class="data-[active=true]:font-bold data-[active=true]:text-primary data-[active=true]:underline data-[active=true]:decoration-2 data-[active=true]:decoration-primary data-[active=false]:cursor-pointer data-[active=false]:hover:text-card-foreground"
      >
        {@label}
      </span>
    </button>
    """
  end
end
