import React from 'react'
import { sectionTitles } from '../stats/behaviours'
import * as api from '../api'
import { useSiteContext } from '../site-context'
import { ArrowRight02Icon } from '@hugeicons/core-free-icons'
import { DashboardIcon } from './dashboard-icon'
import { Button, buttonVariants } from './ui/button'
import { cn } from '../lib/utils'

export function FeatureSetupNotice({
  feature,
  title,
  info,
  callToAction,
  onHideAction
}) {
  const site = useSiteContext()
  const sectionTitle = sectionTitles[feature]

  const requestHideSection = () => {
    if (
      window.confirm(
        `Are you sure you want to hide ${sectionTitle}? You can make it visible again in your site settings later.`
      )
    ) {
      api
        .mutation(`/api/${encodeURIComponent(site.domain)}/disable-feature`, {
          method: 'PUT',
          body: { feature: feature }
        })
        .then(() => onHideAction())
        .catch((error) => {
          if (!(error instanceof api.ApiError)) {
            throw error
          }
        })
    }
  }

  function renderCallToAction() {
    return (
      <a
        href={callToAction.link}
        className={cn(
          buttonVariants({ size: 'default' }),
          'ml-2 gap-1.5 sm:ml-4'
        )}
      >
        <p className="text-xs sm:text-sm font-medium">{callToAction.action}</p>
        <DashboardIcon icon={ArrowRight02Icon} className="size-4" />
      </a>
    )
  }

  function renderHideButton() {
    return (
      <Button onClick={requestHideSection} variant="outline">
        Hide this report
      </Button>
    )
  }

  return (
    <div className="sm:mx-32 mt-6 mb-3">
      <div className="py-3">
        <div className="mt-2 text-center text-pretty font-medium text-foreground">
          {title}
        </div>

        <div className="font-small mt-4 text-center text-sm text-pretty text-muted-foreground">
          {info}
        </div>

        <div className="text-xs sm:text-sm flex my-6 justify-center">
          {renderHideButton()}
          {renderCallToAction()}
        </div>
      </div>
    </div>
  )
}
