import styles from './index.less'
import React, { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router'
import dayjs from 'dayjs'
import qs from 'qs'
import { CheckOut, getInitialGoods, loadCheckOut } from '../../rematch/models/checkOut'
import { getCheckOutPrice } from '../../utils'

export interface Params {
  id?: string
}

const PrintCheckout: React.FC = function () {
  const [data, setData] = useState<CheckOut | undefined>()
  const location = useLocation()
  const params = useMemo<Params>(() => qs.parse(location.search, { ignoreQueryPrefix: true }) as any, [location.search])
  useEffect(() => {
    window.parent.postMessage(false)
    if (params.id) {
      loadCheckOut(params.id).then(data => {
        setData(data)
        window.parent.postMessage(true)
      })
    }
  }, [params.id])

  const date = useMemo(() => data?.dealTime ? dayjs(data.dealTime) : undefined, [data])
  const totalPrice = useMemo(() => data ? getCheckOutPrice(data) : 0, [data])

  return (
    <div className={styles.wrap}>
      <div className={styles.odd}>No：{ data?.odd }</div>
      <div className={styles.company}>国骏印刷出库单</div>
      <div className={styles.caption}>
        <div className={styles.receiver}>收货方：{ data?.receiverName || data?.customName }</div>
        { !!data?.receiverPhone && <div className={styles.phone}>手机号：{ data?.receiverPhone }</div> }
        <div className={styles.date}>
          <span className={styles.year}>{ date?.format('YYYY') }</span>
          <span className={styles.month}>{ date?.format('MM') }</span>
          <span className={styles.day}>{ date?.format('DD') }</span>
        </div>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th style={{ width: '30mm', minWidth: '30mm' }}>货物</th>
            <th style={{ width: '30mm', minWidth: '30mm' }}>规格</th>
            <th style={{ width: '20mm', minWidth: '20mm' }}>数量</th>
            <th style={{ width: '20mm', minWidth: '20mm' }}>鞋套</th>
            <th style={{ width: '20mm', minWidth: '20mm' }}>手提袋</th>
            <th style={{ width: '20mm', minWidth: '20mm' }}>外箱</th>
            <th style={{ width: '20mm', minWidth: '20mm' }}>单价</th>
            <th style={{ width: '30mm', minWidth: '30mm' }}>金额</th>
          </tr>
        </thead>
        <tbody>
          {
            ([
              ...(data?.fetchGoodsRecordList || []),
              ...Array(5).fill(0).map((_, i) => ({ ...getInitialGoods(), id: -(i + 1), name: '', size: '' }))
            ]).slice(0, 5).map(goods => {
              return (
                <tr key={goods.id}>
                  <td>{ goods.name }</td>
                  <td>{ goods.size }</td>
                  <td>{ goods.num || '' }</td>
                  <td>{ goods.shoeCover || '' }</td>
                  <td>{ goods.reticule || '' }</td>
                  <td>{ goods.container || '' }</td>
                  <td>{ goods.price ? `${goods.price.toFixed(2)}¥` : '' }</td>
                  <td>{ goods.price * goods.num ? `${(goods.price * goods.num).toFixed(2)}¥` : '' }</td>
                </tr>
              )
            })
          }
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={6} />
            <td style={{ padding: 0, textAlign: 'right' }}>总计：</td>
            <td>{ totalPrice ? `${totalPrice.toFixed(2)}¥` : '' }</td>
          </tr>
          <tr>
            <td colSpan={3}>手机/支付宝：13777762887 周雪梅</td>
            <td colSpan={5} style={{ textAlign: 'right' }}>农行：62284 8033 84552 02279 周雪梅</td>
          </tr>
        </tfoot>
      </table>
      <div className={styles.footer}>
        <div className={styles.tr}>
          <div>开单：周旭旭</div>
          <div>审核：吴献忠</div>
          <div style={{ paddingRight: '16mm' }}>收货：</div>
        </div>
        <div className={styles.tr}>
          <div>①会计（红色）</div>
          <div>②存根（白色）</div>
          <div>③客户（黄色）</div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(PrintCheckout)