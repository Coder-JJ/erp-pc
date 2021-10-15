import styles from './index.less'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import { usePersistFn } from 'ahooks'
import dayjs from 'dayjs'
import qs from 'qs'
import { getCheckOutPrice } from '../../utils'
import { useCustomers, useSelector } from '../../hooks'
import { loadBill, PrintRouteParams } from '../../rematch/models/bill'
import { CheckOut, getInitialGoods } from '../../rematch/models/checkOut'

const PrintBill: React.FC = function () {
  const location = useLocation()
  const params = useMemo(() => location.search.slice(1), [location.search])
  const paramsObj = useMemo<PrintRouteParams>(() => qs.parse(params) as any, [params])

  const isDataReady = useRef(false)
  const [data, setData] = useState<CheckOut[]>([])
  const { didMount, shouldUpdate } = useSelector(store => store.customer)

  const postMessage = usePersistFn(() => {
    if (isDataReady.current && didMount && !shouldUpdate) {
      window.parent.postMessage(true)
    }
  })

  useEffect(() => {
    isDataReady.current = false
    window.parent.postMessage(false)
    if (params) {
      loadBill(params).then(data => {
        setData(data)
        isDataReady.current = true
        postMessage()
      })
    }
  }, [params, postMessage])

  const [customers] = useCustomers()
  const targetName = useMemo(() => {
    if (!customers.length) {
      return ''
    }
    if (paramsObj.receiverIds) {
      return paramsObj.receiverIds.split(',').map(id => customers.find(c => c.id === Number(id))?.name || '').join('、')
    } else if (paramsObj.customIds) {
      return paramsObj.customIds.split(',').map(id => customers.find(c => c.id === Number(id))?.name || '').join('、')
    }
    return ''
  }, [paramsObj, customers])

  useEffect(() => {
    if (didMount && !shouldUpdate) {
      postMessage()
    }
  }, [didMount, shouldUpdate, postMessage])

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>{ targetName }{ paramsObj.startTime }至{ paramsObj.endTime }对账单</header>
      <table>
        <tbody>
          <tr>
            <td>单号</td>
            <td>日期</td>
            <td>商标/客户</td>
            <td>厂家</td>
            <td>货物</td>
            <td>规格</td>
            <td>数量</td>
            <td>鞋套</td>
            <td>手提袋</td>
            <td>外箱</td>
            <td>单价</td>
            <td>金额</td>
            <td>备注</td>
          </tr>
          {
            data.map(row => {
              const rowSpan = row.fetchGoodsRecordList.length || 1
              const [firstGoods, ...restGoods] = row.fetchGoodsRecordList
              const totalPrice = getCheckOutPrice(row)
              return (
                <React.Fragment key={row.id}>
                  <tr>
                    <td rowSpan={rowSpan}>{ row.odd }</td>
                    <td rowSpan={rowSpan}>{ dayjs(row.dealTime).format('YYYY-MM-DD') }</td>
                    <td rowSpan={rowSpan}>{ row.customName }</td>
                    <td rowSpan={rowSpan}>{ row.receiverName }</td>
                    {
                      [firstGoods || getInitialGoods()].map(goods => (
                        <React.Fragment key={goods.id || '-1'}>
                          <td>{ goods.name }</td>
                          <td>{ goods.size }</td>
                          <td>{ goods.num }</td>
                          <td>{ goods.shoeCover }</td>
                          <td>{ goods.reticule }</td>
                          <td>{ goods.container }</td>
                          <td>{ goods.price.toFixed(2) }¥</td>
                          <td rowSpan={rowSpan}>{ totalPrice.toFixed(2) }¥</td>
                        </React.Fragment>
                      ))
                    }
                    <td rowSpan={rowSpan}>{ row.remark }</td>
                  </tr>
                  {
                    restGoods.map(goods => (
                      <tr key={goods.id}>
                        <td>{ goods.name }</td>
                        <td>{ goods.size }</td>
                        <td>{ goods.num }</td>
                        <td>{ goods.shoeCover }</td>
                        <td>{ goods.reticule }</td>
                        <td>{ goods.container }</td>
                        <td>{ goods.price.toFixed(2) }¥</td>
                      </tr>
                    ))
                  }
                </React.Fragment>
              )
            })
          }
          <tr>
            <td className={styles.footer} colSpan={13}>共<b>{ data.length }</b>张回单，总金额：<b>{ data.map(row => getCheckOutPrice(row)).reduce((pv, cv) => pv + cv, 0).toFixed(2) }¥</b></td>
          </tr>
          <tr>
            <td className={styles.footer} colSpan={13}>温州市国骏印刷有限公司，{ dayjs().format('YYYY-MM-DD') }</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default React.memo(PrintBill)
