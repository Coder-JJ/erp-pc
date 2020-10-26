import { CheckOut as CheckOutType } from '../rematch/models/checkOut'
import getGoodsPrice, { Goods } from './getGoodsPrice'

export interface CheckOut extends Pick<CheckOutType, 'paid' | 'discount'> {
  fetchGoodsRecordList: Goods[]
}

const getCheckOutPrice = ({ paid, fetchGoodsRecordList, discount }: CheckOut): number => paid === null ? fetchGoodsRecordList.map(getGoodsPrice).reduce((pv, cv) => pv + cv, 0) * discount : paid

export const getCheckOutPriceDisplay = (bill: CheckOut): string => (getCheckOutPrice(bill)).toFixed(2)

export default getCheckOutPrice
