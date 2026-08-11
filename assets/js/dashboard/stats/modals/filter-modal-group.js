import React, { useMemo } from 'react'
import FilterModalRow from './filter-modal-row'
import {
  formattedFilters,
  getFilterGroup,
  getPropertyKeyFromFilterKey
} from '../../util/filters'
import FilterModalPropsRow from './filter-modal-props-row'
import { Add01Icon } from '@hugeicons/core-free-icons'
import { Button } from '../../components/ui/button'
import { DashboardIcon } from '../../components/dashboard-icon'

export default function FilterModalGroup({
  filterGroup,
  filterState,
  labels,
  onUpdateRowValue,
  onAddRow,
  onDeleteRow
}) {
  const rows = useMemo(
    () =>
      Object.entries(filterState)
        .filter(([_, filter]) => getFilterGroup(filter) == filterGroup)
        .map(([id, filter]) => ({ id, filter })),
    [filterGroup, filterState]
  )
  const disabledOptions = useMemo(
    () =>
      filterGroup == 'props'
        ? rows.map(({ filter }) => ({
            value: getPropertyKeyFromFilterKey(filter[1])
          }))
        : null,
    [filterGroup, rows]
  )

  const showAddRow = ['props', 'goal'].includes(filterGroup)
  const showTitle = filterGroup != 'props'

  return (
    <>
      <div className="mt-6">
        {showTitle && (
          <div className="text-sm font-medium text-foreground">
            {formattedFilters[filterGroup]}
          </div>
        )}
        {rows.map(({ id, filter }) =>
          filterGroup === 'props' ? (
            <FilterModalPropsRow
              key={id}
              filter={filter}
              showDelete={rows.length > 1}
              disabledOptions={disabledOptions}
              onUpdate={(newFilter) => onUpdateRowValue(id, newFilter)}
              onDelete={() => onDeleteRow(id)}
            />
          ) : (
            <FilterModalRow
              key={id}
              filter={filter}
              labels={labels}
              canDelete={showAddRow}
              showDelete={rows.length > 1}
              onUpdate={(newFilter, labelUpdate) =>
                onUpdateRowValue(id, newFilter, labelUpdate)
              }
              onDelete={() => onDeleteRow(id)}
            />
          )
        )}
      </div>
      {showAddRow && (
        <div className="mt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onAddRow(filterGroup)}
          >
            <DashboardIcon icon={Add01Icon} className="size-3.5" />
            Add another
          </Button>
        </div>
      )}
    </>
  )
}
