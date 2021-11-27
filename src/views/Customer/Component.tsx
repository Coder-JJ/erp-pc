import styles from './index.less'
import React, { useMemo, useCallback, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Input, Button, Popconfirm, Row, Col, Pagination, Form } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import { ExpandableConfig } from 'antd/lib/table/interface'
import { RootState, Dispatch } from '../../rematch'
import { Customer } from '../../rematch/models/customer'
import { useFooter, useEnterEvent, useCustomers } from '../../hooks'
import { ScrollTable } from '../../components'
import { AddForm, EditForm } from './FormModal'

const Component: React.FC = function () {
  const keyword = useSelector((store: RootState) => store.customer.keyword)
  const data = useCustomers(keyword)
  const pageNum = useSelector((store: RootState) => store.customer.pageNum)
  const pageSize = useSelector((store: RootState) => store.customer.pageSize)
  const loading = useSelector((store: RootState) => store.loading.effects.customer.loadCustomers)
  const deleting = useSelector((store: RootState) => store.loading.effects.customer.deleteCustomer)
  const dataSource = useMemo(() => data.slice((pageNum - 1) * pageSize, pageNum * pageSize), [data, pageNum, pageSize])

  const dispatch = useDispatch<Dispatch>()
  const onKeywordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => dispatch.customer.updateState({ keyword: e.target.value, pageNum: 1 }), [dispatch.customer])

  const [onDeleteId, setDeleteId] = useState<number | undefined>()
  const deleteCustomer = useCallback(async () => {
    if (onDeleteId) {
      setDeleteId(onDeleteId)
      await dispatch.customer.deleteCustomer(onDeleteId)
      setDeleteId(undefined)
    }
  }, [onDeleteId, dispatch.customer])
  const columns: ColumnsType<Customer> = useMemo(() => [
    { dataIndex: 'name', title: '客户名称' },
    { dataIndex: 'leader', title: '负责人' },
    { dataIndex: 'leaderPhone', title: '负责人手机号码' },
    { dataIndex: 'phone', title: '座机号' },
    { dataIndex: 'fax', title: '传真号' },
    {
      dataIndex: 'id',
      width: 110,
      render (id, record) {
        return (
          <>
            <EditForm>
              <Button type='link' size='small' onMouseEnter={() => dispatch.customer.updateEditForm(record)}>编辑</Button>
            </EditForm>
            <Popconfirm
              visible={id === onDeleteId}
              onVisibleChange={visible => setDeleteId(visible || deleting ? id : undefined)}
              onConfirm={deleteCustomer}
              okButtonProps={{ loading: deleting }}
              arrowPointAtCenter
              title='是否确定删除该客户'
              placement='topRight'
            >
              <Button type='link' size='small' danger>删除</Button>
            </Popconfirm>
          </>
        )
      }
    }
  ], [dispatch.customer, onDeleteId, deleteCustomer, deleting])

  const expandable = useMemo<ExpandableConfig<Customer>>(() => ({
    expandedRowRender ({ address, addressDetail, bank, bankAccount, bankAccountName, mail, remark }) {
      return (
        <>
          <Row gutter={[16, 16]}>
            <Col span={8}>邮箱：{ mail }</Col>
            <Col span={8}>地址：{ address }</Col>
            <Col span={8}>详细地址：{ addressDetail }</Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col span={8}>开户行：{ bank }</Col>
            <Col span={8}>银行账号：{ bankAccount }</Col>
            <Col span={8}>银行账户名：{ bankAccountName }</Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col span={24}>备注：{ remark }</Col>
          </Row>
        </>
      )
    }
  }), [])

  useEnterEvent(deleteCustomer, !!onDeleteId)
  const renderFooter = useFooter()

  const onPaginationChange = useCallback((pageNum: number, pageSize?: number | undefined) => dispatch.customer.updateState({ pageNum, pageSize }), [dispatch.customer])

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <Form layout='inline'>
          <Form.Item label='关键字'>
            <Input className={styles.input} value={keyword} onChange={onKeywordChange} placeholder='请输入关键字' />
          </Form.Item>
        </Form>
      </header>
      <footer className={styles.footer}>
        <ScrollTable<Customer> rowKey='id' columns={columns} dataSource={dataSource} loading={loading} expandable={expandable} />
      </footer>
      {
        renderFooter(
          <>
            <AddForm>
              <Button type='primary'>新增</Button>
            </AddForm>
            <Pagination total={data.length} current={pageNum} pageSize={pageSize} onChange={onPaginationChange} hideOnSinglePage />
          </>
        )
      }
    </div>
  )
}

export default React.memo(Component)
