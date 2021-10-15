import React from 'react'
import loadable, { LoadableComponent } from '@loadable/component'
import { GlobalLoading } from '../components'

const noFallback: string[] = ['PrintBill', 'PrintCheckout']

const views: { [key: string]: LoadableComponent<{}> } = {}
const context = require.context('./', true, /Component\.tsx?$/, 'lazy')
for (const path of context.keys()) {
  const name = path.replace('./', '').replace(/\/Component.tsx$/, '')
  views[name] = loadable(() => context(path), { fallback: noFallback.includes(name) ? undefined : <GlobalLoading /> })
}

export default views
