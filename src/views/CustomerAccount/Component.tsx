import styles from './index.less'
import React, { useMemo, useCallback, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Button, Pagination, Form, Input } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import { debounce } from 'lodash'
import { RootState, Dispatch } from '../../rematch'
import { FlatCustomerAccount } from '../../rematch/models/customerAccount'
import { useFooter } from '../../hooks'
import { ScrollTable } from '../../components'
import { AddForm } from '../Collection/FormModal'

const Component: React.FC = function() {
  const { didMount, shouldUpdate, filter, rows, count, current, size } = useSelector((store: RootState) => store.customerAccount)
  const loading = useSelector((store: RootState) => store.loading.effects.customerAccount.loadCustomerAccounts)

  const dispatch = useDispatch<Dispatch>()
  useEffect(() => {
    if (!didMount || shouldUpdate) {
      dispatch.customerAccount.loadCustomerAccounts()
      dispatch.customerAccount.updateState({ didMount: true, shouldUpdate: false })
    }
  }, [didMount, shouldUpdate, dispatch.customerAccount])

  const debounceddCustomerAccounts = useMemo(() => debounce<() => void>(dispatch.customerAccount.loadCustomerAccounts, 250), [dispatch.customerAccount.loadCustomerAccounts])
  const onCustomerNameChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(e => {
    dispatch.customerAccount.updateFilter({ customerName: e.target.value.trim() })
    dispatch.customerAccount.updateState({ current: 1 })
    debounceddCustomerAccounts()
  }, [dispatch.customerAccount, debounceddCustomerAccounts])

  const columns = useMemo<ColumnsType<FlatCustomerAccount>>(() => [
    {
      dataIndex: 'name',
      title: '客户/商标',
      onCell(record) {
        return {
          rowSpan: record.rowSpan
        } as any
      }
    },
    { dataIndex: 'billMonth', title: '账目月份' },
    { dataIndex: 'billAmount', title: '总金额', render: value => value.toFixed(2) },
    { dataIndex: 'paidAmount', title: '已收金额', render: value => value.toFixed(2) },
    { dataIndex: 'refundAmount', title: '退款金额', render: value => value.toFixed(2) },
    {
      dataIndex: 'restAmount',
      title: '待收金额',
      render(_, record) {
        return (record.billAmount - record.paidAmount - record.refundAmount).toFixed(2)
      }
    },
    {
      dataIndex: 'id',
      width: 110,
      render(id, record) {
        return (
          <AddForm customerAccount={record}>
            <Button type='link' size='small'>收款登记</Button>
          </AddForm>
        )
      }
    }
  ], [])

  const renderFooter = useFooter()

  const onPaginationChange = useCallback((current: number, size: number | undefined) => {
    dispatch.customerAccount.updateState({ current, size })
    dispatch.customerAccount.loadCustomerAccounts()
  }, [dispatch.customerAccount])

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <Form layout='inline'>
          <Form.Item label='客户/商标'>
            <Input value={filter.customerName} onChange={onCustomerNameChange} placeholder='请输入客户/商标名称' />
          </Form.Item>
        </Form>
      </header>
      <footer className={styles.footer}>
        <ScrollTable<FlatCustomerAccount> rowKey='key' columns={columns} dataSource={rows} loading={loading} />
      </footer>
      {
        renderFooter(
          <>
            <div />
            { !!count && <Pagination current={current} pageSize={size} total={count} onChange={onPaginationChange} /> }
          </>
        )
      }
    </div>
  )
}

export default React.memo(Component)
