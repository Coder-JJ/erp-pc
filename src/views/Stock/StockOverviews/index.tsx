import styles from './index.less'
import React, { useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Card, Button, Spin, Empty } from 'antd'
import { useStockOverviews } from '../../../hooks'
import { RootState } from '../../../rematch'
import { StockOverview } from '../../../rematch/models/stock'

const Stock: React.FC = function() {
  const overviews = useStockOverviews()
  const loading = useSelector((store: RootState) => store.loading.effects.stock.loadStockOverviews)

  const history = useHistory()
  const onClickDetail = useCallback((overview: StockOverview) => history.push('/stock', overview), [history])

  if (loading) {
    return (
      <div className={styles.center}>
        <Spin />
      </div>
    )
  }
  if (!overviews.length) {
    return (
      <div className={styles.center}>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </div>
    )
  }
  return (
    <div className={styles.wrap}>
      {
        overviews.map(overview => {
          const { warehouseId, warehouseName, types, num } = overview
          return (
            <Card
              key={warehouseId}
              className={styles.repository}
              title={(
                <div className={styles.title}>
                  <span title={warehouseName}>{ warehouseName }</span>
                </div>
              )}
              extra={<Button type='primary' onClick={() => onClickDetail(overview)} size='small'>详情</Button>}
            >
              <div className={styles.content}>
                <div className={styles.types}>
                  <span>货物种类：</span>
                  <span className={styles.num} title={`${types}`}>{ types }</span>
                </div>
                <div className={styles.count}>
                  <span>货物数量：</span>
                  <span className={styles.num} title={`${num}`}>{ num }</span>
                </div>
              </div>
            </Card>
          )
        })
      }
    </div>
  )
}

export default React.memo(Stock)
