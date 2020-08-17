export interface State {
  menuCollapsed: boolean
}

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
    toggleMenuCollapsed (state: State): State {
      state.menuCollapsed = !state.menuCollapsed
      return state
    }
  },
  effects: {}
}
