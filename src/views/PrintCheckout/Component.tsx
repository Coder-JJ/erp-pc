import styles from './index.less'
import React, { useEffect, useMemo, useState } from 'react'
import { useUpdateEffect } from 'ahooks'
import dayjs from 'dayjs'
import { CheckOut, getInitialGoods } from '../../rematch/models/checkOut'
import { getCheckOutPrice } from '../../utils'

export interface Params {
  id?: string
}

const PrintCheckout: React.FC = function() {
  const [data, setData] = useState<CheckOut | undefined>()

  useUpdateEffect(() => {
    if (data) {
      window.print()
      setData(undefined)
    }
  }, [data])

  useEffect(() => {
    const onMessage = (e: MessageEvent<CheckOut>): void => {
      setData(e.data)
    }
    window.addEventListener('message', onMessage)
    window.parent.postMessage(true)
    return () => {
      window.removeEventListener('message', onMessage)
    }
  }, [])

  const date = useMemo(() => data?.dealTime ? dayjs(data.dealTime) : undefined, [data])
  const totalPrice = useMemo(() => data ? getCheckOutPrice(data) : 0, [data])

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div />
        <div className={styles.company}>温州市国骏印刷出库单</div>
        <div className={styles.odd}>No：{ data?.odd }</div>
      </div>
      <div className={styles.caption}>
        <div className={styles.info}>
          { data?.customId !== data?.receiverId && !!data?.customName && <div className={styles.customer}>客户：{ data.customName }</div> }
          { !!data?.receiverName && <div className={styles.receiver}>收货方：{ data.receiverName }</div> }
          { !!data?.receiverPhone && <div className={styles.phone}>联系号码：{ data.receiverPhone }</div> }
          { !!data?.receivedAddress && <div className={styles.address}>收货地址：{ data.receivedAddress }</div> }
        </div>
        <div className={styles.empty} />
        <div className={styles.empty} />
        { /* <div className={styles.phone}>{ data?.receiverPhone && `联系号码：${data.receiverPhone}` }</div> */ }
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
            <th style={{ width: '18mm', minWidth: '18mm' }}>数量</th>
            <th style={{ width: '18mm', minWidth: '18mm' }}>手提袋</th>
            <th style={{ width: '18mm', minWidth: '18mm' }}>外箱</th>
            <th style={{ width: '18mm', minWidth: '18mm' }}>鞋套</th>
            <th style={{ width: '18mm', minWidth: '18mm' }}>单价</th>
            <th style={{ width: '25mm', minWidth: '25mm' }}>金额</th>
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
                  <td>{ goods.reticule || '' }</td>
                  <td>{ goods.container || '' }</td>
                  <td>{ goods.shoeCover || '' }</td>
                  <td>{ goods.price ? `¥${goods.price.toFixed(2)}` : '' }</td>
                  <td>{ goods.price * goods.num ? `¥${(goods.price * goods.num).toFixed(2)}` : '' }</td>
                </tr>
              )
            })
          }
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={6} />
            <td style={{ padding: 0, textAlign: 'right' }}>总计：</td>
            <td>{ totalPrice ? `¥${totalPrice.toFixed(2)}` : '' }</td>
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
          <div style={{ paddingRight: '15mm' }}>收货：</div>
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
