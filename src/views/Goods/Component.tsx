import styles from './index.less'
import React, { useMemo, useCallback, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Input, Button, Popconfirm, Tag, Pagination, Form } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import { RootState, Dispatch } from '../../rematch'
import { Goods, Whether } from '../../rematch/models/goods'
import { useFooter, useGoods } from '../../hooks'
import { ScrollTable } from '../../components'
import { AddForm, EditForm } from './FormModal'

const Component: React.FC = function () {
  const [, data] = useGoods()
  const keyword = useSelector((store: RootState) => store.goods.keyword)
  const pageNum = useSelector((store: RootState) => store.goods.pageNum)
  const pageSize = useSelector((store: RootState) => store.goods.pageSize)
  const loading = useSelector((store: RootState) => store.loading.effects.goods.loadGoods)
  const deleting = useSelector((store: RootState) => store.loading.effects.goods.deleteGoods)
  const dataSource = useMemo(() => data.slice((pageNum - 1) * pageSize, pageNum * pageSize), [data, pageNum, pageSize])

  const dispatch = useDispatch<Dispatch>()
  const onKeywordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => dispatch.goods.updateState({ keyword: e.target.value, pageNum: 1 }), [dispatch.goods])

  const [onDeleteId, setDeleteId] = useState<number | undefined>()
  const columns: ColumnsType<Goods> = useMemo(() => [
    { dataIndex: 'name', title: '货物名称' },
    { dataIndex: 'brand', title: '商标' },
    { dataIndex: 'size', title: '规格' },
    { dataIndex: 'price', title: '单价' },
    { dataIndex: 'ifNeedReticule', title: '手提袋', render: (value: Whether) => <Tag color={value === Whether.Yes ? 'processing' : 'error'}>{ value === Whether.Yes ? '' : '不' }需要</Tag> },
    { dataIndex: 'ifNeedShoeCover', title: '鞋套', render: (value: Whether) => <Tag color={value === Whether.Yes ? 'processing' : 'error'}>{ value === Whether.Yes ? '' : '不' }需要</Tag> },
    { dataIndex: 'containerSize', title: '外箱', render: (value: number | null) => <Tag color={typeof value === 'number' && value > 0 ? 'processing' : 'error'}>{ typeof value === 'number' && value > 0 ? `${value}装/箱` : '不需要' }</Tag> },
    // { dataIndex: 'texture', title: '材质' },
    { dataIndex: 'remark', title: '备注' },
    {
      dataIndex: 'id',
      width: 110,
      render (id, record) {
        return (
          <>
            <EditForm>
              <Button type='link' size='small' onMouseEnter={() => dispatch.goods.updateEditForm(record)}>编辑</Button>
            </EditForm>
            <Popconfirm
              visible={id === onDeleteId}
              onVisibleChange={visible => setDeleteId(visible || deleting ? id : undefined)}
              onConfirm={() => dispatch.goods.deleteGoods(id)}
              okButtonProps={{ loading: deleting }}
              arrowPointAtCenter
              title='是否确定删除该货物'
              placement='topRight'
            >
              <Button type='link' size='small' danger>删除</Button>
            </Popconfirm>
          </>
        )
      }
    }
  ], [dispatch.goods, onDeleteId, deleting])

  const renderFooter = useFooter()

  const onPaginationChange = useCallback((pageNum: number, pageSize?: number | undefined) => dispatch.goods.updateState({ pageNum, pageSize }), [dispatch.goods])

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
        <ScrollTable<Goods> rowKey='id' columns={columns} dataSource={dataSource} loading={loading} />
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
