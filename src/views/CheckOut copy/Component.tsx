import styles from './index.less'
import React, { useMemo, useCallback, useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Input, Button, Popconfirm, Pagination } from 'antd'
import Table, { ColumnsType } from 'antd/lib/table'
import { ExpandableConfig } from 'antd/lib/table/interface'
import { debounce } from 'lodash'
import dayjs from 'dayjs'
import { RootState, Dispatch } from '../../rematch'
import { Goods, CheckOut } from '../../rematch/models/checkOut'
import { getCheckOutPriceDisplay, getGoodsPriceDisplay } from '../../utils'
import { useFooter, useEnterEvent } from '../../hooks'
import { ScrollTable } from '../../components'
import { AddForm, EditForm } from './FormModal'

const Component: React.FC = function () {
  const { filter, data, total, pageNum, pageSize } = useSelector((store: RootState) => store.checkOut)
  const loading = useSelector((store: RootState) => store.loading.effects.checkOut.loadCheckOuts)
  const deleting = useSelector((store: RootState) => store.loading.effects.checkOut.deleteCheckOut)

  const dispatch = useDispatch<Dispatch>()
  useEffect(() => {
    if (total === null) {
      dispatch.checkOut.loadCheckOuts()
    }
  }, [total, dispatch.checkOut])

  const debouncedLoadCheckOuts = useMemo(() => debounce<() => void>(dispatch.checkOut.loadCheckOuts, 250), [dispatch.checkOut.loadCheckOuts])
  const onOddChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch.checkOut.updateFilter({ odd: e.target.value })
    debouncedLoadCheckOuts()
  }, [dispatch.checkOut, debouncedLoadCheckOuts])

  const [onDeleteId, setDeleteId] = useState<number | undefined>()
  const deleteCheckOut = useCallback(async () => {
    if (onDeleteId) {
      setDeleteId(onDeleteId)
      await dispatch.checkOut.deleteCheckOut(onDeleteId)
      setDeleteId(undefined)
    }
  }, [onDeleteId, dispatch.checkOut])
  const columns: ColumnsType<CheckOut> = useMemo(() => [
    { dataIndex: 'odd', title: '单号' },
    { dataIndex: 'warehouseName', title: '入库仓库' },
    { dataIndex: 'supplierName', title: '供应商' },
    { dataIndex: 'signer', title: '签收人' },
    {
      dataIndex: 'receivedTime',
      title: '签收时间',
      render (receivedTime, record) {
        return dayjs(receivedTime).format('YYYY-MM-DD')
      }
    },
    { dataIndex: 'remark', title: '备注' },
    {
      dataIndex: 'discount',
      title: '折扣',
      render (discount) {
        return discount === 1 ? '--' : discount
      }
    },
    {
      dataIndex: 'paid',
      title: '应收金额',
      render (paid, record) {
        return getCheckOutPriceDisplay(record)
      }
    },
    {
      dataIndex: 'id',
      width: 140,
      render (id, record) {
        return (
          <>
            <EditForm>
              <Button type='link' onMouseEnter={() => dispatch.checkOut.updateEditForm(record)}>编辑</Button>
            </EditForm>
            <Popconfirm
              visible={id === onDeleteId}
              onVisibleChange={visible => setDeleteId(visible || deleting ? id : undefined)}
              onConfirm={deleteCheckOut}
              okButtonProps={{ loading: deleting }}
              arrowPointAtCenter
              title='是否确定删除该出库单'
              placement='topRight'
            >
              <Button type='link' danger>删除</Button>
            </Popconfirm>
          </>
        )
      }
    }
  ], [dispatch.checkOut, onDeleteId, deleteCheckOut, deleting])

  const goodsColumns: ColumnsType<Goods> = useMemo(() => [
    { dataIndex: 'name', title: '货物名称' },
    { dataIndex: 'brand', title: '商标' },
    { dataIndex: 'texture', title: '材质' },
    { dataIndex: 'size', title: '规格' },
    { dataIndex: 'price', title: '单价' },
    { dataIndex: 'num', title: '数量' },
    {
      dataIndex: 'discount',
      title: '折扣',
      render (discount) {
        return discount === 1 ? '--' : discount
      }
    },
    {
      dataIndex: 'paid',
      title: '应收金额',
      render (paid, record) {
        return getGoodsPriceDisplay(record)
      }
    }
  ], [])
  const expandable = useMemo<ExpandableConfig<CheckOut>>(() => ({
    expandedRowRender ({ fetchGoodsRecordList }) {
      return <Table<Goods> rowKey='id' columns={goodsColumns} dataSource={fetchGoodsRecordList} bordered pagination={false} size='middle' />
    }
  }), [goodsColumns])

  useEnterEvent(deleteCheckOut, !!onDeleteId)
  const renderFooter = useFooter()

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <span>单号：</span>
        <Input className={styles.input} value={filter.odd} onChange={onOddChange} placeholder='请输入单号' />
      </header>
      <footer className={styles.footer}>
        <ScrollTable<CheckOut> rowKey='id' columns={columns} dataSource={data} loading={loading} expandable={expandable} />
      </footer>
      {
        renderFooter(
          <>
            <AddForm>
              <Button type='primary'>新增</Button>
            </AddForm>
            {
              !!total && <Pagination current={pageNum} pageSize={pageSize} total={total} />
            }
          </>
        )
      }
    </div>
  )
}

export default React.memo(Component)
