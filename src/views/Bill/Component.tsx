import styles from './index.less'
import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Form, Button, Row, Col, message, Space } from 'antd'
import { usePersistFn } from 'ahooks'
import dayjs, { Dayjs } from 'dayjs'
import { RootState, Dispatch } from '../../rematch'
import { CustomerSelect, GoodsSelect, DatePicker } from '../../components'
import BillPreview from '../../components/BillPreview'
import exportExcelHandler from './exportExcel'

const Component: React.FC = function () {
  const { filter, data, params } = useSelector((store: RootState) => store.bill)
  const loading = useSelector((store: RootState) => store.loading.effects.bill.loadBill)
  const startDate = useMemo(() => dayjs(filter.startTime), [filter.startTime])
  const endDate = useMemo(() => dayjs(filter.endTime), [filter.endTime])

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
  const setCurrentMonth = useCallback(() => {
    dispatch.bill.updateFilter({
      startTime: dayjs().startOf('M').startOf('d').format('YYYY-MM-DD HH:mm:ss'),
      endTime: dayjs().endOf('M').endOf('d').format('YYYY-MM-DD HH:mm:ss')
    })
  }, [dispatch.bill])
  const setPrevMonth = useCallback(() => {
    dispatch.bill.updateFilter({
      startTime: dayjs().subtract(1, 'M').startOf('M').startOf('d').format('YYYY-MM-DD HH:mm:ss'),
      endTime: dayjs().subtract(1, 'M').endOf('M').endOf('d').format('YYYY-MM-DD HH:mm:ss')
    })
  }, [dispatch.bill])

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

  const exportExcel = usePersistFn(() => {
    exportExcelHandler()
  })

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
                <DatePicker className={styles['date-picker']} value={startDate} onChange={onStartTimeChange} allowClear={false} placeholder='请选择开始时间' />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label='结束时间' required>
                <DatePicker className={styles['date-picker']} value={endDate} onChange={onEndTimeChange} allowClear={false} placeholder='请选择结束时间' />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item>
                <Space>
                  <Button onClick={setCurrentMonth}>本月</Button>
                  <Button onClick={setPrevMonth}>上月</Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col className={styles.center} span={24}>
              <Space size='large'>
                <Button type='primary' onClick={onSearch} loading={loading}>查询</Button>
                <Button onClick={print} disabled={!printable || !isIframeReady} loading={printable && !isIframeReady}>打印</Button>
                <Button disabled={!data.length} loading={loading} onClick={exportExcel}>导出</Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </header>
      <footer className={styles.footer}>
        <BillPreview checkOuts={data} startDate={startDate} endDate={endDate} />
      </footer>
      <iframe className={styles.print} src={`/print/bill?${params}`} ref={ref} />
    </div>
  )
}

export default React.memo(Component)
