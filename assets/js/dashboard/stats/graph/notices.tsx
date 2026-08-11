import React from 'react'
import { Tooltip } from '../../util/tooltip'
import { InformationCircleIcon } from '@hugeicons/core-free-icons'
import { DashboardIcon } from '../../components/dashboard-icon'
import { buttonVariants } from '../../components/ui/button'

export const NoticesIcon = ({ notices }: { notices: string[] }) => {
  if (!notices.length) {
    return null
  }
  return (
    <Tooltip
      info={
        <div className="w-[200px] font-normal flex flex-col gap-y-2">
          {notices.map((notice, id) => (
            <p key={id}>{notice}</p>
          ))}
        </div>
      }
      className="size-7"
    >
      <button
        aria-label="Chart notices"
        className={buttonVariants({
          variant: 'ghost',
          size: 'icon-sm',
          className: 'text-muted-foreground hover:text-foreground'
        })}
        type="button"
      >
        <DashboardIcon icon={InformationCircleIcon} className="size-4" />
      </button>
    </Tooltip>
  )
}

export function getSamplingNotice(topStatData: { samplePercent?: number }) {
  const samplePercent = topStatData?.samplePercent

  if (samplePercent && samplePercent < 100) {
    return `Stats based on a ${samplePercent}% sample of all visitors`
  }

  return null
}
