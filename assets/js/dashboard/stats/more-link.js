import React from 'react'
import { AppNavigationLink } from '../navigation/use-app-navigate'
import { ArrowExpand01Icon } from '@hugeicons/core-free-icons'
import { DashboardIcon } from '../components/dashboard-icon'

function detailsIcon() {
  return (
    <DashboardIcon
      icon={ArrowExpand01Icon}
      className="mr-1 inline-block size-4"
      style={{ marginTop: '-2px' }}
    />
  )
}

export default function MoreLink({ linkProps, list, className, onClick }) {
  if (list.length > 0) {
    return (
      <div className={`w-full text-center ${className ? className : ''}`}>
        <AppNavigationLink
          {...linkProps}
          className="text-sm leading-snug font-bold tracking-wide text-muted-foreground transition-colors duration-150 hover:text-foreground"
          onClick={onClick}
        >
          {detailsIcon()}
          DETAILS
        </AppNavigationLink>
      </div>
    )
  }
  return null
}
