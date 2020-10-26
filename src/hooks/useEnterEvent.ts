import { useEffect, useCallback } from 'react'

type Callback = (this: HTMLElement, e: KeyboardEvent) => any

const useEnterEvent = (listener: Callback, shouldBind: boolean = true): void => {
  const onEnter = useCallback(function (this: HTMLElement, e: KeyboardEvent) {
    if (e.keyCode === 13) {
      listener.call(this, e)
    }
  }, [listener])
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
