import React from 'react'
import loadable from "@loadable/component"
import { GlobalLoading } from '../../components'

const LoadableComponent = loadable(() => import("./Component"), { fallback: <GlobalLoading /> })

export default LoadableComponent
