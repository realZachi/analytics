import * as React from 'react'
import { isKeyPressed, isModifierPressed, isTyping } from '../keybinding'

/**
 * Keep Escape local to a menu trigger so dashboard-level shortcuts do not run
 * after a Base UI popup closes.
 */
export function BlurMenuButtonOnEscape({
  targetRef
}: {
  targetRef: React.RefObject<HTMLElement>
}) {
  React.useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (
        !isKeyPressed(event, {
          keyboardKey: 'Escape',
          shouldIgnoreWhen: [isModifierPressed, isTyping]
        })
      ) {
        return
      }

      const target = event.target as HTMLElement | null
      if (target === targetRef.current && typeof target?.blur === 'function') {
        target.blur()
        event.stopPropagation()
      }
    }

    document.addEventListener('keyup', handler)
    return () => document.removeEventListener('keyup', handler)
  }, [targetRef])

  return null
}
