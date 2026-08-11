import React from 'react'
import { render, screen } from '@testing-library/react'
import { ChangeArrow } from './change-arrow'

it('renders green for positive change', () => {
  render(<ChangeArrow change={1} className="text-xs" metric="visitors" />)

  const arrowElement = screen.getByTestId('change-arrow')

  expect(arrowElement).toHaveTextContent('1%')
  expect(arrowElement.querySelector('svg')).toHaveClass('text-chart-2')
})

it('renders red for positive change', () => {
  render(<ChangeArrow change={-10} className="text-xs" metric="visitors" />)

  const arrowElement = screen.getByTestId('change-arrow')

  expect(arrowElement).toHaveTextContent('10%')
  expect(arrowElement.querySelector('svg')).toHaveClass('text-destructive')
})

it('renders tilde for no change', () => {
  render(<ChangeArrow change={0} className="text-xs" metric="visitors" />)

  const arrowElement = screen.getByTestId('change-arrow')

  expect(arrowElement).toHaveTextContent('0%')
})

it('inverts colors for positive bounce_rate change', () => {
  render(<ChangeArrow change={15} className="text-xs" metric="bounce_rate" />)

  const arrowElement = screen.getByTestId('change-arrow')

  expect(arrowElement).toHaveTextContent('15%')
  expect(arrowElement.querySelector('svg')).toHaveClass('text-destructive')
})

it('inverts colors for negative bounce_rate change', () => {
  render(<ChangeArrow change={-3} className="text-xs" metric="bounce_rate" />)

  const arrowElement = screen.getByTestId('change-arrow')

  expect(arrowElement).toHaveTextContent('3%')
  expect(arrowElement.querySelector('svg')).toHaveClass('text-chart-2')
})

it('renders with text hidden', () => {
  render(
    <ChangeArrow change={-3} className="text-xs" metric="visitors" hideNumber />
  )

  const arrowElement = screen.getByTestId('change-arrow')

  expect(arrowElement).toHaveTextContent('')
  expect(arrowElement.querySelector('svg')).toHaveClass('text-destructive')
})

it('renders no content with text hidden and 0 change', () => {
  render(
    <ChangeArrow change={0} className="text-xs" metric="visitors" hideNumber />
  )

  const arrowElement = screen.getByTestId('change-arrow')
  expect(arrowElement).toHaveTextContent('')
})
