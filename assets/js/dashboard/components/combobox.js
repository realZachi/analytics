import React, { useCallback, useEffect, useRef, useState } from 'react'
import classNames from 'classnames'
import {
  ArrowDown01Icon,
  Cancel01Icon,
  Loading03Icon
} from '@hugeicons/core-free-icons'
import { useDebounce, useMountedEffect } from '../custom-hooks'
import { DashboardIcon } from './dashboard-icon'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Command, CommandItem, CommandList } from './ui/command'
import { InputGroup, InputGroupAddon, InputGroupInput } from './ui/input-group'

function scrollTo(wrapper, id) {
  wrapper?.querySelector(`#${id}`)?.scrollIntoView({ block: 'center' })
}

function optionId(index) {
  return `plausible-combobox-option-${index}`
}

export default function PlausibleCombobox({
  values,
  fetchOptions,
  singleOption,
  isDisabled,
  autoFocus,
  freeChoice,
  disabledOptions,
  onSelect,
  placeholder,
  forceLoading,
  className,
  boxClass
}) {
  const isEmpty = values.length === 0
  const [options, setOptions] = useState([])
  const [isLoading, setLoading] = useState(false)
  const [isOpen, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const searchRef = useRef(null)
  const containerRef = useRef(null)
  const listRef = useRef(null)

  const loading = isLoading || !!forceLoading
  const visibleOptions = [...options]

  if (
    freeChoice &&
    search.length > 0 &&
    options.every((option) => option.value !== search)
  ) {
    visibleOptions.push({ value: search, label: search, freeChoice: true })
  }

  const afterFetchOptions = useCallback((loadedOptions) => {
    setLoading(false)
    setHighlightedIndex(0)
    setOptions(loadedOptions)
  }, [])

  const initialFetchOptions = useCallback(() => {
    setLoading(true)
    fetchOptions('').then(afterFetchOptions)
  }, [fetchOptions, afterFetchOptions])

  const searchOptions = useCallback(() => {
    if (isOpen) {
      setLoading(true)
      fetchOptions(search).then(afterFetchOptions)
    }
  }, [search, isOpen, fetchOptions, afterFetchOptions])

  const debouncedSearchOptions = useDebounce(searchOptions)

  useEffect(() => {
    if (isOpen) initialFetchOptions()
  }, [isOpen, initialFetchOptions])

  useMountedEffect(() => {
    debouncedSearchOptions()
  }, [search])

  function highlight(index) {
    let nextIndex = index

    if (index < 0) {
      nextIndex = selectableOptions.length - 1
    } else if (index >= selectableOptions.length) {
      nextIndex = 0
    }

    setHighlightedIndex(nextIndex)
    scrollTo(listRef.current, optionId(nextIndex))
  }

  function selectOption(option) {
    if (singleOption) {
      onSelect([option])
    } else {
      onSelect([...values, option])
    }

    setOpen(false)
    setSearch('')
    requestAnimationFrame(() => searchRef.current?.focus())
  }

  function onKeyDown(event) {
    if (event.key === 'Enter') {
      if (!isOpen || loading || selectableOptions.length === 0) return
      selectOption(selectableOptions[highlightedIndex])
      event.preventDefault()
    } else if (event.key === 'Escape') {
      if (!isOpen || loading) return
      setOpen(false)
      setSearch('')
      searchRef.current?.focus()
      event.preventDefault()
      event.stopPropagation()
    } else if (event.key === 'ArrowDown') {
      if (isOpen) {
        highlight(highlightedIndex + 1)
      } else {
        setOpen(true)
      }
      event.preventDefault()
    } else if (event.key === 'ArrowUp') {
      if (isOpen) {
        highlight(highlightedIndex - 1)
      } else {
        setOpen(true)
      }
      event.preventDefault()
    }
  }

  function isOptionDisabled(option) {
    return (
      values.some((value) => value.value === option.value) ||
      (disabledOptions || []).some((value) => value?.value === option.value)
    )
  }

  function onInput(event) {
    if (!isOpen) setOpen(true)
    setSearch(event.target.value)
  }

  function toggleOpen(event) {
    if (isDisabled || event.target.closest('button')) return
    setOpen((current) => !current)
    requestAnimationFrame(() => searchRef.current?.focus())
  }

  function removeOption(option, event) {
    event.preventDefault()
    event.stopPropagation()
    onSelect(values.filter((value) => value.value !== option.value))
    searchRef.current?.focus()
    setOpen(false)
  }

  const handleOutsidePointer = useCallback((event) => {
    if (containerRef.current?.contains(event.target)) return
    setSearch('')
    setOpen(false)
  }, [])

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsidePointer, false)
    return () =>
      document.removeEventListener('mousedown', handleOutsidePointer, false)
  }, [handleOutsidePointer])

  useEffect(() => {
    if (singleOption && isEmpty && autoFocus) searchRef.current?.focus()
  }, [isEmpty, singleOption, autoFocus])

  const selectableOptions = visibleOptions.filter(
    (option) => !isOptionDisabled(option)
  )
  const highlightedOption = selectableOptions[highlightedIndex]
  const emptyMessage = freeChoice
    ? 'Start typing to apply filter'
    : 'No matches found in the current dashboard. Try selecting a different time range or searching for something different.'

  return (
    <div
      ref={containerRef}
      className={classNames('relative w-full', className, {
        'pointer-events-none cursor-default opacity-50': isDisabled
      })}
      onKeyDown={onKeyDown}
    >
      <InputGroup
        aria-disabled={isDisabled}
        className={classNames(
          'h-auto min-h-8 flex-wrap gap-1 px-1.5 py-1',
          isOpen && 'border-ring ring-3 ring-ring/50',
          boxClass
        )}
        data-disabled={isDisabled}
        onClick={toggleOpen}
      >
        {!singleOption &&
          values.map((value) => (
            <Badge key={value.value} variant="secondary" className="max-w-full">
              <span className="truncate">{value.label}</span>
              <Button
                aria-label={`Remove ${value.label}`}
                className="-mr-1 size-4 rounded-full p-0"
                onClick={(event) => removeOption(value, event)}
                size="icon-xs"
                variant="ghost"
              >
                <DashboardIcon icon={Cancel01Icon} className="size-3" />
              </Button>
            </Badge>
          ))}

        <InputGroupInput
          ref={searchRef}
          aria-autocomplete="list"
          aria-controls="plausible-combobox-list"
          aria-expanded={isOpen}
          aria-label={placeholder}
          autoComplete="off"
          className={classNames(
            'min-w-24 flex-1 px-1.5',
            singleOption && values.length === 1 && 'placeholder:text-foreground'
          )}
          disabled={isDisabled}
          onChange={onInput}
          placeholder={
            singleOption && values.length === 1 && search === ''
              ? values[0].label
              : placeholder
          }
          role="combobox"
          type="text"
          value={search}
        />

        <InputGroupAddon align="inline-end" className="pr-1.5">
          <DashboardIcon
            icon={loading ? Loading03Icon : ArrowDown01Icon}
            className={classNames('size-4', loading && 'animate-spin')}
          />
        </InputGroupAddon>
      </InputGroup>

      {isOpen && (
        <Command
          className="absolute z-50 mt-1 h-auto max-h-60 w-full rounded-lg bg-popover shadow-md ring-1 ring-foreground/10"
          shouldFilter={false}
          value={highlightedOption ? String(highlightedOption.value) : ''}
        >
          <CommandList id="plausible-combobox-list" ref={listRef}>
            {loading ? (
              <div className="flex items-center gap-2 px-2 py-3 text-sm text-muted-foreground">
                <DashboardIcon
                  icon={Loading03Icon}
                  className="size-4 animate-spin"
                />
                Loading options...
              </div>
            ) : selectableOptions.length > 0 ? (
              selectableOptions.map((option, index) => (
                <CommandItem
                  id={optionId(index)}
                  key={option.value}
                  aria-selected={highlightedIndex === index}
                  className={classNames(
                    highlightedIndex === index && 'bg-muted text-foreground'
                  )}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onSelect={() => selectOption(option)}
                  value={String(option.value)}
                >
                  <span className="truncate">
                    {option.freeChoice
                      ? `Filter by '${option.label}'`
                      : option.label}
                  </span>
                </CommandItem>
              ))
            ) : (
              <div className="px-2 py-3 text-sm text-muted-foreground">
                {emptyMessage}
              </div>
            )}
          </CommandList>
        </Command>
      )}
    </div>
  )
}
