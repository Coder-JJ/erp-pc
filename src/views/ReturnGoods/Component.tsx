import styles from './index.less'
import React, { useMemo, useCallback, useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Button, Popconfirm, Pagination, Table, Form } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import { ExpandableConfig } from 'antd/lib/table/interface'
import { debounce } from 'lodash'
import dayjs from 'dayjs'
import { RootState, Dispatch } from '../../rematch'
import { Goods, ReturnGoods } from '../../rematch/models/returnGoods'
import { getReturnGoodsPriceDisplay, getGoodsPriceDisplay } from '../../utils'
import { useCustomers, useFooter, useGoods } from '../../hooks'
import { ScrollTable, CustomerSelect, GoodsSelect } from '../../components'
import { AddForm, EditForm } from './FormModal'

const Component: React.FC = function () {
  const { filter, data, total, pageNum, pageSize } = useSelector((store: RootState) => store.returnGoods)
  const loading = useSelector((store: RootState) => store.loading.effects.returnGoods.loadReturnGoods)
  const deleting = useSelector((store: RootState) => store.loading.effects.returnGoods.deleteReturnGoods)

  const dispatch = useDispatch<Dispatch>()
  useEffect(() => {
    if (total === null) {
      dispatch.returnGoods.loadReturnGoods()
    }
  }, [total, dispatch.returnGoods])

  const debouncedLoadReturnGoods = useMemo(() => debounce<() => void>(dispatch.returnGoods.loadReturnGoods, 250), [dispatch.returnGoods.loadReturnGoods])
  const onCustomersChange = useCallback((customIds: number[]) => {
    dispatch.returnGoods.updateFilter({ customIds })
    dispatch.returnGoods.updateState({ pageNum: 1 })
    debouncedLoadReturnGoods()
  }, [dispatch.returnGoods, debouncedLoadReturnGoods])
  const onReturnSidesChange = useCallback((cancelPersonIds: number[]) => {
    dispatch.returnGoods.updateFilter({ cancelPersonIds })
    dispatch.returnGoods.updateState({ pageNum: 1 })
    debouncedLoadReturnGoods()
  }, [dispatch.returnGoods, debouncedLoadReturnGoods])
  const onGoodsChange = useCallback((goodsIds: number[]) => {
    dispatch.returnGoods.updateFilter({ goodsIds })
    dispatch.returnGoods.updateState({ pageNum: 1 })
    debouncedLoadReturnGoods()
  }, [dispatch.returnGoods, debouncedLoadReturnGoods])

  const [onDeleteId, setDeleteId] = useState<number | undefined>()

  const [editFormVisible, setEditFormVisible] = useState(false)
  const openEditForm = useCallback((record: ReturnGoods) => {
    dispatch.returnGoods.setEditForm(record)
    setEditFormVisible(true)
  }, [dispatch.returnGoods])
  const closeEditForm = useCallback(() => {
    setEditFormVisible(false)
  }, [])

  const customers = useCustomers()
  const columns = useMemo<ColumnsType<ReturnGoods>>(() => [
    { dataIndex: 'customId', title: '客户/商标', render: value => customers.find(c => c.id === value)?.name },
    { dataIndex: 'cancelPersonId', title: '退货方/厂家', render: value => customers.find(c => c.id === value)?.name },
    {
      dataIndex: 'cancelTime',
      title: '退货日期',
      render (cancelTime, record) {
        return dayjs(cancelTime).format('YYYY-MM-DD')
      }
    },
    {
      dataIndex: 'paid',
      title: '退货金额',
      render (paid, record) {
        return getReturnGoodsPriceDisplay(record)
      }
    },
    { dataIndex: 'remark', title: '备注' },
    {
      dataIndex: 'id',
      width: 110,
      render (id, record) {
        return (
          <>
            <Button type='link' size='small' onClick={() => openEditForm(record)}>编辑</Button>
            <Popconfirm
              visible={id === onDeleteId}
              onVisibleChange={visible => setDeleteId(visible || deleting ? id : undefined)}
              onConfirm={() => dispatch.returnGoods.deleteReturnGoods(record)}
              okButtonProps={{ loading: deleting }}
              arrowPointAtCenter
              title='是否确定删除该退货单'
              placement='topRight'
            >
              <Button type='link' size='small' danger>删除</Button>
            </Popconfirm>
          </>
        )
      }
    }
  ], [dispatch.returnGoods, onDeleteId, deleting, openEditForm, customers])

  const [goods] = useGoods()
  const goodsColumns: ColumnsType<Goods> = useMemo(() => [
    { dataIndex: 'goodsId', title: '货物名称', render: value => goods.find(g => g.id === value)?.name },
    { dataIndex: 'goodsId', title: '商标', render: value => goods.find(g => g.id === value)?.brand },
    { dataIndex: 'goodsId', title: '规格', render: value => goods.find(g => g.id === value)?.size },
    { dataIndex: 'num', title: '数量' },
    { dataIndex: 'reticule', title: '手提袋' },
    { dataIndex: 'shoeCover', title: '鞋套' },
    { dataIndex: 'container', title: '外箱' },
    { dataIndex: 'price', title: '单价' },
    {
      dataIndex: 'paid',
      title: '退货金额',
      render (paid, record) {
        return getGoodsPriceDisplay(record)
      }
    }
  ], [goods])
  const expandable = useMemo<ExpandableConfig<ReturnGoods>>(() => ({
    expandedRowRender ({ cancelGoodsRecordList }) {
      return <Table<Goods> rowKey='id' columns={goodsColumns} dataSource={cancelGoodsRecordList} bordered pagination={false} size='middle' />
    }
  }), [goodsColumns])

  const renderFooter = useFooter()

  const onPaginationChange = useCallback((pageNum: number, pageSize: number | undefined) => {
    dispatch.returnGoods.updateState({ pageNum, pageSize })
    dispatch.returnGoods.loadReturnGoods()
  }, [dispatch.returnGoods])

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <Form layout='inline'>
          <Form.Item label='客户/商标'>
            <CustomerSelect<number[]> className={styles.select} value={filter.customIds} onChange={onCustomersChange} mode='multiple' maxTagCount={5} allowClear placeholder='请选择客户/商标' />
          </Form.Item>
          <Form.Item label='退货方/厂家'>
            <CustomerSelect<number[]> className={styles.select} value={filter.cancelPersonIds} onChange={onReturnSidesChange} mode='multiple' maxTagCount={5} allowClear placeholder='请选择退货方/厂家' />
          </Form.Item>
          <Form.Item label='货物'>
            <GoodsSelect<number[]> className={styles.select} value={filter.goodsIds} onChange={onGoodsChange} mode='multiple' allowClear placeholder='请选择货物' />
          </Form.Item>
        </Form>
      </header>
      <footer className={styles.footer}>
        <ScrollTable<ReturnGoods> rowKey='id' columns={columns} dataSource={data} loading={loading} expandable={expandable} />
      </footer>
      {
        renderFooter(
          <>
            <AddForm>
              <Button type='primary'>新增</Button>
            </AddForm>
            {
              !!total && <Pagination current={pageNum} pageSize={pageSize} total={total} onChange={onPaginationChange} />
            }
          </>
        )
      }
      <EditForm visible={editFormVisible} onCancel={closeEditForm} />
    </div>
  )
}

export default React.memo(Component)
