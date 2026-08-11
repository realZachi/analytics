endpoint_config = Application.fetch_env!(:plausible, PlausibleWeb.Endpoint)
Application.put_env(:plausible, PlausibleWeb.Endpoint, Keyword.put(endpoint_config, :server, false))

System.put_env("PLAUSIBLE_SEED_PROFILE", "light")

{:ok, _started} = Application.ensure_all_started(:plausible)

Code.eval_file("priv/repo/seeds.exs")
