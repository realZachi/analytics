import React from 'react'
import { render, screen } from '@testing-library/react'
import { DateRangeCalendar } from './date-range-calendar'
import userEvent from '@testing-library/user-event'

test('renders with default dates in view, respects max and min dates', async () => {
  const onCloseWithNoSelection = jest.fn()
  const onCloseWithSelection = jest.fn()
  const handlers = { onCloseWithNoSelection, onCloseWithSelection }

  render(
    <DateRangeCalendar
      id="calendar"
      minDate="2024-09-10"
      maxDate="2024-09-25"
      defaultDates={['2024-09-12', '2024-09-19']}
      {...handlers}
    />
  )

  expect(
    await screen.findByRole('button', { name: /September 9.*2024/ })
  ).toBeDisabled()
  expect(
    screen.getByRole('button', { name: /September 10.*2024/ })
  ).toBeEnabled()
  expect(
    screen.getByRole('button', { name: /September 12.*2024/ })
  ).toHaveAttribute('data-range-start', 'true')
  expect(
    screen.getByRole('button', { name: /September 19.*2024/ })
  ).toHaveAttribute('data-range-end', 'true')
  expect(
    screen.getByRole('button', { name: /September 26.*2024/ })
  ).toBeDisabled()

  const newStart = screen.getByRole('button', {
    name: /September 20.*2024/
  })
  await userEvent.click(newStart)
  const newEnd = screen.getByRole('button', { name: /September 25.*2024/ })
  await userEvent.click(newEnd)

  expect(onCloseWithSelection).toHaveBeenCalledTimes(1)
  expect(onCloseWithSelection).toHaveBeenLastCalledWith([
    new Date('2024-09-20'),
    new Date('2024-09-25')
  ])
})
