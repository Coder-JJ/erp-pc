import storage from 'redux-persist/lib/storage/session'
import stateReconciler from 'redux-persist/lib/stateReconciler/autoMergeLevel2'
import { init, RematchDispatch, RematchRootState } from '@rematch/core'
import immerPlugin from '@rematch/immer'
import loadingPlugin, { ExtraModelsFromLoading } from '@rematch/loading'
import persistPlugin from '@rematch/persist'
import { models, RootModel } from './models'

type FullModel = ExtraModelsFromLoading<RootModel>

const store = init<RootModel, FullModel>({
  models,
  plugins: [
    immerPlugin(),
    loadingPlugin(),
    persistPlugin({
      key: 'root',
      storage,
      stateReconciler,
      whitelist: ['app', 'cache']
    })
  ]
})

export type Store = typeof store
export type Dispatch = RematchDispatch<RootModel>
export type RootState = RematchRootState<RootModel, FullModel>

export default store
