import styles from './index.less'
import React from 'react'
import { Table, Input } from 'antd'

const Repository: React.FC = function () {
  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <span>关键字：</span>
        <Input className={styles.input} placeholder='请输入关键字' />
      </header>
      <footer className={styles.footer}>
        <Table />
      </footer>
    </div>
  )
}

export default React.memo(Repository)
