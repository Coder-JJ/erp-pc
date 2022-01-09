import styles from './index.less'
import React, { useMemo, useCallback, useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Button, Popconfirm, Pagination, Form } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import { debounce } from 'lodash'
import dayjs from 'dayjs'
import { RootState, Dispatch } from '../../rematch'
import { Collection } from '../../rematch/models/collection'
import { useFooter } from '../../hooks'
import { ScrollTable, CustomerSelect } from '../../components'
import { AddForm, EditForm } from './FormModal'

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
  const onCustomersChange = useCallback((customIds: number[]) => {
    dispatch.collection.updateFilter({ customIds })
    dispatch.collection.updateState({ pageNum: 1 })
    debouncedLoadCollections()
  }, [dispatch.collection, debouncedLoadCollections])

  const [onDeleteId, setDeleteId] = useState<number | undefined>()

  const [editFormVisible, setEditFormVisible] = useState(false)
  const openEditForm = useCallback((record: Collection) => {
    dispatch.collection.setEditForm(record)
    setEditFormVisible(true)
  }, [dispatch.collection])
  const closeEditForm = useCallback(() => {
    setEditFormVisible(false)
  }, [])

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
        return dayjs(value).format('YYYY-MM')
      }
    },
    {
      dataIndex: 'collectionTime',
      title: '打款时间',
      render(value) {
        return dayjs(value).format('YYYY-MM-DD')
      }
    },
    {
      dataIndex: 'id',
      width: 110,
      render(id, record) {
        return (
          <>
            <Button type='link' size='small' onClick={() => openEditForm(record)}>编辑</Button>
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
  ], [dispatch.collection, onDeleteId, deleting, openEditForm])

  const renderFooter = useFooter()

  const onPaginationChange = useCallback((pageNum: number, pageSize: number | undefined) => {
    dispatch.collection.updateState({ pageNum, pageSize })
    dispatch.collection.loadCollections()
  }, [dispatch.collection])

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <Form layout='inline'>
          <Form.Item label='客户/商标'>
            <CustomerSelect<number[]> className={styles.select} value={filter.customIds} onChange={onCustomersChange} mode='multiple' maxTagCount={5} allowClear placeholder='请选择客户/商标' />
          </Form.Item>
        </Form>
      </header>
      <footer className={styles.footer}>
        <ScrollTable<Collection> rowKey='id' columns={columns} dataSource={data} loading={loading} />
      </footer>
      {
        renderFooter(
          <>
            <AddForm>
              <Button type='primary'>新增</Button>
            </AddForm>
            {
              !!total && <Pagination current={pageNum} pageSize={pageSize} total={total} onChange={onPaginationChange} />
            }
          </>
        )
      }
      <EditForm visible={editFormVisible} onCancel={closeEditForm} />
    </div>
  )
}

export default React.memo(Component)