/**
 * @prettier
 */
import React, { useRef, useState } from 'react'
import {
  ArrowDown01Icon,
  ArrowLeft01Icon,
  Globe02Icon,
  Loading03Icon,
  Settings01Icon
} from '@hugeicons/core-free-icons'
import classNames from 'classnames'
import { isModifierPressed, isTyping, Keybind, KeybindHint } from './keybinding'
import { BlurMenuButtonOnEscape } from './nav-menu/blur-menu-button-on-escape'
import { useQuery } from '@tanstack/react-query'
import { Role, useUserContext } from './user-context'
import { PlausibleSite, useSiteContext } from './site-context'
import { MenuSeparator } from './nav-menu/nav-menu-components'
import { useMatch } from 'react-router-dom'
import { rootRoute } from './router'
import { get } from './api'
import { ErrorPanel } from './components/error-panel'
import { useRoutelessModalsContext } from './navigation/routeless-modals-context'
import { DashboardIcon } from './components/dashboard-icon'
import { buttonVariants } from './components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from './components/ui/popover'

const Favicon = ({
  domain,
  className
}: {
  domain: string
  className?: string
}) => (
  <img
    aria-hidden="true"
    alt=""
    src={`/favicon/sources/${encodeURIComponent(domain)}`}
    onError={(e) => {
      const target = e.target as HTMLImageElement
      target.onerror = null
      target.src = '/favicon/sources/placeholder'
    }}
    referrerPolicy="no-referrer"
    className={className}
  />
)

const GlobeIcon = ({ className }: { className?: string }) => (
  <DashboardIcon icon={Globe02Icon} className={className} />
)

const menuItemClassName = classNames(
  'flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-foreground',
  'data-[selected=true]:bg-accent data-[selected=true]:font-semibold data-[selected=true]:text-accent-foreground'
)

const buttonLinkClassName = classNames(
  'flex-1',
  'my-1 mx-1',
  'border-border bg-card text-foreground',
  'hover:bg-accent hover:text-accent-foreground'
)

const getSwitchToSiteURL = (
  currentSite: PlausibleSite,
  site: { domain: string }
): string | null => {
  // Prevents reloading the page when the current site is selected
  if (currentSite.domain === site.domain) {
    return null
  }
  return `/${encodeURIComponent(site.domain)}`
}

export const SiteSwitcher = () => {
  const dashboardRouteMatch = useMatch(rootRoute.path)
  const { modal } = useRoutelessModalsContext()
  const user = useUserContext()
  const currentSite = useSiteContext()
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const [open, setOpen] = useState(false)
  const sitesQuery = useQuery({
    enabled: user.loggedIn,
    queryKey: ['sites'],
    queryFn: async (): Promise<{ data: Array<{ domain: string }> }> => {
      const response = await get('/api/sites')
      return response
    },
    placeholderData: (previousData) => previousData
  })

  const sitesInDropdown = user.loggedIn
    ? sitesQuery.data?.data
    : // show only current site in dropdown when viewing public / embedded dashboard
      [{ domain: currentSite.domain }]

  const canSeeSiteSettings: boolean =
    user.loggedIn &&
    [Role.owner, Role.admin, Role.editor, 'super_admin'].includes(user.role)

  const canSeeViewAllSites: boolean = user.loggedIn

  return (
    <div className="relative">
      {!!dashboardRouteMatch &&
        !modal &&
        sitesQuery.data?.data.slice(0, 8).map(({ domain }, index) => (
          <Keybind
            key={domain}
            keyboardKey={`${index + 1}`}
            type="keydown"
            handler={() => {
              const url = getSwitchToSiteURL(currentSite, { domain })
              setOpen(false)
              if (url) {
                window.location.assign(url)
              }
            }}
            shouldIgnoreWhen={[isModifierPressed, isTyping]}
            targetRef="document"
          />
        ))}

      {!!dashboardRouteMatch &&
        !modal &&
        user.team?.hasConsolidatedView &&
        user.team.identifier && (
          <Keybind
            key={user.team.identifier}
            keyboardKey="0"
            type="keydown"
            handler={() => {
              const url = getSwitchToSiteURL(currentSite, {
                domain: user.team.identifier!
              })
              setOpen(false)
              if (url) {
                window.location.assign(url)
              }
            }}
            shouldIgnoreWhen={[isModifierPressed, isTyping]}
            targetRef="document"
          />
        )}

      <Popover open={open} onOpenChange={setOpen}>
        <BlurMenuButtonOnEscape targetRef={buttonRef} />
        <PopoverTrigger
          onFocus={(event) => {
            buttonRef.current = event.currentTarget
          }}
          title={currentSite.domain}
          className={buttonVariants({
            variant: 'ghost',
            size: 'lg',
            className: 'h-9 gap-0 rounded-lg px-1 font-bold text-foreground'
          })}
        >
          {currentSite.isConsolidatedView ? (
            <GlobeIcon className="mx-1 size-4 text-primary" />
          ) : (
            <Favicon
              domain={currentSite.domain}
              className="mx-1 block size-4"
            />
          )}
          <span className="hidden truncate sm:mr-1 sm:block lg:mr-0">
            {currentSite.isConsolidatedView ? 'All sites' : currentSite.domain}
          </span>
          <DashboardIcon
            icon={ArrowDown01Icon}
            className="ml-2 hidden size-5 lg:block"
          />
        </PopoverTrigger>
        {open && (
          <PopoverContent
            align="start"
            className="w-[min(20rem,calc(100vw-1rem))] p-1"
            data-testid="sitemenu"
          >
            <div className="flex">
              {canSeeViewAllSites && (
                <a
                  href="/sites"
                  className={buttonVariants({
                    variant: 'outline',
                    size: 'sm',
                    className: buttonLinkClassName
                  })}
                >
                  <DashboardIcon icon={ArrowLeft01Icon} className="size-4" />
                  Back to sites
                </a>
              )}
              {canSeeSiteSettings && (
                <a
                  href={`/${encodeURIComponent(currentSite.domain)}/settings/general`}
                  className={buttonVariants({
                    variant: 'outline',
                    size: 'sm',
                    className: buttonLinkClassName
                  })}
                >
                  <DashboardIcon icon={Settings01Icon} className="size-4" />
                  Site settings
                </a>
              )}
            </div>
            {(canSeeSiteSettings || canSeeViewAllSites) && <MenuSeparator />}
            {sitesQuery.isLoading && (
              <div className="flex px-3 py-2" aria-live="polite">
                <DashboardIcon
                  icon={Loading03Icon}
                  className="size-4 animate-spin text-muted-foreground"
                />
                <span className="sr-only">Loading sites</span>
              </div>
            )}
            {sitesQuery.isError && (
              <div className="px-3 py-2">
                <ErrorPanel
                  errorMessage={'Error loading sites'}
                  onClose={sitesQuery.refetch}
                />
              </div>
            )}
            {user.team.hasConsolidatedView && user.team.identifier && (
              <a
                href={
                  getSwitchToSiteURL(currentSite, {
                    domain: user.team.identifier
                  }) ?? '#'
                }
                data-selected={currentSite.isConsolidatedView}
                className={menuItemClassName}
                onClick={() => setOpen(false)}
              >
                <GlobeIcon className="mr-2 size-4 text-primary" />
                <span className="mr-auto truncate">All sites</span>
                <KeybindHint>0</KeybindHint>
              </a>
            )}
            {!!sitesInDropdown &&
              sitesInDropdown.map(({ domain }, index) => (
                <a
                  href={getSwitchToSiteURL(currentSite, { domain }) ?? '#'}
                  data-selected={currentSite.domain === domain}
                  key={domain}
                  className={menuItemClassName}
                  onClick={
                    currentSite.domain === domain
                      ? () => setOpen(false)
                      : undefined
                  }
                >
                  <Favicon domain={domain} className="mr-2 block size-4" />
                  <span className="mr-auto truncate">{domain}</span>
                  {sitesInDropdown.length > 1 && (
                    <KeybindHint>{index + 1}</KeybindHint>
                  )}
                </a>
              ))}
          </PopoverContent>
        )}
      </Popover>
    </div>
  )
}
