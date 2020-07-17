import styles from './App.less'
import { hot } from 'react-hot-loader/root'
import React, { useCallback, useMemo } from 'react'
import { Switch, Route, useHistory, useLocation, Redirect } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { ConfigProvider, Layout, Menu } from 'antd'
import zhCN from 'antd/es/locale/zh_CN'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import classNames from 'classnames'
import * as pages from './pages'
import { RootState, Dispatch } from './rematch'

export interface MenuType {
  path: string
  name: string
  page: string
  icon: string
}

const { Header, Sider, Content } = Layout

const menus: MenuType[] = [
  { path: '/checkin', name: '入库单', page: 'CheckIn', icon: 'icon-rkd' },
  { path: '/checkout', name: '出库单', page: 'CheckOut', icon: 'icon-ckd' }
]

function App () {
  const { menuCollapsed } = useSelector((store: RootState) => store.app)

  const dispatch = useDispatch<Dispatch>()
  const toggleMenu = useCallback(() => dispatch.app.toggleMenuCollapsed(), [dispatch.app])
  const history = useHistory()
  const onClickMenu = useCallback((path: string) => history.push(path), [history])

  const location = useLocation()
  const menuSelectedKeys = useMemo(() => [location.pathname], [location.pathname])

  return (
    <ConfigProvider locale={zhCN}>
      <Layout className={styles.wrap}>
        <Sider trigger={null} collapsible collapsed={menuCollapsed}>
          <div className={classNames(styles.logo, { [styles.collapsed]: menuCollapsed })}>
            <div>{ !menuCollapsed && '志坚包装' }</div>
          </div>
          <Menu className={styles.menus} theme="dark" mode="inline" selectedKeys={menuSelectedKeys}>
            {
              menus.map(({ path, name, icon }) => {
                const menuIcon = (
                  <span className="anticon">
                    <i className={`iconfont ${icon}`} />
                  </span>
                )
                return <Menu.Item key={path} icon={menuIcon} onClick={() => onClickMenu(path)}>{ name }</Menu.Item>
              })
            }
          </Menu>
        </Sider>
        <Layout className={styles.right}>
          <Header className={styles.header} style={{ padding: 0 }}>
            { menuCollapsed ? <MenuUnfoldOutlined className={styles.trigger} onClick={toggleMenu} /> : <MenuFoldOutlined className={styles.trigger} onClick={toggleMenu} /> }
          </Header>
          <Content className={styles.content}>
            <div className={styles.view}>
              <Switch>
                {
                  menus.map(({ path, page }) => {
                    const Page = (pages as { [key: string]: React.ComponentType<any> })[page]
                    return (
                      <Route key={path} path={path} exact strict sensitive>
                        <Page />
                      </Route>
                    )
                  })
                }
                { !!menus.length && <Redirect from='/' to={menus[0].path} /> }
              </Switch>
            </div>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  )
}

export default hot(App)
