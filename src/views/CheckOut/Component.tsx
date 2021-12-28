import styles from './index.less'
import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Input, Button, Popconfirm, Pagination, Table, Form, Tag, Dropdown, Menu } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import { ExpandableConfig } from 'antd/lib/table/interface'
import { DownOutlined } from '@ant-design/icons'
import { debounce } from 'lodash'
import dayjs from 'dayjs'
import { RootState, Dispatch } from '../../rematch'
import { Goods, CheckOut, checkOutStateNameMap, CheckOutState } from '../../rematch/models/checkOut'
import { getCheckOutPriceDisplay, getGoodsPriceDisplay } from '../../utils'
import { useFooter } from '../../hooks'
import { ScrollTable, CustomerSelect } from '../../components'
import { AddForm, EditForm } from './FormModal'
import StatusModal from './StatusModal'

const Component: React.FC = function() {
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
    dispatch.checkOut.updateState({ pageNum: 1 })
    debouncedLoadCheckOuts()
  }, [dispatch.checkOut, debouncedLoadCheckOuts])
  const onCustomerChange = useCallback((customId: number) => {
    dispatch.checkOut.updateFilter({ customId })
    dispatch.checkOut.updateState({ pageNum: 1 })
    debouncedLoadCheckOuts()
  }, [dispatch.checkOut, debouncedLoadCheckOuts])

  const [onDeleteId, setDeleteId] = useState<number | undefined>()

  const ref = useRef<HTMLIFrameElement | null>(null)
  const [isIframeReady, setIframeReady] = useState<boolean>(false)
  useEffect(() => {
    const onMessage = (e: MessageEvent<boolean>): void => {
      setIframeReady(e.data)
    }
    window.addEventListener('message', onMessage)
    return () => {
      window.removeEventListener('message', onMessage)
    }
  }, [])
  const printCheckOut = useCallback((checkOut: CheckOut) => {
    ref.current?.contentWindow?.postMessage(checkOut)
  }, [])

  const [editFormVisible, setEditFormVisible] = useState(false)
  const openEditForm = useCallback((record: CheckOut) => {
    dispatch.checkOut.setEditForm(record)
    setEditFormVisible(true)
  }, [dispatch.checkOut])
  const closeEditForm = useCallback(() => {
    setEditFormVisible(false)
  }, [])

  const [statusModalData, setStatusModalData] = useState<CheckOut | undefined>()
  const [statusModalVisible, setStatusModalVisible] = useState(false)
  const openStatusModal = useCallback((record: CheckOut) => {
    setStatusModalData(record)
    setStatusModalVisible(true)
  }, [])
  const closeStatusModal = useCallback(() => {
    setStatusModalVisible(false)
    setStatusModalData(undefined)
  }, [])
  const columns = useMemo<ColumnsType<CheckOut>>(() => [
    { dataIndex: 'odd', title: '单号' },
    { dataIndex: 'customName', title: '客户/商标' },
    { dataIndex: 'receiverName', title: '收货方/厂家' },
    {
      dataIndex: 'dealTime',
      title: '开单日期',
      render(dealTime, record) {
        return dayjs(dealTime).format('YYYY-MM-DD')
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
      render(paid, record) {
        return getCheckOutPriceDisplay(record)
      }
    },
    {
      dataIndex: 'state',
      title: '状态',
      render(value, record) {
        const state = value as CheckOutState
        const text = checkOutStateNameMap[state]
        return <Tag color={state === CheckOutState.Canceled ? 'error' : (state === CheckOutState.Paid ? 'success' : 'processing')}>{ text }</Tag>
      }
    },
    { dataIndex: 'remark', title: '备注' },
    {
      dataIndex: 'id',
      width: 130,
      render(id, record) {
        return (
          <div>
            {
              record.state === CheckOutState.Canceled ? (
                <>
                  <Button type='link' size='small' disabled>重开</Button>
                  <Button type='link' onClick={() => openStatusModal(record)} size='small'>状态</Button>
                </>
              ) : (
                <>
                  <Button type='link' size='small' onClick={() => printCheckOut(record)} disabled={!isIframeReady}>打印</Button>
                  <Dropdown
                    overlay={(
                      <Menu>
                        <Menu.Item onClick={() => openEditForm(record)}>编辑</Menu.Item>
                        <Menu.Item onClick={() => openStatusModal(record)}>状态</Menu.Item>
                        <Menu.Item danger>
                          <Popconfirm
                            visible={id === onDeleteId}
                            onVisibleChange={visible => setDeleteId(visible || deleting ? id : undefined)}
                            onConfirm={() => dispatch.checkOut.deleteCheckOut(record)}
                            okButtonProps={{ loading: deleting }}
                            arrowPointAtCenter
                            title='是否确定删除该出库单'
                            placement='topRight'
                          >
                            删除
                          </Popconfirm>
                        </Menu.Item>
                      </Menu>
                    )}
                  >
                    <Button type='link' size='small'>操作<DownOutlined /></Button>
                  </Dropdown>
                </>
              )
            }
          </div>
        )
      }
    }
  ], [dispatch.checkOut, isIframeReady, printCheckOut, onDeleteId, deleting, openEditForm, openStatusModal])

  const goodsColumns: ColumnsType<Goods> = useMemo(() => [
    { dataIndex: 'name', title: '货物名称' },
    { dataIndex: 'brand', title: '商标' },
    // { dataIndex: 'texture', title: '材质' },
    { dataIndex: 'size', title: '规格' },
    { dataIndex: 'num', title: '数量' },
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
      render(paid, record) {
        return getGoodsPriceDisplay(record)
      }
    }
  ], [])
  const expandable = useMemo<ExpandableConfig<CheckOut>>(() => ({
    expandedRowRender({ fetchGoodsRecordList }) {
      return <Table<Goods> rowKey='id' columns={goodsColumns} dataSource={fetchGoodsRecordList} bordered pagination={false} size='middle' />
    }
  }), [goodsColumns])

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
      <iframe className={styles.print} src='/print/checkout' ref={ref} />
      <EditForm visible={editFormVisible} onCancel={closeEditForm} />
      <StatusModal visible={statusModalVisible} checkOut={statusModalData} onOk={closeStatusModal} onCancel={closeStatusModal} />
    </div>
  )
}

export default React.memo(Component)
