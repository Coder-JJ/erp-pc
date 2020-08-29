import { init, RematchDispatch, RematchRootState, ModelConfig, ModelEffects } from '@rematch/core'
import loading from '@rematch/loading'
import immerWithPersist from 'rematch-immer-combine-persist'
import storage from 'localforage'
import { RootModel, models } from './models'

const store = init({
  models,
  redux: {
    rootReducers: {
      RESET: () => undefined
    }
  },
  plugins: [
    loading(),
    immerWithPersist({
      immerOptions: {
        blacklist: ['loading']
      },
      persistOptions: {
        persistConfig: {
          storage
        }
      }
    })
  ]
})

export default store

export type Store = typeof store
export type Dispatch = RematchDispatch<RootModel>
export type RootState = RematchRootState<RootModel>

type MapEffectsToBoolean<effects extends ModelEffects<any>> = {
  [key in keyof effects]: boolean
}

type EffectsBoolean<effects extends ModelConfig['effects']> = (
  effects extends ((...args: any[]) => infer R) ? (
    R extends ModelEffects<any> ? MapEffectsToBoolean<R> : {}
  ) : (
    effects extends ModelEffects<any> ? MapEffectsToBoolean<effects> : {}
  )
)
type EffectsOfModel<M extends ModelConfig> = EffectsBoolean<M['effects']>

export interface LoadingState {
  loading: {
    global: boolean
    models: {
      [key in keyof RootModel]: boolean
    }
    effects: {
      [key in keyof RootModel]: EffectsOfModel<RootModel[key]>
    }
  }
}
