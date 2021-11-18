import styles from './index.less'
import React, { useMemo } from 'react'
import dayjs, { Dayjs } from 'dayjs'
import { getCheckOutPrice } from '../../utils'
import { CheckOut, CheckOutState, getInitialGoods } from '../../rematch/models/checkOut'

export interface Props {
  checkOuts: CheckOut[]
  startDate: Dayjs
  endDate: Dayjs
}

export interface GroupedCheckOuts {
  receiverId: number
  receiverName: string
  checkOuts: CheckOut[]
}

const BillPreview: React.FC<Props> = function (props) {
  const { startDate, endDate, checkOuts } = props

  const filteredCheckOuts = useMemo<CheckOut[]>(() => checkOuts.filter(({ state }) => state !== CheckOutState.Canceled), [checkOuts])
  const groupedCheckOuts = useMemo<GroupedCheckOuts[]>(() => {
    const result: GroupedCheckOuts[] = []
    for (const checkOut of filteredCheckOuts) {
      let item = result.find(({ receiverId }) => receiverId === checkOut.receiverId)
      if (!item) {
        item = {
          receiverId: checkOut.receiverId!,
          receiverName: checkOut.receiverName,
          checkOuts: []
        }
        result.push(item)
      }
      item.checkOuts.push(checkOut)
    }
    return result
  }, [filteredCheckOuts])

  return (
    <div className={styles.wrap}>
      {
        groupedCheckOuts.map(group => (
          <div className={styles.group} key={group.receiverId}>
            <header className={styles.caption}>{ group.receiverName }{ startDate.format('YYYY-MM-DD') }至{ endDate.format('YYYY-MM-DD') }对账单</header>
            <table>
              <tbody>
                <tr>
                  <td>单号</td>
                  <td>日期</td>
                  <td>商标/客户</td>
                  <td>厂家</td>
                  <td>货物</td>
                  <td>规格</td>
                  <td>鞋盒</td>
                  <td>鞋套</td>
                  <td>手提袋</td>
                  <td>外箱</td>
                  <td>单价</td>
                  <td>金额</td>
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
                          <td rowSpan={rowSpan}>{ dayjs(row.dealTime).format('MM-DD') }</td>
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
                                <td>¥{ goods.price.toFixed(2) }</td>
                                <td rowSpan={rowSpan}>¥{ totalPrice.toFixed(2) }</td>
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
                  <td className={styles.footer} colSpan={12}>共<b>{ group.checkOuts.length }</b>张回单，总金额：<b>¥{ group.checkOuts.map(row => getCheckOutPrice(row)).reduce((pv, cv) => pv + cv, 0).toFixed(2) }</b></td>
                </tr>
                <tr>
                  <td className={styles.footer} colSpan={12}>温州市国骏印刷有限公司，{ dayjs().format('YYYY-MM-DD') }</td>
                </tr>
              </tbody>
            </table>
          </div>
        ))
      }
    </div>
  )
}

export default React.memo(BillPreview)
