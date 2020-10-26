import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, Dispatch } from '../rematch'
import { StockOverview } from '../rematch/models/stock'

const useStockOverviews = (): StockOverview[] => {
  const overviews = useSelector((store: RootState) => store.stock.overviews)
  const dispatch = useDispatch<Dispatch>()
  useEffect(() => {
    if (!overviews.length) {
      dispatch.stock.loadStockOverviews()
    }
  }, [overviews.length, dispatch.stock])
  return overviews
}

export default useStockOverviews
