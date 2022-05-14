import styles from './index.less'
import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Form, Button, Row, Col, message, Space, Switch, DatePicker } from 'antd'
import { useMount, usePersistFn } from 'ahooks'
import moment from 'moment'
import { RootState, Dispatch } from '../../rematch'
import { SearchMode } from '../../rematch/models/bill'
import { CustomerSelect, GoodsSelect } from '../../components'
import BillPreview from '../../components/BillPreview'
import exportExcelHandler from './exportExcel'

const Component: React.FC = function() {
  const { shouldUpdate, displayFilter, searchMode, exceptCustomers, checkOuts, returnGoods, collections, filter } = useSelector((store: RootState) => store.bill)
  const loading = useSelector((store: RootState) => store.loading.effects.bill.loadBill)
  const startDate = useMemo(() => moment(displayFilter.startTime), [displayFilter.startTime])
  const endDate = useMemo(() => moment(displayFilter.endTime), [displayFilter.endTime])

  const dispatch = useDispatch<Dispatch>()
  useMount(() => {
    if (filter && shouldUpdate) {
      dispatch.bill.updateBill()
    }
  })

  const onCustomersChange = useCallback((customIds: number[]) => {
    dispatch.bill.updateFilter({ customIds })
  }, [dispatch.bill])
  const onSearchModeChange = useCallback((checked: boolean) => {
    dispatch.bill.updateState({ searchMode: checked ? SearchMode.All : SearchMode.Normal })
  }, [dispatch.bill])
  const onExceptCustomersChange = useCallback((exceptCustomers: number[]) => {
    dispatch.bill.updateState({ exceptCustomers })
  }, [dispatch.bill])
  const onReceiversChange = useCallback((receiverIds: number[]) => {
    dispatch.bill.updateFilter({ receiverIds })
  }, [dispatch.bill])
  const onGoodsChange = useCallback((goodsIds: number[]) => {
    dispatch.bill.updateFilter({ goodsIds })
  }, [dispatch.bill])
  const onStartTimeChange = useCallback((value: moment.Moment | null) => {
    dispatch.bill.updateFilter({ startTime: moment(value).startOf('d').format('YYYY-MM-DD HH:mm:ss') })
  }, [dispatch.bill])
  const onEndTimeChange = useCallback((value: moment.Moment | null) => {
    dispatch.bill.updateFilter({ endTime: moment(value).endOf('d').format('YYYY-MM-DD HH:mm:ss') })
  }, [dispatch.bill])
  const setCurrentMonth = useCallback(() => {
    dispatch.bill.updateFilter({
      startTime: moment().startOf('M').startOf('d').format('YYYY-MM-DD HH:mm:ss'),
      endTime: moment().endOf('M').endOf('d').format('YYYY-MM-DD HH:mm:ss')
    })
  }, [dispatch.bill])
  const setPrevMonth = useCallback(() => {
    dispatch.bill.updateFilter({
      startTime: moment().subtract(1, 'M').startOf('M').startOf('d').format('YYYY-MM-DD HH:mm:ss'),
      endTime: moment().subtract(1, 'M').endOf('M').endOf('d').format('YYYY-MM-DD HH:mm:ss')
    })
  }, [dispatch.bill])

  const hasData = !!checkOuts.length || !!returnGoods.length || !!collections.length
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

  const print = usePersistFn(() => {
    ref.current?.contentWindow?.postMessage({ checkOuts, returnGoods, collections, filter })
  })

  const onSearch = usePersistFn(() => {
    dispatch.bill.updateState({ checkOuts: [], returnGoods: [], collections: [], filter: undefined })
    if (searchMode === SearchMode.Normal && !displayFilter.customIds.length && !displayFilter.receiverIds.length && !displayFilter.goodsIds.length) {
      return message.error('请选择客户/厂家/货物')
    }
    if (!displayFilter.startTime) {
      return message.error('请选择开始时间')
    }
    if (!displayFilter.endTime) {
      return message.error('请选择结束时间')
    }
    dispatch.bill.loadBill()
  })
  const onReset = useCallback(() => {
    dispatch.bill.resetState()
  }, [dispatch.bill])

  const exportExcel = usePersistFn(() => {
    exportExcelHandler()
  })

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <Form labelCol={{ span: 6 }}>
          <Row gutter={24} align='middle'>
            <Col span={8}>
              <Form.Item label='客户/商标' required>
                <CustomerSelect<number[]> className={styles.select} value={displayFilter.customIds} onChange={onCustomersChange} mode='multiple' maxTagCount={5} disabled={searchMode === SearchMode.All} allowClear placeholder='请选择客户/商标' />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item>
                <div className={styles.except}>
                  <Switch className={styles.switch} checked={searchMode === SearchMode.All} onChange={onSearchModeChange} checkedChildren='全选' unCheckedChildren='全选' />
                  {
                    searchMode === SearchMode.All && (
                      <>
                        <div className={styles.label}>除</div>
                        <CustomerSelect<number[]> value={exceptCustomers} onChange={onExceptCustomersChange} mode='multiple' allowClear placeholder='请选择客户/商标' />
                        <div>外</div>
                      </>
                    )
                  }
                </div>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item label='收货方/厂家' required>
                <CustomerSelect<number[]> className={styles.select} value={displayFilter.receiverIds} onChange={onReceiversChange} mode='multiple' allowClear placeholder='请选择收货方/厂家' />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label='货物'>
                <GoodsSelect<number[]> className={styles.select} value={displayFilter.goodsIds} onChange={onGoodsChange} mode='multiple' autoClearSearchValue={false} allowClear placeholder='请选择货物' />
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
                <Button onClick={onReset}>重置</Button>
                <Button onClick={print} disabled={!hasData || !isIframeReady} loading={hasData && !isIframeReady}>打印</Button>
                <Button disabled={!hasData} loading={loading} onClick={exportExcel}>导出</Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </header>
      <footer className={styles.footer}>
        <BillPreview checkOuts={checkOuts} returnGoods={returnGoods} collections={collections} startDate={startDate} endDate={endDate} />
      </footer>
      <iframe className={styles.print} src='/print/bill' ref={ref} />
    </div>
  )
}

export default React.memo(Component)
