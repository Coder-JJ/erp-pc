import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, Dispatch } from '../rematch'
import { StockOverview } from '../rematch/models/stock'

const useStockOverviews = (): StockOverview[] => {
  const { didMount, shouldUpdate, overviews } = useSelector((store: RootState) => store.stock)
  const dispatch = useDispatch<Dispatch>()
  useEffect(() => {
    if (!didMount || shouldUpdate) {
      dispatch.stock.loadStockOverviews()
      dispatch.stock.updateState({ didMount: true, shouldUpdate: false })
    }
  }, [didMount, shouldUpdate, dispatch.stock])
  return overviews
}

export default useStockOverviews
