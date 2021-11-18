import styles from './Layout.less'
import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Switch, Route, useHistory, useLocation, Redirect, RouteProps } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { OpenEventHandler } from 'rc-menu/lib/interface'
import { ConfigProvider, Layout, Menu } from 'antd'
import { MenuProps } from 'antd/lib/menu'
import zhCN from 'antd/lib/locale/zh_CN'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import classNames from 'classnames'
import views from './views'
import LoginModal from './views/Login/LoginModal'
import { RootState, Dispatch } from './rematch'
import LayoutContext, { ContextType } from './LayoutContext'
import { LoginStatus } from './rematch/models/app'

export type CustomRouteProps = Pick<RouteProps, 'exact' | 'sensitive' | 'strict'>

export interface MenuItem {
  key: string
  name: string
  view: string
  icon?: string
  routeProps?: CustomRouteProps
}

export interface MenuFolder {
  key: string
  name: string
  icon: string
  children: (MenuFolder | MenuItem)[]
}

export type MenuType = MenuFolder | MenuItem

export interface RouteType extends CustomRouteProps {
  path: string
  view: string
}

dayjs.locale('zh-cn')

const { Header, Sider, Content } = Layout

const headerStyle: React.CSSProperties = {
  padding: '0 24px 0 0'
}

const menus: MenuType[] = [
  {
    key: 'data',
    name: '资料管理',
    icon: 'icon-zdgl',
    children: [
      { key: 'supplier', name: '供应商', view: 'Supplier', icon: 'icon-gysda' },
      { key: 'customer', name: '客户', view: 'Customer', icon: 'icon-gysda' },
      { key: 'repository', name: '仓库', view: 'Repository', icon: 'icon-ckdasz' },
      { key: 'goods', name: '货物', view: 'Goods', icon: 'icon-chdasz' }
    ]
  },
  { key: 'checkin', name: '入库登记', view: 'CheckIn', icon: 'icon-rkd' },
  { key: 'checkout', name: '出库登记', view: 'CheckOut', icon: 'icon-ckd' },
  { key: 'bill', name: '账单查询', view: 'Bill', icon: 'icon-kcpd' },
  { key: 'stock', name: '查看库存', view: 'Stock', icon: 'icon-kcpd' }
]

const isMenuFolder = (menu: MenuType): menu is MenuFolder => {
  return (menu as MenuFolder).children !== undefined
}

const isMenuItem = (menu: MenuType): menu is MenuItem => {
  return (menu as MenuItem).view !== undefined
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
      routes.push({ path, view: menu.view, ...(menu.routeProps || {}) })
    }
  }
  return routes
}

// const getPopupContainer: (triggerNode: HTMLElement) => HTMLElement = triggerNode => triggerNode?.parentElement || document.body

function AppLayout (): React.ReactElement {
  const { loginStatus, menuCollapsed } = useSelector((store: RootState) => store.app)

  const didMount = useRef(false)
  const dispatch = useDispatch<Dispatch>()
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true
      if (loginStatus === LoginStatus.LoginTimeout) {
        dispatch.app.updateState({ loginStatus: LoginStatus.NotLogin })
      }
    }
  }, [loginStatus, dispatch.app])

  const toggleMenu = useCallback(() => dispatch.app.toggleMenuCollapsed(), [dispatch.app])

  const history = useHistory()
  const location = useLocation()
  const menuSelectedKeys = useMemo(() => [location.pathname], [location.pathname])
  const [menuOpenedKeys, setMenuOpenedKeys] = useState(getOpenedMenusBySelectedMenu(menus, location.pathname) || [])
  const onMenuOpenChange: OpenEventHandler = useCallback(keys => setMenuOpenedKeys(keys as string[]), [])
  useEffect(() => {
    const nextMenuOpenedKeys = getOpenedMenusBySelectedMenu(menus, location.pathname) || []
    if (nextMenuOpenedKeys.length) {
      setMenuOpenedKeys(nextMenuOpenedKeys)
    }
  }, [location.pathname])
  const menuProps = useMemo<MenuProps>(() => menuCollapsed ? {} : { openKeys: menuOpenedKeys, onOpenChange: onMenuOpenChange }, [menuCollapsed, menuOpenedKeys, onMenuOpenChange])
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
  const layoutContextValue = useMemo<ContextType>(() => ({
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

  const logout = useCallback(async () => {
    await dispatch.app.logout()
    history.push('/login')
  }, [dispatch.app, history])

  return (
    <ConfigProvider locale={zhCN} prefixCls='ant'>
      <LayoutContext.Provider value={layoutContextValue}>
        <Layout className={styles.wrap}>
          <Sider trigger={null} collapsible collapsed={menuCollapsed}>
            <div className={classNames(styles.logo, { [styles.collapsed]: menuCollapsed })}>
              <div>{ !menuCollapsed && '国骏印刷' }</div>
            </div>
            <Menu {...menuProps} selectedKeys={menuSelectedKeys} mode='inline' theme='dark'>
              {
                renderMenus(menus)
              }
            </Menu>
          </Sider>
          <Layout className={styles.right}>
            <Header className={styles.header} style={headerStyle}>
              { menuCollapsed ? <MenuUnfoldOutlined className={styles.trigger} onClick={toggleMenu} /> : <MenuFoldOutlined className={styles.trigger} onClick={toggleMenu} /> }
              <a onClick={logout}>注销</a>
            </Header>
            <Content className={styles.content}>
              <div className={styles.view}>
                <Switch>
                  {
                    routes.map(({ path, view, ...routeProps }) => {
                      const View = views[view] || views.NoMatch
                      return (
                        <Route key={path} path={path} exact strict sensitive {...routeProps}>
                          <View />
                        </Route>
                      )
                    })
                  }
                  {
                    !!routes.length && <Redirect from='/' to='/checkout' exact strict />
                  }
                  <Route path='*'>
                    <views.NoMatch />
                  </Route>
                </Switch>
              </div>
            </Content>
            { isFooterVisible && <div className={styles.footer} ref={refCallback} /> }
          </Layout>
        </Layout>
        <LoginModal />
      </LayoutContext.Provider>
    </ConfigProvider>
  )
}

export default React.memo(AppLayout)
