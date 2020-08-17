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

// (window as any).__webpack_public_path__ = (window as any).__INJECTED_PUBLIC_PATH_BY_QIANKUN__

if (!(window as any).__POWERED_BY_QIANKUN__) {
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
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()

/**
 * bootstrap 只会在微应用初始化的时候调用一次，下次微应用重新进入时会直接调用 mount 钩子，不会再重复触发 bootstrap。
 * 通常我们可以在这里做一些全局变量的初始化，比如不会在 unmount 阶段被销毁的应用级别的缓存等。
 */
export function bootstrap (): void {
  // console.log('react app bootstraped')
}

/**
 * 应用每次进入都会调用 mount 方法，通常我们在这里触发应用的渲染方法
 */
export function mount (): void {
  ReactDOM.render(
    <BrowserRouter basename='/micro2'>
      <Provider store={store}>
        <PersistGate persistor={getPersistor()}>
          <App />
        </PersistGate>
      </Provider>
    </BrowserRouter>,
    document.getElementById('root')
  )
}

/**
 * 应用每次 切出/卸载 会调用的方法，通常在这里我们会卸载微应用的应用实例
 */
export function unmount (): void {
  ReactDOM.unmountComponentAtNode(document.getElementById('root')!)
}

/**
 * 可选生命周期钩子，仅使用 loadMicroApp 方式加载微应用时生效
 */
export function update (): void {
  // console.log('update props')
}
