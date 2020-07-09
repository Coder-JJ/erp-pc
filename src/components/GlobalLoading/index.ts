import 'nprogress/nprogress.css'
import React, { useEffect } from 'react'
import NProgress from 'nprogress'

const GlobalLoading: React.FC = function () {
  useEffect(() => {
    NProgress.start()
    return () => {
      NProgress.done()
    }
  }, [])
  return null
}

export default React.memo(GlobalLoading)
