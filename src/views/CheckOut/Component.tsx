import styles from './index.less'
import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Input, Button, Popconfirm, Pagination, Table, Form, Tag } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import { ExpandableConfig } from 'antd/lib/table/interface'
import { debounce } from 'lodash'
import dayjs from 'dayjs'
import { RootState, Dispatch } from '../../rematch'
import { Goods, CheckOut, checkOutStateNameMap, CheckOutState } from '../../rematch/models/checkOut'
import { getCheckOutPriceDisplay, getGoodsPriceDisplay } from '../../utils'
import { useFooter, useEnterEvent } from '../../hooks'
import { ScrollTable, CustomerSelect } from '../../components'
import { AddForm, EditForm } from './FormModal'

const Component: React.FC = function () {
  const { filter, data, total, pageNum, pageSize } = useSelector((store: RootState) => store.checkOut)
  const loading = useSelector((store: RootState) => store.loading.effects.checkOut.loadCheckOuts)
  const cancelling = useSelector((store: RootState) => store.loading.effects.checkOut.cancelCheckOut)
  const deleting = useSelector((store: RootState) => store.loading.effects.checkOut.deleteCheckOut)

  const dispatch = useDispatch<Dispatch>()
  useEffect(() => {
    if (total === null) {
      dispatch.checkOut.loadCheckOuts()
    }
  }, [total, dispatch.checkOut])

  const debouncedLoadCheckOuts = useMemo(() => debounce<() => void>(dispatch.checkOut.loadCheckOuts, 250), [dispatch.checkOut.loadCheckOuts])
  const onOddChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch.checkOut.updateFilter({ odd: e.target.value, pageNum: 1 })
    debouncedLoadCheckOuts()
  }, [dispatch.checkOut, debouncedLoadCheckOuts])
  const onCustomerChange = useCallback((customId: number) => {
    dispatch.checkOut.updateFilter({ customId, pageNum: 1 })
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

  const [onPrintId, setPrintId] = useState<number | undefined>()
  const [printParams, setPrintParams] = useState<string>('')
  const ref = useRef<HTMLIFrameElement | null>(null)
  useEffect(() => {
    const onMessage = (e: MessageEvent<boolean>): void => {
      if (e.data) {
        ref.current?.contentWindow?.print()
        setPrintId(undefined)
        setPrintParams('')
      }
    }
    window.addEventListener('message', onMessage)
    return () => {
      window.removeEventListener('message', onMessage)
    }
  }, [])
  const printCheckOut: React.MouseEventHandler<HTMLElement> = useCallback(e => {
    const id = e.currentTarget.dataset.id!
    setPrintId(Number(id))
    setPrintParams(`id=${id}`)
  }, [])

  const [onCancelId, setCancelId] = useState<number | undefined>()
  const cancelCheckOut = useCallback(async (checkOut: CheckOut) => {
    if (onCancelId) {
      setCancelId(onCancelId)
      await dispatch.checkOut.cancelCheckOut(checkOut)
      setCancelId(undefined)
    }
  }, [dispatch.checkOut, onCancelId])

  const columns = useMemo<ColumnsType<CheckOut>>(() => [
    { dataIndex: 'odd', title: '单号' },
    { dataIndex: 'customName', title: '客户/商标' },
    { dataIndex: 'receiverName', title: '收货方/厂家' },
    {
      dataIndex: 'dealTime',
      title: '开单日期',
      render (receivedTime, record) {
        return dayjs(receivedTime).format('YYYY-MM-DD')
      }
    },
    // {
    //   dataIndex: 'discount',
    //   title: '折扣',
    //   render (discount) {
    //     return discount === 1 ? '--' : discount
    //   }
    // },
    {
      dataIndex: 'paid',
      title: '应收金额',
      render (paid, record) {
        return getCheckOutPriceDisplay(record)
      }
    },
    {
      dataIndex: 'state',
      title: '状态',
      render (value, record) {
        const state = value as CheckOutState
        const text = checkOutStateNameMap[state]
        return <Tag color={state === CheckOutState.Canceled ? 'error' : 'processing'}>{ text }</Tag>
      }
    },
    { dataIndex: 'remark', title: '备注' },
    {
      dataIndex: 'id',
      width: 260,
      render (id, record) {
        return (
          record.state === CheckOutState.Canceled ? (
            <Button type='link' disabled>重开</Button>
          ) : (
            <>
              <Button type='link' data-id={id} onClick={printCheckOut} loading={id === onPrintId}>打印</Button>
              <EditForm>
                <Button type='link' onMouseEnter={() => dispatch.checkOut.setEditForm(record)}>编辑</Button>
              </EditForm>
              <Popconfirm
                visible={id === onCancelId}
                onVisibleChange={visible => setCancelId(visible || cancelling ? id : undefined)}
                onConfirm={() => cancelCheckOut(record)}
                okButtonProps={{ loading: cancelling }}
                arrowPointAtCenter
                title='是否确定作废该出库单'
                placement='topRight'
              >
                <Button type='link' danger>作废</Button>
              </Popconfirm>
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
        )
      }
    }
  ], [dispatch.checkOut, onPrintId, printCheckOut, onCancelId, cancelCheckOut, cancelling, onDeleteId, deleteCheckOut, deleting])

  const goodsColumns: ColumnsType<Goods> = useMemo(() => [
    { dataIndex: 'name', title: '货物名称' },
    { dataIndex: 'brand', title: '商标' },
    // { dataIndex: 'texture', title: '材质' },
    { dataIndex: 'size', title: '规格' },
    { dataIndex: 'num', title: '鞋盒' },
    { dataIndex: 'reticule', title: '手提袋' },
    { dataIndex: 'shoeCover', title: '鞋套' },
    { dataIndex: 'container', title: '外箱' },
    { dataIndex: 'price', title: '单价' },
    // {
    //   dataIndex: 'discount',
    //   title: '折扣',
    //   render (discount) {
    //     return discount === 1 ? '--' : discount
    //   }
    // },
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

  const onPaginationChange = useCallback((pageNum: number, pageSize: number | undefined) => {
    dispatch.checkOut.updateState({ pageNum, pageSize })
    dispatch.checkOut.loadCheckOuts()
  }, [dispatch.checkOut])

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <Form layout='inline'>
          <Form.Item label='单号'>
            <Input className={styles.input} value={filter.odd} onChange={onOddChange} placeholder='请输入单号' />
          </Form.Item>
          <Form.Item label='客户/商标'>
            <CustomerSelect<number> className={styles.select} value={filter.customId} onChange={onCustomerChange} allowClear />
          </Form.Item>
        </Form>
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
              !!total && <Pagination current={pageNum} pageSize={pageSize} total={total} onChange={onPaginationChange} />
            }
          </>
        )
      }
      <iframe className={styles.print} src={`/print/checkout?${printParams}`} ref={ref} />
    </div>
  )
}

export default React.memo(Component)
