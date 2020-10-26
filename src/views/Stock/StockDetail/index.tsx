import styles from './index.less'
import React, { useEffect, useCallback } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Button, Divider, Select } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { ColumnsType } from 'antd/lib/table'
import { SelectProps } from 'antd/lib/select'
import { useStockOverviews } from '../../../hooks'
import { StockOverview, StockDetail } from '../../../rematch/models/stock'
import { Dispatch, RootState } from '../../../rematch'
import { ScrollTable } from '../../../components'

const { Option } = Select

const columns: ColumnsType<StockDetail> = [
  { dataIndex: 'goodId', title: '编号' },
  { dataIndex: 'goodName', title: '名称' },
  { dataIndex: 'goodBrand', title: '商标' },
  { dataIndex: 'goodSize', title: '规格' },
  { dataIndex: 'goodTexture', title: '材质' },
  { dataIndex: 'num', title: '数量' },
  { dataIndex: 'goodRemark', title: '备注' }
]

const Stock: React.FC = function () {
  const { state: { warehouseId, warehouseName } } = useLocation<StockOverview>()
  const overviews = useStockOverviews()
  const details = useSelector((store: RootState) => store.stock.details)
  const loading = useSelector((store: RootState) => store.loading.effects.stock.loadStockDetail)

  const dispatch = useDispatch<Dispatch>()
  useEffect(() => {
    if (!details[warehouseId]?.length) {
      dispatch.stock.loadStockDetail(warehouseId)
    }
  }, [details, warehouseId, dispatch.stock])

  const history = useHistory()
  const onClickBack = useCallback(() => history.goBack(), [history])
  const onRepositoryChange: NonNullable<SelectProps<number>['onChange']> = useCallback(value => {
    const overview = overviews.find(({ warehouseId }) => warehouseId === value)
    if (overview) {
      history.push('/stock', overview)
    }
  }, [overviews, history])

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div>
          <Button className={styles.back} type='link' onClick={onClickBack} icon={<ArrowLeftOutlined />}>返回</Button>
          <Divider type='vertical' />
          <span className={styles.title}>{ warehouseName }</span>
        </div>
        {
          !!overviews.length && (
            <Select<number> className={styles.repositories} value={warehouseId} onChange={onRepositoryChange}>
              {
                overviews.map(({ warehouseId, warehouseName }) => <Option key={warehouseId} value={warehouseId}>{ warehouseName }</Option>)
              }
            </Select>
          )
        }
      </header>
      <ScrollTable rowKey='goodId' columns={columns} dataSource={details[warehouseId] || []} loading={loading} />
    </div>
  )
}

export default React.memo(Stock)
