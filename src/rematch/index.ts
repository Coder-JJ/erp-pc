import { init, RematchDispatch, RematchRootState } from '@rematch/core'
import loading from '@rematch/loading'
import immerWithPersist from 'rematch-immer-combine-persist'
import storage from 'localforage'
import { RootModel, models } from './models'

const store = init({
  models,
  plugins: [
    immerWithPersist({
      storage
    }),
    loading()
  ]
})

export default store

export type Store = typeof store
export type Dispatch = RematchDispatch<RootModel>
export type RootState = RematchRootState<RootModel>
