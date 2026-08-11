import React, { ReactNode } from 'react'
import RocketIcon from '../stats/modals/rocket-icon'
import { useInRouterContext } from 'react-router-dom'
import { PlausibleSite } from '../site-context'
import { getRouterBasepath, rootRoute } from '../router'
import { AppNavigationLink } from '../navigation/use-app-navigate'
import { Card, CardContent } from '../components/ui/card'

export function SomethingWentWrongMessage({
  error,
  callToAction = null
}: {
  error: unknown
  callToAction?: ReactNode
}) {
  return (
    <Card className="mx-auto mt-24 max-w-xl text-center">
      <CardContent className="grid gap-4 py-8">
        <RocketIcon />
        <div className="text-lg text-foreground">
          <span className="font-medium">Oops! Something went wrong.</span>
          {!!callToAction && ' '}
          {callToAction}
        </div>
        <div className="text-md font-mono text-muted-foreground">
          {error instanceof Error
            ? [error.name, error.message].join(': ')
            : 'Unknown error'}
        </div>
      </CardContent>
    </Card>
  )
}

const linkClass = 'text-primary underline-offset-4 hover:underline'

export function GoBackToDashboard({
  site
}: {
  site: Pick<PlausibleSite, 'domain' | 'shared'>
}) {
  const canUseAppLink = useInRouterContext()
  const linkText = 'go to dashboard'

  return (
    <span>
      <>Try going back or </>
      {canUseAppLink ? (
        <AppNavigationLink path={rootRoute.path} className={linkClass}>
          {linkText}
        </AppNavigationLink>
      ) : (
        <a href={getRouterBasepath(site)} className={linkClass}>
          {linkText}
        </a>
      )}
    </span>
  )
}

export function GoToSites() {
  return (
    <>
      <>Try going back or </>
      <a href={'/sites'} className={linkClass}>
        {'go to your sites'}
      </a>
    </>
  )
}
