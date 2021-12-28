import styles from './index.less'
import React from 'react'
import { useLocation } from 'react-router-dom'
import { StockOverview } from '../../rematch/models/stock'
import StockOverviews from './StockOverviews'
import StockDetail from './StockDetail'

const Stock: React.FC = function() {
  const { state } = useLocation<StockOverview | undefined>()

  return (
    <div className={styles.wrap}>
      { state ? <StockDetail /> : <StockOverviews /> }
    </div>
  )
}

export default React.memo(Stock)
