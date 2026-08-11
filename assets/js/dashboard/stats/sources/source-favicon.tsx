import React from 'react'
import classNames from 'classnames'

interface SourceFaviconProps {
  name: string
  className?: string
}

export const SourceFavicon = ({ name, className }: SourceFaviconProps) => {
  const sourceName = name.toLowerCase()
  const needsWhiteBg =
    sourceName.includes('github') || sourceName.includes('chatgpt.com')

  return (
    <img
      alt=""
      src={`/favicon/sources/${encodeURIComponent(name)}`}
      referrerPolicy="no-referrer"
      className={classNames(
        className,
        needsWhiteBg && 'rounded-full border border-border bg-background'
      )}
    />
  )
}
