import styles from './index.less'
import React, { useMemo } from 'react'
import moment from 'moment'
import { getCheckOutPrice, getReturnGoodsPrice } from '../../utils'
import { CheckOut, CheckOutState, getInitialGoods } from '../../rematch/models/checkOut'
import { ReturnGoods } from '../../rematch/models/returnGoods'
import { Collection } from '../../rematch/models/collection'

export interface Props {
  checkOuts: CheckOut[]
  returnGoods: ReturnGoods[]
  collections: Collection[]
  startDate: moment.Moment
  endDate: moment.Moment
}

export interface GroupedBills {
  customerId: number
  customerName: string
  checkOuts: CheckOut[]
  returnGoods: ReturnGoods[]
  collections: Collection[]
}

const BillPreview: React.FC<Props> = function(props) {
  const { startDate, endDate, checkOuts, returnGoods, collections } = props

  const filteredCheckOuts = useMemo<CheckOut[]>(() => checkOuts.filter(({ state }) => state !== CheckOutState.Canceled), [checkOuts])
  const groupedBills = useMemo<GroupedBills[]>(() => {
    const result: GroupedBills[] = []
    for (const checkOut of filteredCheckOuts) {
      let item = result.find(({ customerId }) => customerId === checkOut.customId)
      if (!item) {
        item = {
          customerId: checkOut.customId!,
          customerName: checkOut.customName,
          checkOuts: [],
          returnGoods: [],
          collections: []
        }
        result.push(item)
      }
      item.checkOuts.push(checkOut)
    }
    for (const record of returnGoods) {
      let item = result.find(({ customerId }) => customerId === record.customId)
      if (!item) {
        item = {
          customerId: record.customId,
          customerName: record.customName,
          checkOuts: [],
          returnGoods: [],
          collections: []
        }
        result.push(item)
      }
      item.returnGoods.push(record)
    }
    for (const record of collections) {
      let item = result.find(({ customerId }) => customerId === record.customId)
      if (item) {
        item.collections.push(record)
      }
    }
    return result
  }, [filteredCheckOuts, returnGoods, collections])

  return (
    <div className={styles.wrap}>
      {
        groupedBills.map(group => {
          const groupTotalBox = group.checkOuts.flatMap(row => row.fetchGoodsRecordList.map(g => g.num)).reduce((pv, cv) => pv + cv, 0)
          const returnBox = group.returnGoods.flatMap(row => row.cancelGoodsRecordList.map(g => g.num)).reduce((pv, cv) => pv + cv, 0)
          const groupTotalPrice = group.checkOuts.map(row => getCheckOutPrice(row)).reduce((pv, cv) => pv + cv, 0)
          const paidPrice = group.collections.map(row => row.collection).reduce((pv, cv) => pv + cv, 0)
          const returnPrice = group.returnGoods.map(row => getReturnGoodsPrice(row)).reduce((pv, cv) => pv + cv, 0)
          const hasPaidOrReturn = !!paidPrice || !!returnPrice
          return (
            <div className={styles.group} key={group.customerId}>
              <header className={styles.caption}>{ group.customerName }{ startDate.format('YYYY-MM-DD') }至{ endDate.format('YYYY-MM-DD') }对账单</header>
              <table>
                <tbody>
                  <tr className={styles.thead}>
                    <td>单号</td>
                    <td>日期</td>
                    <td>厂家</td>
                    <td>货物</td>
                    <td>规格</td>
                    <td>数量</td>
                    <td>手提袋</td>
                    <td>外箱</td>
                    <td>鞋套</td>
                    <td>单价</td>
                    <td>金额</td>
                    <td>备注</td>
                  </tr>
                  {
                    group.checkOuts.map(row => {
                      const rowSpan = row.fetchGoodsRecordList.length || 1
                      const [firstGoods, ...restGoods] = row.fetchGoodsRecordList
                      const totalPrice = getCheckOutPrice(row)
                      return (
                        <React.Fragment key={row.id}>
                          <tr>
                            <td rowSpan={rowSpan}>{ row.odd }</td>
                            <td rowSpan={rowSpan}>{ moment(row.dealTime).format('MM-DD') }</td>
                            <td rowSpan={rowSpan}>{ row.receiverName }</td>
                            {
                              [firstGoods || getInitialGoods()].map(goods => (
                                <React.Fragment key={goods.id || '-1'}>
                                  <td>{ goods.name }</td>
                                  <td>{ goods.size }</td>
                                  <td>{ goods.num }</td>
                                  <td>{ goods.reticule }</td>
                                  <td>{ goods.container }</td>
                                  <td>{ goods.shoeCover }</td>
                                  <td>¥{ goods.price.toFixed(2) }</td>
                                  <td rowSpan={rowSpan}>¥{ totalPrice.toFixed(2) }</td>
                                  <td rowSpan={rowSpan}>{ row.remark || (row.state === CheckOutState.Paid ? '已收款' : '') }</td>
                                </React.Fragment>
                              ))
                            }
                          </tr>
                          {
                            restGoods.map(goods => (
                              <tr key={goods.id}>
                                <td>{ goods.name }</td>
                                <td>{ goods.size }</td>
                                <td>{ goods.num }</td>
                                <td>{ goods.reticule }</td>
                                <td>{ goods.container }</td>
                                <td>{ goods.shoeCover }</td>
                                <td>¥{ goods.price.toFixed(2) }</td>
                              </tr>
                            ))
                          }
                        </React.Fragment>
                      )
                    })
                  }
                  {
                    group.returnGoods.map(row => {
                      const rowSpan = row.cancelGoodsRecordList.length || 1
                      const [firstGoods, ...restGoods] = row.cancelGoodsRecordList
                      const totalPrice = getReturnGoodsPrice(row)
                      return (
                        <React.Fragment key={row.id}>
                          <tr>
                            <td rowSpan={rowSpan}>退货单</td>
                            <td rowSpan={rowSpan}>{ moment(row.cancelTime).format('MM-DD') }</td>
                            <td rowSpan={rowSpan}>{ row.cancelPersonName }</td>
                            {
                              [firstGoods || getInitialGoods()].map(goods => (
                                <React.Fragment key={goods.id || '-1'}>
                                  <td>{ goods.name }</td>
                                  <td>{ goods.size }</td>
                                  <td>{ goods.num }</td>
                                  <td>{ goods.reticule }</td>
                                  <td>{ goods.container }</td>
                                  <td>{ goods.shoeCover }</td>
                                  <td>¥{ goods.price.toFixed(2) }</td>
                                  <td rowSpan={rowSpan}>¥{ totalPrice.toFixed(2) }</td>
                                  <td rowSpan={rowSpan}>{ row.remark || '退货' }</td>
                                </React.Fragment>
                              ))
                            }
                          </tr>
                          {
                            restGoods.map(goods => (
                              <tr key={goods.id}>
                                <td>{ goods.name }</td>
                                <td>{ goods.size }</td>
                                <td>{ goods.num }</td>
                                <td>{ goods.reticule }</td>
                                <td>{ goods.container }</td>
                                <td>{ goods.shoeCover }</td>
                                <td>¥{ goods.price.toFixed(2) }</td>
                              </tr>
                            ))
                          }
                        </React.Fragment>
                      )
                    })
                  }
                  <tr>
                    <td className={styles.footer} colSpan={12}>
                      共 <b>{ group.checkOuts.length }</b> 张回单
                      {
                        !!group.returnGoods.length && (
                          <>，<b>{ group.returnGoods.length }</b> 张退货单</>
                        )
                      }
                      ，鞋盒总数量：<b>{ Math.max(groupTotalBox - returnBox, 0) }</b>个
                    </td>
                  </tr>
                  <tr>
                    <td className={styles.footer} colSpan={12}>
                      总金额：<b>¥{ groupTotalPrice.toFixed(2) }</b>
                      {
                        !!paidPrice && (
                          <>，已付金额：<b>¥{ paidPrice.toFixed(2) }</b></>
                        )
                      }
                      {
                        !!returnPrice && (
                          <>，退款金额：<b>¥{ returnPrice.toFixed(2) }</b></>
                        )
                      }
                      {
                        hasPaidOrReturn && (
                          <>，待付金额：<b>¥{ (Math.max(groupTotalPrice - paidPrice - returnPrice, 0)).toFixed(2) }</b></>
                        )
                      }
                    </td>
                  </tr>
                  <tr>
                    <td className={styles.footer} colSpan={12}>温州市国骏印刷有限公司，{ moment().format('YYYY-MM-DD') }</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )
        })
      }
    </div>
  )
}

export default React.memo(BillPreview)
