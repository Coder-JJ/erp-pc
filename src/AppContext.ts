import React from 'react'

export type RenderFooter = (elm: React.ReactNode) => React.ReactPortal | null

export interface ContextType {
  showFooter (): void
  hideFooter (): void
  renderFooter: RenderFooter
}

const Context = React.createContext<ContextType>({
  showFooter () {},
  hideFooter () {},
  renderFooter () {
    return null
  }
})

export default Context
