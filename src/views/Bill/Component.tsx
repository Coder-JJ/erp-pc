import styles from './index.less'
import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Table, Form, Button, Row, Col, message } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import { ExpandableConfig } from 'antd/lib/table/interface'
import { usePersistFn } from 'ahooks'
import dayjs, { Dayjs } from 'dayjs'
import { RootState, Dispatch } from '../../rematch'
import { Goods, CheckOut } from '../../rematch/models/checkOut'
import { getCheckOutPriceDisplay, getGoodsPriceDisplay } from '../../utils'
import { ScrollTable, CustomerSelect, GoodsSelect, DatePicker } from '../../components'

const Component: React.FC = function () {
  const { filter, data, params } = useSelector((store: RootState) => store.bill)
  const loading = useSelector((store: RootState) => store.loading.effects.bill.loadBill)

  const dispatch = useDispatch<Dispatch>()
  const onCustomersChange = useCallback((customIds: number[]) => {
    dispatch.bill.updateFilter({ customIds })
  }, [dispatch.bill])
  const onReceiversChange = useCallback((receiverIds: number[]) => {
    dispatch.bill.updateFilter({ receiverIds })
  }, [dispatch.bill])
  const onGoodsChange = useCallback((goodsIds: number[]) => {
    dispatch.bill.updateFilter({ goodsIds })
  }, [dispatch.bill])
  const onStartTimeChange = useCallback((value: Dayjs | null) => {
    dispatch.bill.updateFilter({ startTime: dayjs(value!).startOf('d').format('YYYY-MM-DD HH:mm:ss') })
  }, [dispatch.bill])
  const onEndTimeChange = useCallback((value: Dayjs | null) => {
    dispatch.bill.updateFilter({ endTime: dayjs(value!).endOf('d').format('YYYY-MM-DD HH:mm:ss') })
  }, [dispatch.bill])

  const columns: ColumnsType<CheckOut> = useMemo(() => [
    { dataIndex: 'odd', title: '单号' },
    { dataIndex: 'warehouseName', title: '出库仓库' },
    { dataIndex: 'customName', title: '客户/商标' },
    { dataIndex: 'receiverName', title: '收货方/厂家' },
    {
      dataIndex: 'dealTime',
      title: '开单时间',
      render (receivedTime, record) {
        return dayjs(receivedTime).format('YYYY-MM-DD')
      }
    },
    {
      dataIndex: 'paid',
      title: '应收金额',
      render (paid, record) {
        return getCheckOutPriceDisplay(record)
      }
    },
    { dataIndex: 'remark', title: '备注' }
  ], [])

  const goodsColumns: ColumnsType<Goods> = useMemo(() => [
    { dataIndex: 'name', title: '货物名称' },
    { dataIndex: 'brand', title: '商标' },
    { dataIndex: 'size', title: '规格' },
    { dataIndex: 'num', title: '数量' },
    { dataIndex: 'price', title: '单价' },
    { dataIndex: 'reticule', title: '手提袋' },
    { dataIndex: 'shoeCover', title: '鞋套' },
    { dataIndex: 'container', title: '外箱' },
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

  const printable = !!params && !!data.length
  const [isIframeReady, setIframeReady] = useState(false)
  useEffect(() => {
    const onMessage = (e: MessageEvent<boolean>): void => {
      setIframeReady(e.data)
    }
    window.addEventListener('message', onMessage)
    return () => {
      window.removeEventListener('message', onMessage)
    }
  }, [])

  const onSearch = usePersistFn(() => {
    setIframeReady(false)
    dispatch.bill.updateState({ data: [], params: '' })
    if (!filter.customIds.length && !filter.receiverIds.length) {
      return message.error('请选择客户/商标/厂家')
    }
    if (!filter.startTime) {
      return message.error('请选择开始时间')
    }
    if (!filter.endTime) {
      return message.error('请选择结束时间')
    }
    dispatch.bill.loadBill()
  })

  const ref = useRef<HTMLIFrameElement | null>(null)
  const print = useCallback(() => ref.current?.contentWindow?.print(), [])

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <Form labelCol={{ span: 6 }}>
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item label='客户/商标' required>
                <CustomerSelect<number[]> className={styles.select} value={filter.customIds} onChange={onCustomersChange} mode='multiple' allowClear placeholder='请选择客户/商标' />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label='收货方/厂家' required>
                <CustomerSelect<number[]> className={styles.select} value={filter.receiverIds} onChange={onReceiversChange} mode='multiple' allowClear placeholder='请选择收货方/厂家' />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label='货物'>
                <GoodsSelect<number[]> className={styles.select} value={filter.goodsIds} onChange={onGoodsChange} mode='multiple' allowClear placeholder='请选择货物' />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item label='开始时间' required>
                <DatePicker className={styles['date-picker']} value={filter.startTime === null ? null : dayjs(filter.startTime)} onChange={onStartTimeChange} allowClear={false} placeholder='请选择开始时间' />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label='结束时间' required>
                <DatePicker className={styles['date-picker']} value={filter.endTime === null ? null : dayjs(filter.endTime)} onChange={onEndTimeChange} allowClear={false} placeholder='请选择结束时间' />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item>
                <Button className={styles.button} type='primary' onClick={onSearch} loading={loading}>查询</Button>
                <Button className={styles.button} onClick={print} disabled={!printable || !isIframeReady} loading={printable && !isIframeReady}>打印</Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </header>
      <footer className={styles.footer}>
        <ScrollTable<CheckOut> rowKey='id' columns={columns} dataSource={data} loading={loading} expandable={expandable} />
      </footer>
      <iframe className={styles.print} src={`/print/bill?${params}`} ref={ref} />
    </div>
  )
}

export default React.memo(Component)
