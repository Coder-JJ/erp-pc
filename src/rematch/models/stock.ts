import { request } from '../../libs'
import { Dispatch } from '../../rematch'

export interface StockOverview {
  warehouseId: number
  warehouseName: string
  types: number
  num: number
}

export interface StockDetail {
  warehouseId: number
  warehouseName: string
  goodId: number
  goodName: string
  goodBrand: string
  goodSize: string
  goodTexture: string
  goodRemark: string
  num: number
}

export interface StockDetails {
  [key: string]: StockDetail[]
}

export interface State {
  overviews: StockOverview[]
  details: StockDetails
}

const state: State = {
  overviews: [],
  details: {}
}

export const stock = {
  state,
  reducers: {
    updateState (state: State, keyValues: Partial<State>): State {
      for (const [key, value] of Object.entries(keyValues)) {
        state[key as keyof State] = value as any
      }
      return state
    },
    updateDetails (state: State, { id, data }: { id: number, data: StockDetail[] }): State {
      state.details[id] = data
      return state
    }
  },
  effects: (dispatch: Dispatch) => ({
    async loadStockOverviews () {
      const overviews = await request.get<StockOverview[], StockOverview[]>('/warehouse/statistics')
      dispatch.stock.updateState({ overviews })
    },
    async loadStockDetail (id: number) {
      const data = await request.get<StockDetail[], StockDetail[]>(`/warehouse/repertory/${id}`)
      dispatch.stock.updateDetails({ id, data })
    }
  })
}
