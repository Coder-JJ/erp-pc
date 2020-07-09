import styles from './index.less'
import React, { useEffect } from 'react'
import { Table, Input, Button } from 'antd'
import { request } from '../../libs'

const CheckOut: React.FC = function () {
  useEffect(() => {
    request.post('/order/selectByKeyword')
  }, [])
  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <span>关键字：</span>
        <Input className={styles.input} placeholder="请输入关键字" />
        <Button className={styles.search} type="primary">搜索</Button>
      </header>
      <footer className={styles.footer}>
        <Table />
      </footer>
    </div>
  )
}

export default React.memo(CheckOut)
