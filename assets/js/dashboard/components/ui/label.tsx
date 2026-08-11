import * as React from 'react'

import { cn } from '@/dashboard/lib/utils'

/* Association is supplied by consumers through htmlFor or a nested control. */
/* eslint-disable jsx-a11y/label-has-associated-control */
function Label({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    <label
      data-slot="label"
      className={cn(
        'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
}
/* eslint-enable jsx-a11y/label-has-associated-control */

export { Label }
