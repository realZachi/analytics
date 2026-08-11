import React from 'react'

export const GeolocationNotice = () => {
  return (
    <div className="absolute right-0 bottom-0 max-w-24 text-xs text-muted-foreground sm:max-w-none md:max-w-24 lg:max-w-none">
      IP Geolocation by{' '}
      <a
        target="_blank"
        href="https://db-ip.com"
        rel="noreferrer"
        className="text-primary hover:underline"
      >
        DB-IP
      </a>
    </div>
  )
}
