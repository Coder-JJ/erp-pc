import { useContext, useEffect } from 'react'
import AppContext, { RenderFooter } from '../LayoutContext'

const useFooter = (): RenderFooter => {
  const { showFooter, hideFooter, renderFooter } = useContext(AppContext)
  useEffect(() => {
    showFooter()
    return () => hideFooter()
  }, [showFooter, hideFooter])
  return renderFooter
}

export default useFooter
