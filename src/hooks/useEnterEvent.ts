import { useEffect, useCallback } from 'react'

type Callback = (this: HTMLElement, e: KeyboardEvent) => any

const useEnterEvent = (listener: () => any, shouldBind: boolean = true): void => {
  const onEnter = useCallback(listener, [listener])
  useEffect(() => {
    if (shouldBind) {
      document.documentElement.addEventListener('keydown', onEnter)
    }
    return () => {
      document.documentElement.removeEventListener('keydown', onEnter)
    }
  }, [shouldBind, onEnter])
}

export default useEnterEvent
