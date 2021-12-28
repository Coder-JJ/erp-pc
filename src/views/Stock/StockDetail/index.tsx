import styles from './index.less'
import React, { useEffect, useCallback, useMemo } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Button, Divider, Select, Input } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { ColumnsType } from 'antd/lib/table'
import { SelectProps } from 'antd/lib/select'
import { useStockOverviews } from '../../../hooks'
import { StockOverview, StockDetail } from '../../../rematch/models/stock'
import { Dispatch, RootState } from '../../../rematch'
import { ScrollTable } from '../../../components'

const { Option } = Select

const columns: ColumnsType<StockDetail> = [
  { dataIndex: 'goodName', title: '名称' },
  { dataIndex: 'goodBrand', title: '商标' },
  { dataIndex: 'goodSize', title: '规格' },
  // { dataIndex: 'goodTexture', title: '材质' },
  { dataIndex: 'num', title: '数量' },
  { dataIndex: 'goodRemark', title: '备注' }
]

const Stock: React.FC = function() {
  const { state: { warehouseId, warehouseName } } = useLocation<StockOverview>()
  const overviews = useStockOverviews()
  const { details, detailFilter } = useSelector((store: RootState) => store.stock)
  const data = useMemo(() => {
    const list = details[warehouseId] || []
    const keyword = detailFilter.trim()
    if (!keyword) {
      return list
    }
    return list.filter(({ goodName, goodBrand, goodTexture, goodSize }) => {
      return goodName?.includes(keyword) || goodBrand?.includes(keyword) || goodTexture?.includes(keyword) || goodSize?.includes(keyword)
    })
  }, [details, warehouseId, detailFilter])
  const loading = useSelector((store: RootState) => store.loading.effects.stock.loadStockDetail)

  const dispatch = useDispatch<Dispatch>()
  useEffect(() => {
    if (!details[warehouseId]?.length) {
      dispatch.stock.loadStockDetail(warehouseId)
    }
  }, [details, warehouseId, dispatch.stock])

  const history = useHistory()
  const onClickBack = useCallback(() => history.goBack(), [history])
  const onDetailFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => dispatch.stock.updateState({ detailFilter: e.target.value }), [dispatch.stock])
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
        <div className={styles.filters}>
          <Input value={detailFilter} onChange={onDetailFilterChange} placeholder='名称/商标/材质/规格' />
          {
            !!overviews.length && (
              <Select<number> className={styles.repositories} value={warehouseId} onChange={onRepositoryChange}>
                {
                  overviews.map(({ warehouseId, warehouseName }) => <Option key={warehouseId} value={warehouseId}>{ warehouseName }</Option>)
                }
              </Select>
            )
          }
        </div>
      </header>
      <ScrollTable rowKey='goodId' columns={columns} dataSource={data} loading={loading} />
    </div>
  )
}

export default React.memo(Stock)
