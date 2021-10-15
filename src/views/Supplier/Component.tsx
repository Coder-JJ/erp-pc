import styles from './index.less'
import React, { useMemo, useCallback, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Input, Button, Popconfirm, Row, Col, Form } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import { ExpandableConfig } from 'antd/lib/table/interface'
import { RootState, Dispatch } from '../../rematch'
import { Supplier } from '../../rematch/models/supplier'
import { useFooter, useEnterEvent, useSuppliers } from '../../hooks'
import { ScrollTable } from '../../components'
import { AddForm, EditForm } from './FormModal'

const Component: React.FC = function () {
  const [, data] = useSuppliers()
  const keyword = useSelector((store: RootState) => store.supplier.keyword)
  const loading = useSelector((store: RootState) => store.loading.effects.supplier.loadSuppliers)
  const deleting = useSelector((store: RootState) => store.loading.effects.supplier.deleteSupplier)

  const dispatch = useDispatch<Dispatch>()
  const onKeywordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => dispatch.supplier.updateState({ keyword: e.target.value }), [dispatch.supplier])

  const [onDeleteId, setDeleteId] = useState<number | undefined>()
  const deleteSupplier = useCallback(async () => {
    if (onDeleteId) {
      setDeleteId(onDeleteId)
      await dispatch.supplier.deleteSupplier(onDeleteId)
      setDeleteId(undefined)
    }
  }, [onDeleteId, dispatch.supplier])
  const columns: ColumnsType<Supplier> = useMemo(() => [
    { dataIndex: 'name', title: '供应商名称' },
    { dataIndex: 'leader', title: '负责人' },
    { dataIndex: 'leaderPhone', title: '负责人手机号码' },
    { dataIndex: 'phone', title: '座机号' },
    { dataIndex: 'fax', title: '传真号' },
    {
      dataIndex: 'id',
      width: 140,
      render (id, record) {
        return (
          <>
            <EditForm>
              <Button type='link' onMouseEnter={() => dispatch.supplier.updateEditForm(record)}>编辑</Button>
            </EditForm>
            <Popconfirm
              visible={id === onDeleteId}
              onVisibleChange={visible => setDeleteId(visible || deleting ? id : undefined)}
              onConfirm={deleteSupplier}
              okButtonProps={{ loading: deleting }}
              arrowPointAtCenter
              title='是否确定删除该供应商'
              placement='topRight'
            >
              <Button type='link' danger>删除</Button>
            </Popconfirm>
          </>
        )
      }
    }
  ], [dispatch.supplier, onDeleteId, deleteSupplier, deleting])

  const expandable = useMemo<ExpandableConfig<Supplier>>(() => ({
    expandedRowRender ({ address, addressDetail, bank, bankAccount, bankAccountName, mail, website, remark }) {
      return (
        <>
          <Row gutter={[16, 16]}>
            <Col span={8}>地址：{ address }</Col>
            <Col span={16}>详细地址：{ addressDetail }</Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col span={8}>开户行：{ bank }</Col>
            <Col span={8}>银行账号：{ bankAccount }</Col>
            <Col span={8}>银行账户名：{ bankAccountName }</Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col span={8}>邮箱：{ mail }</Col>
            <Col span={8}>官网：{ website }</Col>
            <Col span={8}>备注：{ remark }</Col>
          </Row>
        </>
      )
    }
  }), [])

  useEnterEvent(deleteSupplier, !!onDeleteId)
  const renderFooter = useFooter()

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
        <ScrollTable<Supplier> rowKey='id' columns={columns} dataSource={data} loading={loading} expandable={expandable} />
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
