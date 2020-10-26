import styles from './index.less'
import React, { useMemo, useCallback, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Input, Button, Popconfirm } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import { RootState, Dispatch } from '../../rematch'
import { Repository } from '../../rematch/models/repository'
import { useFooter, useEnterEvent, useRepositories } from '../../hooks'
import { ScrollTable } from '../../components'
import { AddForm, EditForm } from './FormModal'

const Component: React.FC = function () {
  const [, data] = useRepositories()
  const keyword = useSelector((store: RootState) => store.repository.keyword)
  const loading = useSelector((store: RootState) => store.loading.effects.repository.loadRepositories)
  const deleting = useSelector((store: RootState) => store.loading.effects.repository.deleteRepository)

  const dispatch = useDispatch<Dispatch>()
  const onKeywordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => dispatch.repository.updateState({ keyword: e.target.value }), [dispatch.repository])

  const [onDeleteId, setDeleteId] = useState<number | undefined>()
  const deleteRepository = useCallback(async () => {
    if (onDeleteId) {
      setDeleteId(onDeleteId)
      await dispatch.repository.deleteRepository(onDeleteId)
      setDeleteId(undefined)
    }
  }, [onDeleteId, dispatch.repository])
  const columns: ColumnsType<Repository> = useMemo(() => [
    { dataIndex: 'id', title: '编号' },
    { dataIndex: 'name', title: '仓库名称' },
    { dataIndex: 'leader', title: '负责人' },
    { dataIndex: 'leaderPhone', title: '负责人手机号码' },
    { dataIndex: 'remark', title: '备注' },
    {
      dataIndex: 'id',
      width: 140,
      render (id, record) {
        return (
          <>
            <EditForm>
              <Button type='link' onMouseEnter={() => dispatch.repository.updateEditForm(record)}>编辑</Button>
            </EditForm>
            <Popconfirm
              visible={id === onDeleteId}
              onVisibleChange={visible => setDeleteId(visible || deleting ? id : undefined)}
              onConfirm={deleteRepository}
              okButtonProps={{ loading: deleting }}
              arrowPointAtCenter
              title='是否确定删除该仓库'
              placement='topRight'
            >
              <Button type='link' danger>删除</Button>
            </Popconfirm>
          </>
        )
      }
    }
  ], [dispatch.repository, onDeleteId, deleteRepository, deleting])

  useEnterEvent(deleteRepository, !!onDeleteId)
  const renderFooter = useFooter()

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <span>关键字：</span>
        <Input className={styles.input} value={keyword} onChange={onKeywordChange} placeholder='请输入关键字' />
      </header>
      <footer className={styles.footer}>
        <ScrollTable<Repository> rowKey='id' columns={columns} dataSource={data} loading={loading} />
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
