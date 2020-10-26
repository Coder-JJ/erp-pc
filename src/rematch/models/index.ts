import { cache } from './cache'
import { app } from './app'
import { supplier } from './supplier'
import { repository } from './repository'
import { customer } from './customer'
import { goods } from './goods'
import { checkIn } from './checkIn'
import { checkOut } from './checkOut'
import { stock } from './stock'

export interface RootModel {
  cache: typeof cache
  app: typeof app
  supplier: typeof supplier
  repository: typeof repository
  customer: typeof customer
  goods: typeof goods
  checkIn: typeof checkIn
  checkOut: typeof checkOut
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
  stock
}
