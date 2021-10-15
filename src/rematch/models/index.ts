import { Models } from '@rematch/core'
import { cache } from './cache'
import { app } from './app'
import { supplier } from './supplier'
import { repository } from './repository'
import { customer } from './customer'
import { goods } from './goods'
import { checkIn } from './checkIn'
import { checkOut } from './checkOut'
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
  bill,
  stock
}
