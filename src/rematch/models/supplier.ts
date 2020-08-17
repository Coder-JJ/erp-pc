import { sleep } from '../../libs'
import { Dispatch } from '../../rematch'

export interface Supplier {
  code: string
  name: string
}

export interface State {
  data: Supplier[]
  addForm: Supplier
}

const state: State = {
  data: [],
  addForm: {
    code: '',
    name: ''
  }
}

export const supplier = {
  state,
  reducers: {
    updateAddForm (state: State, keyValues: Partial<Supplier>): State {
      for (const [key, value] of Object.entries(keyValues)) {
        state.addForm[key as keyof Supplier] = value!
      }
      return state
    },
    clearAddForm (state: State): State {
      state.addForm.code = ''
      state.addForm.name = ''
      return state
    },
    pushSupplier (state: State, payload: Supplier): State {
      state.data.push(payload)
      return state
    }
  },
  effects: (dispatch: Dispatch) => ({
    async addSupplier (payload: Supplier) {
      await sleep(1)
      dispatch.supplier.pushSupplier(payload)
    }
  })
}
