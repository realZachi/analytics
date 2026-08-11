/**
 * Hook widget delegating navigation events to and from React.
 * Necessary to emulate navigation events in LiveView with pushState
 * manipulation disabled.
 */

import LinkSquare01Icon from '@hugeicons/core-free-icons/LinkSquare01Icon'
import ArrowExpandIcon from '@hugeicons/core-free-icons/ArrowExpandIcon'

import { buildHook } from './hook_builder'

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'
const DASHBOARD_ICONS = Object.freeze({
  'external-link': LinkSquare01Icon,
  expand: ArrowExpandIcon
})

function svgAttributeName(name) {
  return name.replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`)
}

function hydrateDashboardIcons() {
  document.querySelectorAll('[data-dashboard-icon]').forEach((placeholder) => {
    const iconName = placeholder.dataset.dashboardIcon
    const icon = Object.prototype.hasOwnProperty.call(DASHBOARD_ICONS, iconName)
      ? DASHBOARD_ICONS[iconName]
      : null
    const renderedIcon = placeholder.querySelector(
      'svg[data-dashboard-icon-svg]'
    )

    if (
      !icon ||
      (placeholder.dataset.dashboardIconHydrated === iconName && renderedIcon)
    ) {
      return
    }

    const svg = document.createElementNS(SVG_NAMESPACE, 'svg')
    svg.setAttribute('aria-hidden', 'true')
    svg.setAttribute('class', 'pointer-events-none block size-full')
    svg.setAttribute('data-dashboard-icon-svg', '')
    svg.setAttribute('fill', 'none')
    svg.setAttribute('focusable', 'false')
    svg.setAttribute('viewBox', '0 0 24 24')

    icon.forEach(([tagName, attributes]) => {
      const node = document.createElementNS(SVG_NAMESPACE, tagName)

      Object.entries(attributes).forEach(([name, value]) => {
        if (name !== 'key') {
          node.setAttribute(svgAttributeName(name), String(value))
        }
      })

      svg.append(node)
    })

    placeholder.textContent = ''
    placeholder.append(svg)
    placeholder.dataset.dashboardIconHydrated = iconName
  })
}

function navigateWithLoader(url) {
  this.portalTargets.map((target) => {
    this.js().addClass(document.querySelector(target), 'phx-navigation-loading')

    this.pushEvent('handle_dashboard_params', { url: url }, () => {
      this.js().removeClass(
        document.querySelector(target),
        'phx-navigation-loading'
      )
    })
  })
}

export default buildHook({
  initialize() {
    this.url = window.location.href

    hydrateDashboardIcons()

    const portals = document.querySelectorAll('[data-phx-portal]')
    this.portalTargets = Array.from(portals, (p) => p.dataset.phxPortal)

    this.addListener('click', document.body, (e) => {
      const type = e.target.dataset.type || null

      if (type === 'dashboard-link') {
        this.url = e.target.href
        const uri = new URL(this.url)
        // Domain is dropped from URL prefix, because that's what react-dom-router
        // expects.
        const path = '/' + uri.pathname.split('/').slice(2).join('/')
        this.el.dispatchEvent(
          new CustomEvent('dashboard:live-navigate', {
            bubbles: true,
            detail: { path: path, search: uri.search }
          })
        )

        navigateWithLoader.bind(this)(this.url)

        e.preventDefault()
      }
    })

    // Browser back and forward navigation triggers that event.
    this.addListener('popstate', window, () => {
      if (this.url !== window.location.href) {
        navigateWithLoader.bind(this)(window.location.href)
      }
    })

    // Navigation events triggered from liveview are propagated via this
    // handler.
    this.addListener('dashboard:live-navigate-back', window, (e) => {
      if (
        typeof e.detail.search === 'string' &&
        this.url !== window.location.href
      ) {
        navigateWithLoader.bind(this)(window.location.href)
      }
    })
  }
})
