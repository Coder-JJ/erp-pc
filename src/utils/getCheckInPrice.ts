import { CheckIn as CheckInType } from '../rematch/models/checkIn'
import getGoodsPrice, { Goods } from './getGoodsPrice'

export interface CheckIn extends Pick<CheckInType, 'paid' | 'discount'> {
  saveGoodsRecordList: Goods[]
}

const getCheckInPrice = ({ paid, saveGoodsRecordList, discount }: CheckIn): number => paid === null ? saveGoodsRecordList.map(getGoodsPrice).reduce((pv, cv) => pv + cv, 0) * discount : paid

export const getCheckInPriceDisplay = (bill: CheckIn): string => getCheckInPrice(bill).toFixed(2)

export default getCheckInPrice
