import { type } from "os"

export interface State {
  menuCollapsed: boolean
}

export type Dispatch = {}

export const app = {
  state: {
    menuCollapsed: false
  },
  reducers: {
    updateState (state: State, keyValues: Partial<State>): State {
      for (const [key, value] of Object.entries(keyValues)) {
        state[key as keyof State] = value as any
      }
      return state
    },
    test (state: State): State {
      state.menuCollapsed = !state.menuCollapsed
      return state
    }
  },
  effects: (dispatch: any) => ({
    toggleMenuCollapsed () {
      (dispatch.app as any).test()
    }
  })
}
