import { ReturnGoods as ReturnGoodsType } from '../rematch/models/returnGoods'
import getGoodsPrice, { Goods } from './getGoodsPrice'

export interface ReturnGoods extends Omit<ReturnGoodsType, 'id' | 'customId' | 'customName' | 'cancelPersonId' | 'cancelPersonName' | 'cancelGoodsRecordList'> {
  cancelGoodsRecordList: Goods[]
}

const getReturnGoodsPrice = ({ cancelGoodsRecordList }: ReturnGoods): number => cancelGoodsRecordList.map(getGoodsPrice).reduce((pv, cv) => pv + cv, 0)

export const getReturnGoodsPriceDisplay = (bill: ReturnGoods): string => getReturnGoodsPrice(bill).toFixed(2)

export default getReturnGoodsPrice
