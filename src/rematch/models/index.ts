import { app } from './app'

export interface RootModel {
	app: typeof app
}

export const models: RootModel = {
  app
}
