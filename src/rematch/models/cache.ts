import { createModel } from '@rematch/core'
import type { RootModel } from '.'

export type State = {}

export const cache = createModel<RootModel>()({
  state: {
  } as State,
  reducers: {
  },
  effects: dispatch => ({})
})
