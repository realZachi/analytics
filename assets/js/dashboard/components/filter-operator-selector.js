import React, { useState } from 'react'

import {
  FILTER_OPERATIONS,
  FILTER_OPERATIONS_DISPLAY_NAMES,
  supportsContains,
  supportsIsNot,
  supportsHasDoneNot
} from '../util/filters'
import classNames from 'classnames'
import { ArrowDown01Icon } from '@hugeicons/core-free-icons'
import { DashboardIcon } from './dashboard-icon'
import { Button } from './ui/button'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

export default function FilterOperatorSelector(props) {
  const filterName = props.forFilter
  const [open, setOpen] = useState(false)

  return (
    <div
      className={classNames('w-full', {
        'opacity-20 cursor-default pointer-events-none': props.isDisabled
      })}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              className="w-full justify-between font-normal"
              variant="outline"
            />
          }
        >
          {FILTER_OPERATIONS_DISPLAY_NAMES[props.selectedType]}
          <DashboardIcon
            icon={ArrowDown01Icon}
            className="size-4 text-muted-foreground"
          />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-(--anchor-width) min-w-44 gap-0.5 p-1"
        >
          {[
            [FILTER_OPERATIONS.is, true],
            [FILTER_OPERATIONS.isNot, supportsIsNot(filterName)],
            [FILTER_OPERATIONS.has_not_done, supportsHasDoneNot(filterName)],
            [FILTER_OPERATIONS.contains, supportsContains(filterName)],
            [
              FILTER_OPERATIONS.contains_not,
              supportsContains(filterName) && supportsIsNot(filterName)
            ]
          ]
            .filter(([_operation, supported]) => supported)
            .map(([operation]) => (
              <Button
                variant="ghost"
                key={operation}
                data-selected={operation === props.selectedType}
                onClick={(e) => {
                  // Prevent the click propagating and closing modal
                  e.preventDefault()
                  e.stopPropagation()
                  props.onSelect(operation)
                  setOpen(false)
                }}
                className="w-full justify-start font-normal data-[selected=true]:bg-muted data-[selected=true]:font-medium"
              >
                {FILTER_OPERATIONS_DISPLAY_NAMES[operation]}
              </Button>
            ))}
        </PopoverContent>
      </Popover>
    </div>
  )
}
