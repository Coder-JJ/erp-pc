import styles from './index.less'
import React, { useState, useRef, useEffect } from 'react'
import { Table, Input } from 'antd'

const columns = [
  { dataIndex: 'c1', title: '列1', width: 500 },
  { dataIndex: 'c2', title: '列2', width: 500 },
  { dataIndex: 'c3', title: '列3', width: 500 },
  { dataIndex: 'c4', title: '列4', width: 500 },
  { dataIndex: 'c5', title: '列5', width: 500 },
  { dataIndex: 'c6', title: '列6', width: 500 }
]

const data = [
  { c1: '111', c2: '222', c3: '333', c4: '444', c5: '555', c6: '666' },
  { c1: '1111', c2: '222', c3: '333', c4: '444', c5: '555', c6: '666' },
  { c1: '1112', c2: '222', c3: '333', c4: '444', c5: '555', c6: '666' },
  { c1: '1113', c2: '222', c3: '333', c4: '444', c5: '555', c6: '666' },
  { c1: '1114', c2: '222', c3: '333', c4: '444', c5: '555', c6: '666' },
  { c1: '1115', c2: '222', c3: '333', c4: '444', c5: '555', c6: '666' },
  { c1: '1116', c2: '222', c3: '333', c4: '444', c5: '555', c6: '666' },
  { c1: '1117', c2: '222', c3: '333', c4: '444', c5: '555', c6: '666' }
]

const Stock: React.FC = function () {
  const tableWrapRef = useRef<HTMLElement | null>(null)
  const [tableWidth, setTableWidth] = useState(0)
  useEffect(() => {
    if (tableWrapRef.current) {
      setTableWidth(tableWrapRef.current.getBoundingClientRect().width)
    }
  }, [])

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <span>关键字：</span>
        <Input className={styles.input} placeholder='请输入关键字' />
      </header>
      <footer className={styles.footer} ref={tableWrapRef}>
        <Table rowKey='c1' columns={columns} dataSource={data} scroll={{ x: tableWidth, y: 200 }} />
      </footer>
    </div>
  )
}

export default React.memo(Stock)
