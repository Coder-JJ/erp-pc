import { Models } from '@rematch/core'
import { cache } from './cache'
import { app } from './app'
import { supplier } from './supplier'
import { repository } from './repository'
import { customer } from './customer'
import { goods } from './goods'
import { checkIn } from './checkIn'
import { checkOut } from './checkOut'
import { customerAccount } from './customerAccount'
import { collection } from './collection'
import { returnGoods } from './returnGoods'
import { bill } from './bill'
import { stock } from './stock'

export interface RootModel extends Models<RootModel> {
  cache: typeof cache
  app: typeof app
  supplier: typeof supplier
  repository: typeof repository
  customer: typeof customer
  goods: typeof goods
  checkIn: typeof checkIn
  checkOut: typeof checkOut
  customerAccount: typeof customerAccount
  collection: typeof collection
  returnGoods: typeof returnGoods
  bill: typeof bill
  stock: typeof stock
}

export const models: RootModel = {
  cache,
  app,
  supplier,
  repository,
  customer,
  goods,
  checkIn,
  checkOut,
  customerAccount,
  collection,
  returnGoods,
  bill,
  stock
}
