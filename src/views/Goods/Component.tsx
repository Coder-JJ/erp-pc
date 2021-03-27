import styles from './index.less'
import React, { useMemo, useCallback, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Input, Button, Popconfirm } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import { RootState, Dispatch } from '../../rematch'
import { Goods } from '../../rematch/models/goods'
import { useFooter, useEnterEvent, useGoods } from '../../hooks'
import { ScrollTable } from '../../components'
import { AddForm, EditForm } from './FormModal'

const Component: React.FC = function () {
  const [, data] = useGoods()
  const keyword = useSelector((store: RootState) => store.goods.keyword)
  const loading = useSelector((store: RootState) => store.loading.effects.goods.loadGoods)
  const deleting = useSelector((store: RootState) => store.loading.effects.goods.deleteGoods)

  const dispatch = useDispatch<Dispatch>()
  const onKeywordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => dispatch.goods.updateState({ keyword: e.target.value }), [dispatch.goods])

  const [onDeleteId, setDeleteId] = useState<number | undefined>()
  const deleteGoods = useCallback(async () => {
    if (onDeleteId) {
      setDeleteId(onDeleteId)
      await dispatch.goods.deleteGoods(onDeleteId)
      setDeleteId(undefined)
    }
  }, [onDeleteId, dispatch.goods])
  const columns: ColumnsType<Goods> = useMemo(() => [
    { dataIndex: 'id', title: '编号' },
    { dataIndex: 'name', title: '货物名称' },
    { dataIndex: 'brand', title: '商标' },
    { dataIndex: 'texture', title: '材质' },
    { dataIndex: 'size', title: '规格' },
    { dataIndex: 'price', title: '单价' },
    { dataIndex: 'remark', title: '备注' },
    {
      dataIndex: 'id',
      width: 140,
      render (id, record) {
        return (
          <>
            <EditForm>
              <Button type='link' onMouseEnter={() => dispatch.goods.updateEditForm(record)}>编辑</Button>
            </EditForm>
            <Popconfirm
              visible={id === onDeleteId}
              onVisibleChange={visible => setDeleteId(visible || deleting ? id : undefined)}
              onConfirm={deleteGoods}
              okButtonProps={{ loading: deleting }}
              arrowPointAtCenter
              title='是否确定删除该货物'
              placement='topRight'
            >
              <Button type='link' danger>删除</Button>
            </Popconfirm>
          </>
        )
      }
    }
  ], [dispatch.goods, onDeleteId, deleteGoods, deleting])

  useEnterEvent(deleteGoods, !!onDeleteId)
  const renderFooter = useFooter()

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <span>关键字：</span>
        <Input className={styles.input} value={keyword} onChange={onKeywordChange} placeholder='请输入关键字' />
      </header>
      <footer className={styles.footer}>
        <ScrollTable<Goods> rowKey='id' columns={columns} dataSource={data} loading={loading} />
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
