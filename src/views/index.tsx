import React from 'react'
import loadable, { LoadableComponent } from '@loadable/component'
import { GlobalLoading } from '../components'

const views: { [key: string]: LoadableComponent<{}> } = {}

const context = require.context('./', true, /Component\.tsx?$/, 'lazy')

for (const path of context.keys()) {
  views[path.replace('./', '').replace(/\/Component.tsx$/, '')] = loadable(() => context(path), { fallback: <GlobalLoading /> })
}

export default views
