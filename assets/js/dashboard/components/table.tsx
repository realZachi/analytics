import classNames from 'classnames'
import React, { ReactNode } from 'react'
import { SortDirection } from '../hooks/use-order-by'
import { SortButton } from './sort-button'
import { Tooltip } from '../util/tooltip'
import {
  Table as ShadcnTable,
  TableBody,
  TableCell as ShadcnTableCell,
  TableHead,
  TableHeader,
  TableRow
} from './ui/table'

export type ColumnConfiguraton<T extends Record<string, unknown>> = {
  /** Unique column ID, used for sorting purposes and to get the value of the cell using rowItem[key] */
  key: keyof T
  /** Column title */
  label: string
  /** If defined, the column is considered sortable. @see SortButton */
  onSort?: () => void
  sortDirection?: SortDirection
  /** CSS class string. @example "w-24 md:w-32" */
  width: string
  /** Aligns column content. */
  align?: 'left' | 'right'
  /** A warning to be rendered as a tooltip for the column header */
  metricWarning?: string
  /**
   * Function used to transform the value found at item[key] for the cell. Superseded by renderItem if present. @example 1120 => "1.1k"
   */
  renderValue?: (item: T, isRowHovered?: boolean) => ReactNode
  /** Function used to create richer cells */
  renderItem?: (item: T) => ReactNode
}

export const TableHeaderCell = ({
  children,
  className,
  align
}: {
  children: ReactNode
  className: string
  align?: 'left' | 'right'
}) => {
  return (
    <TableHead
      className={classNames(
        'h-8 p-2 text-xs font-medium text-muted-foreground',
        className
      )}
      align={align}
    >
      {children}
    </TableHead>
  )
}

export const TableCell = ({
  children,
  className,
  align
}: {
  children: ReactNode
  className: string
  align?: 'left' | 'right'
}) => {
  return (
    <ShadcnTableCell
      className={classNames(
        'p-2 font-medium first:rounded-s-md last:rounded-e-md',
        className
      )}
      align={align}
    >
      {children}
    </ShadcnTableCell>
  )
}

export const ItemRow = <T extends Record<string, string | number | ReactNode>>({
  rowIndex,
  pageIndex,
  item,
  columns,
  tappedRowName,
  onRowTap
}: {
  rowIndex: number
  pageIndex?: number
  item: T
  columns: ColumnConfiguraton<T>[]
  tappedRowName?: string | null
  onRowTap?: (rowName: string | null) => void
}) => {
  const [isHovered, setIsHovered] = React.useState(false)

  const rowName = (item as unknown as { name: string }).name
  const isTapped = tappedRowName === rowName
  const isRowActive = isHovered || isTapped

  const handleRowClick = (e: React.MouseEvent) => {
    if (window.innerWidth < 768 && !(e.target as HTMLElement).closest('a')) {
      if (onRowTap) {
        if (isTapped) {
          onRowTap(null)
        } else {
          onRowTap(rowName)
        }
      }
    }
  }

  return (
    <TableRow
      className="group cursor-pointer border-0 text-sm text-card-foreground hover:bg-muted/60 md:cursor-default"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleRowClick}
    >
      {columns.map(({ key, width, align, renderValue, renderItem }) => (
        <TableCell
          key={`${(pageIndex ?? null) === null ? '' : `page_${pageIndex}_`}row_${rowIndex}_${String(key)}`}
          className={width}
          align={align}
        >
          {renderItem
            ? renderItem(item)
            : renderValue
              ? renderValue(item, isRowActive)
              : (item[key] ?? '')}
        </TableCell>
      ))}
    </TableRow>
  )
}

export const Table = <T extends Record<string, string | number | ReactNode>>({
  data,
  columns
}: {
  columns: ColumnConfiguraton<T>[]
  data: T[] | { pages: T[][] }
}) => {
  const [tappedRowName, setTappedRowName] = React.useState<string | null>(null)

  const renderColumnLabel = (column: ColumnConfiguraton<T>) => {
    if (column.metricWarning) {
      return (
        <Tooltip
          info={warningSpan(column.metricWarning)}
          className="inline-block"
        >
          {column.label + ' *'}
        </Tooltip>
      )
    } else {
      return column.label
    }
  }

  const warningSpan = (warning: string) => {
    return (
      <span className="text-xs font-normal whitespace-nowrap">
        {'* ' + warning}
      </span>
    )
  }

  return (
    <ShadcnTable className="w-max min-w-full table-fixed border-collapse">
      <TableHeader className="sticky top-0 z-10 bg-card">
        <TableRow className="border-0 text-xs font-medium text-muted-foreground hover:bg-transparent">
          {columns.map((column) => (
            <TableHeaderCell
              key={`header_${String(column.key)}`}
              className={classNames('p-2', column.width)}
              align={column.align}
            >
              {column.onSort ? (
                <SortButton
                  toggleSort={column.onSort}
                  sortDirection={column.sortDirection ?? null}
                >
                  {renderColumnLabel(column)}
                </SortButton>
              ) : (
                renderColumnLabel(column)
              )}
            </TableHeaderCell>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.isArray(data)
          ? data.map((item, rowIndex) => (
              <ItemRow
                item={item}
                columns={columns}
                rowIndex={rowIndex}
                key={rowIndex}
                tappedRowName={tappedRowName}
                onRowTap={setTappedRowName}
              />
            ))
          : data.pages.map((page, pageIndex) =>
              page.map((item, rowIndex) => (
                <ItemRow
                  item={item}
                  columns={columns}
                  rowIndex={rowIndex}
                  pageIndex={pageIndex}
                  key={`page_${pageIndex}_row_${rowIndex}`}
                  tappedRowName={tappedRowName}
                  onRowTap={setTappedRowName}
                />
              ))
            )}
      </TableBody>
    </ShadcnTable>
  )
}
