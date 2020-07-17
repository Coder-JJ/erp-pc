import './index.css'
import './assets/styles/iconfont/iconfont.css'
import 'react-hot-loader'
import 'dayjs/locale/zh-cn'
import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { getPersistor } from 'rematch-immer-combine-persist'
import { PersistGate } from 'redux-persist/integration/react'
import store from './rematch'
import App from './App'
import * as serviceWorker from './serviceWorker'

ReactDOM.render(
  <BrowserRouter>
    <Provider store={store}>
      <PersistGate persistor={getPersistor()}>
        <App />
      </PersistGate>
    </Provider>
  </BrowserRouter>,
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
