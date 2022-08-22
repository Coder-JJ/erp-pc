import styles from './index.less'
import React, { useMemo, useCallback, useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Button, Popconfirm, Pagination, Form, Input, Select } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import { debounce } from 'lodash'
import moment from 'moment'
import { RootState, Dispatch } from '../../rematch'
import { Collection, PaymentPlatform, paymentPlatforms } from '../../rematch/models/collection'
import { useFooter } from '../../hooks'
import { ScrollTable, CustomerSelect } from '../../components'
import { usePersistFn, useSetState } from 'ahooks'
import ProForm from './ProForm'

export interface State {
  formVisible: boolean
  formData: Collection | undefined
}

const Component: React.FC = function() {
  const { filter, data, total, pageNum, pageSize } = useSelector((store: RootState) => store.collection)
  const loading = useSelector((store: RootState) => store.loading.effects.collection.loadCollections)
  const deleting = useSelector((store: RootState) => store.loading.effects.collection.deleteCollection)

  const dispatch = useDispatch<Dispatch>()
  useEffect(() => {
    if (total === null) {
      dispatch.collection.loadCollections()
    }
  }, [total, dispatch.collection])

  const debouncedLoadCollections = useMemo(() => debounce<() => void>(dispatch.collection.loadCollections, 250), [dispatch.collection.loadCollections])
  const onKeywordChange = usePersistFn<React.ChangeEventHandler<HTMLInputElement>>(e => {
    dispatch.collection.updateFilter({ keyword: e.target.value })
    dispatch.collection.updateState({ pageNum: 1 })
    debouncedLoadCollections()
  })
  const onCustomersChange = useCallback((customIds: number[]) => {
    dispatch.collection.updateFilter({ customIds })
    dispatch.collection.updateState({ pageNum: 1 })
    debouncedLoadCollections()
  }, [dispatch.collection, debouncedLoadCollections])
  const onPaymentPlatformChange = usePersistFn((paymentPlatform: PaymentPlatform) => {
    dispatch.collection.updateFilter({ paymentPlatform })
    dispatch.collection.updateState({ pageNum: 1 })
    debouncedLoadCollections()
  })

  const [state, setState] = useSetState<State>({
    formVisible: false,
    formData: undefined
  })
  const closeForm = usePersistFn(() => {
    setState({
      formVisible: false,
      formData: undefined
    })
  })

  const [onDeleteId, setDeleteId] = useState<number | undefined>()
  const columns = useMemo<ColumnsType<Collection>>(() => [
    { dataIndex: 'customName', title: '客户/商标' },
    {
      dataIndex: 'collection',
      title: '货款金额',
      render(value) {
        return value.toFixed(2)
      }
    },
    {
      dataIndex: 'goodsTime',
      title: '货款年月',
      render(value) {
        return moment(value).format('YYYY-MM')
      }
    },
    {
      dataIndex: 'collectionTime',
      title: '打款时间',
      render(value) {
        return moment(value).format('YYYY-MM-DD')
      }
    },
    {
      dataIndex: 'payer',
      title: '打款人/账号'
    },
    {
      dataIndex: 'paymentPlatform',
      title: '打款平台',
      render(value) {
        return paymentPlatforms.find(p => p.value === value)?.label || ''
      }
    },
    {
      dataIndex: 'remark',
      title: '备注',
      ellipsis: true
    },
    {
      dataIndex: 'id',
      width: 110,
      render(id, record) {
        return (
          <>
            <Button type='link' size='small' onClick={() => setState({ formVisible: true, formData: record })}>编辑</Button>
            <Popconfirm
              visible={id === onDeleteId}
              onVisibleChange={visible => setDeleteId(visible || deleting ? id : undefined)}
              onConfirm={() => dispatch.collection.deleteCollection(record)}
              okButtonProps={{ loading: deleting }}
              arrowPointAtCenter
              title='是否确定删除该收款记录'
              placement='topRight'
            >
              <Button type='link' size='small' danger>删除</Button>
            </Popconfirm>
          </>
        )
      }
    }
  ], [dispatch.collection, onDeleteId, deleting, setState])

  const renderFooter = useFooter()

  const onPaginationChange = useCallback((pageNum: number, pageSize: number | undefined) => {
    dispatch.collection.updateState({ pageNum, pageSize })
    dispatch.collection.loadCollections()
  }, [dispatch.collection])

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <Form layout='inline'>
          <Form.Item label='关键字'>
            <Input className={styles.input} value={filter.keyword} onChange={onKeywordChange} placeholder='请输入关键字' />
          </Form.Item>
          <Form.Item label='客户/商标'>
            <CustomerSelect<number[]> className={styles.select} value={filter.customIds} onChange={onCustomersChange} mode='multiple' maxTagCount={5} allowClear placeholder='请选择客户/商标' />
          </Form.Item>
          <Form.Item label='打款平台'>
            <Select<PaymentPlatform> className={styles.select} value={filter.paymentPlatform} onChange={onPaymentPlatformChange} allowClear placeholder='请选择打款平台'>
              {
                paymentPlatforms.map(p => <Select.Option key={p.value} value={p.value}>{ p.label }</Select.Option>)
              }
            </Select>
          </Form.Item>
        </Form>
      </header>
      <footer className={styles.footer}>
        <ScrollTable<Collection> rowKey='id' columns={columns} dataSource={data} loading={loading} />
      </footer>
      {
        renderFooter(
          <>
            <Button type='primary' onClick={() => setState({ formVisible: true })}>新增</Button>
            {
              !!total && <Pagination current={pageNum} pageSize={pageSize} total={total} onChange={onPaginationChange} />
            }
          </>
        )
      }
      <ProForm visible={state.formVisible} collection={state.formData} onSuccess={closeForm} modalProps={{ onCancel: closeForm }} />
    </div>
  )
}

export default React.memo(Component)
