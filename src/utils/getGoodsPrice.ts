export interface Goods {
  paid?: number | null
  price: number
  num: number
  discount?: number
}

const getGoodsPrice = ({ paid, price, num, discount }: Goods): number => typeof paid === 'number' ? paid : price * num * (discount || 1)

export const getGoodsPriceDisplay = (goods: Goods): string => getGoodsPrice(goods).toFixed(2)

export default getGoodsPrice
