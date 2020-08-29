import styles from './index.less'
import React from 'react'
import { useSelector } from 'react-redux'
import { Table, Input, Button } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import { RootState } from '../../rematch'
import { Supplier } from '../../rematch/models/supplier'
import { useFooter } from '../../hooks'
import { AddForm } from './FormModal'

const columns: ColumnsType<Supplier> = [
  { dataIndex: 'code', title: '供应商代码' },
  { dataIndex: 'name', title: '供应商名称' },
  {
    dataIndex: 'operations',
    width: 140,
    render (value, record) {
      return (
        <>
          <Button type='link'>编辑</Button>
          <Button type='link' danger>删除</Button>
        </>
      )
    }
  }
]

const Component: React.FC = function () {
  const { data } = useSelector((store: RootState) => store.supplier)

  const renderFooter = useFooter()

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <span>关键字：</span>
        <Input className={styles.input} placeholder='请输入关键字' />
      </header>
      <footer className={styles.footer}>
        <Table<Supplier> rowKey='code' columns={columns} dataSource={data} pagination={false} size='middle' />
      </footer>
      {
        renderFooter(
          <AddForm>
            <Button type='primary'>新增</Button>
          </AddForm>
        )
      }
    </div>
  )
}

export default React.memo(Component)
