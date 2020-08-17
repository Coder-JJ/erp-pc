import styles from './App.less'
import { hot } from 'react-hot-loader/root'
import React, { useCallback, useMemo, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Switch, Route, useHistory, useLocation, Redirect } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { ConfigProvider, Layout, Menu } from 'antd'
import { MenuProps } from 'antd/lib/menu'
import zhCN from 'antd/es/locale/zh_CN'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import classNames from 'classnames'
import * as pages from './pages'
import { RootState, Dispatch } from './rematch'
import AppContext, { ContextType } from './AppContext'

export interface MenuItem {
  key: string
  name: string
  page: string
  icon?: string
}

export interface MenuFolder {
  key: string
  name: string
  icon: string
  children: (MenuFolder | MenuItem)[]
}

export type MenuType = MenuFolder | MenuItem

export interface RouteType {
  path: string
  page: string
}

const { Header, Sider, Content } = Layout

const Pages = pages as { [key: string]: React.ComponentType<any> }

const menus: MenuType[] = [
  {
    key: 'data',
    name: '资料管理',
    icon: 'icon-navicon-zdgl',
    children: [
      { key: 'supplier', name: '供应商', icon: 'icon-navicon-gysda', page: 'Supplier' },
      { key: 'repository', name: '仓库', icon: 'icon-navicon-ckdasz', page: 'Repository' },
      { key: 'stock', name: '库存分类', icon: 'icon-navicon-kcfl', page: 'Stock' }
    ]
  },
  { key: 'checkin', name: '入库单', page: 'CheckIn', icon: 'icon-rkd' },
  { key: 'checkout', name: '出库单', page: 'CheckOut', icon: 'icon-ckd' }
]

const isMenuFolder = (menu: MenuType): menu is MenuFolder => {
  return (menu as MenuFolder).children !== undefined
}

const isMenuItem = (menu: MenuType): menu is MenuItem => {
  return (menu as MenuItem).page !== undefined
}

const getOpenedMenusBySelectedMenu = (menus: MenuType[], pathname: string, prefixPath: string = ''): string[] | undefined => {
  for (const menu of menus) {
    const path = `${prefixPath}/${menu.key}`
    if (isMenuItem(menu) && path === pathname && prefixPath) {
      return [prefixPath]
    } else if (isMenuFolder(menu) && menu.children.length) {
      const result = getOpenedMenusBySelectedMenu(menu.children, pathname, path)
      if (result && result.length) {
        return prefixPath ? [prefixPath, ...result] : result
      }
    }
  }
}

const getRoutesFromMenus = (menus: MenuType[], prefixPath: string = ''): RouteType[] => {
  const routes: RouteType[] = []
  for (const menu of menus) {
    const path = `${prefixPath}/${menu.key}`
    if (isMenuFolder(menu) && menu.children.length) {
      routes.push(...getRoutesFromMenus(menu.children, path))
    } else if (isMenuItem(menu)) {
      routes.push({ path, page: menu.page })
    }
  }
  return routes
}

function App (): React.ReactElement {
  const { menuCollapsed } = useSelector((store: RootState) => store.app)

  const dispatch = useDispatch<Dispatch>()
  const toggleMenu = useCallback(() => dispatch.app.toggleMenuCollapsed(), [dispatch.app])

  const history = useHistory()
  const location = useLocation()
  const menuSelectedKeys = useMemo(() => [location.pathname], [location.pathname])
  const [menuOpenedKeys, setMenuOpenedKeys] = useState(getOpenedMenusBySelectedMenu(menus, location.pathname) || [])
  useEffect(() => {
    const nextMenuOpenedKeys = getOpenedMenusBySelectedMenu(menus, location.pathname) || []
    if (nextMenuOpenedKeys.length) {
      setMenuOpenedKeys(nextMenuOpenedKeys)
    }
  }, [location.pathname])
  const menuProps = useMemo<MenuProps>(() => menuCollapsed ? {} : { openKeys: menuOpenedKeys, onOpenChange: setMenuOpenedKeys }, [menuCollapsed, menuOpenedKeys])
  const onClickMenu = useCallback((path: string) => history.push(path), [history])
  const renderMenus = useCallback((menus: MenuType[], prefixPath: string = '') => {
    return menus.map(menu => {
      const { key, name, icon } = menu
      const path = `${prefixPath}/${key}`
      let menuIcon: JSX.Element | null = null
      if (icon) {
        menuIcon = (
          <span className='anticon'>
            <i className={`iconfont ${icon}`} />
          </span>
        )
      }
      if (isMenuFolder(menu) && menu.children.length) {
        return <Menu.SubMenu key={path} icon={menuIcon} title={name}>{ renderMenus(menu.children, path) }</Menu.SubMenu>
      }
      return <Menu.Item key={path} icon={menuIcon} onClick={() => onClickMenu(path)}>{ name }</Menu.Item>
    })
  }, [onClickMenu])

  const routes = useMemo(() => getRoutesFromMenus(menus), [])

  const [isFooterVisible, setFooterVisible] = useState(false)
  const [footerRef, setFooterRef] = useState<HTMLDivElement | null>(null)
  const refCallback = useCallback((node: HTMLDivElement | null) => setFooterRef(node), [])
  const appContextValue = useMemo<ContextType>(() => ({
    showFooter () {
      setFooterVisible(true)
    },
    hideFooter () {
      setFooterVisible(false)
    },
    renderFooter (node) {
      return footerRef ? createPortal(node, footerRef) : null
    }
  }), [footerRef])

  return (
    <ConfigProvider locale={zhCN} prefixCls='ant'>
      <AppContext.Provider value={appContextValue}>
        <Layout className={styles.wrap}>
          <Sider trigger={null} collapsible collapsed={menuCollapsed}>
            <div className={classNames(styles.logo, { [styles.collapsed]: menuCollapsed })}>
              <div>{ !menuCollapsed && '志坚包装' }</div>
            </div>
            <Menu className={styles.menus} {...menuProps} selectedKeys={menuSelectedKeys} mode='inline' theme='dark'>
              {
                renderMenus(menus)
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
                    routes.map(({ path, page }) => {
                      const Page = Pages[page]
                      return (
                        <Route key={path} path={path} exact strict sensitive>
                          <Page />
                        </Route>
                      )
                    })
                  }
                  { !!routes.length && <Redirect from='*' to={routes[0].path} /> }
                </Switch>
              </div>
            </Content>
            { isFooterVisible && <div className={styles.footer} ref={refCallback} /> }
          </Layout>
        </Layout>
      </AppContext.Provider>
    </ConfigProvider>
  )
}

export default hot(App)
