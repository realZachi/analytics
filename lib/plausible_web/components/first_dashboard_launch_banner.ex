defmodule PlausibleWeb.Components.FirstDashboardLaunchBanner do
  @moduledoc """
  A banner that appears on the first dashboard launch
  """

  use PlausibleWeb, :component

  attr(:site, Plausible.Site, required: true)

  def set(assigns) do
    ~H"""
    <script>
      sessionStorage.setItem('<%= storage_key(@site) %>', false);
    </script>
    """
  end

  attr(:site, Plausible.Site, required: true)

  def render(assigns) do
    ~H"""
    <div
      x-cloak
      x-data={x_data(@site)}
      class="w-full rounded-lg border border-border bg-muted px-4 text-center text-sm font-semibold text-muted-foreground transition-colors"
      style="top: 91px"
      role="alert"
      x-bind:class="! show ? 'hidden' : ''"
      x-init={x_init(@site)}
    >
      <.styled_link
        class="text-primary hover:text-primary/80"
        href={"/#{URI.encode_www_form(@site.domain)}/settings/email-reports"}
      >
        Invite guests, enable email reports, import from GA and more →
      </.styled_link>
    </div>
    """
  end

  defp x_data(site) do
    "{show: !!sessionStorage.getItem('#{storage_key(site)}')}"
  end

  defp x_init(site) do
    "setTimeout(() => sessionStorage.removeItem('#{storage_key(site)}'), 3000)"
  end

  defp storage_key(site) do
    "dashboard_seen_#{site.domain}"
  end
end
