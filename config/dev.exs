import Config

typecheck_watcher =
  if System.get_env("CUSTOM_DISABLE_TYPECHECK_WATCHER") == "true" do
    []
  else
    [npm: ["--prefix", "assets", "run", "typecheck", "--", "--watch", "--preserveWatchOutput"]]
  end

config :plausible, PlausibleWeb.Endpoint,
  server: true,
  debug_errors: true,
  code_reloader: true,
  check_origin: false,
  watchers:
    [
      esbuild: {Esbuild, :install_and_run, [:default, ~w(--sourcemap=inline --watch)]},
      tailwind: {Tailwind, :install_and_run, [:default, ~w(--watch)]}
    ] ++
      typecheck_watcher ++
      [
        npm: [
          "run",
          "deploy",
          cd: Path.expand("../tracker", __DIR__)
        ]
      ],
  live_reload: [
    dirs: [
      "extra"
    ],
    patterns: [
      ~r{priv/static/.*(js|css|png|jpeg|jpg|gif|svg)$},
      ~r"lib/plausible_web/(controllers|live|components|templates|views|plugs)/.*(ex|heex)$"
    ]
  ]

config :plausible, paddle_api: Plausible.Billing.DevPaddleApiMock

config :phoenix, :stacktrace_depth, 20
config :phoenix, :plug_init_mode, :runtime
