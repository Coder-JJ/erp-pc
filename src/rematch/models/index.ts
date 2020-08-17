import { app } from './app'
import { supplier } from './supplier'

export interface RootModel {
  app: typeof app
  supplier: typeof supplier
}

export const models: RootModel = {
  app,
  supplier
}
