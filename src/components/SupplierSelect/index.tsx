import styles from './index.less'
import React, { useMemo, useCallback } from 'react'
import { Select, Divider, Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { SelectProps } from 'antd/lib/select'
import { useSuppliers } from '../../hooks'
import { AddForm } from '../../views/Supplier/FormModal'
import { Supplier } from '../../rematch/models/supplier'

const { Option } = Select

interface Props extends SelectProps<number> {
  addButtonVisible?: boolean
  onAdd? (id: number): void
}

const SupplierSelect: React.FC<Props> = function({ addButtonVisible, onAdd, ...props }) {
  const [suppliers] = useSuppliers()
  const dropdownRender = useMemo<{} | { dropdownRender: Props['dropdownRender'] }>(() => {
    if (addButtonVisible) {
      return {
        dropdownRender: menu => (
          <div className={styles.dropdown}>
            { menu }
            <Divider className={styles.divider} />
            <div className={styles.add}>
              <AddForm onSave={onAdd}>
                <Button type='link' block icon={<PlusOutlined />}>新增供应商</Button>
              </AddForm>
            </div>
          </div>
        )
      }
    }
    return {}
  }, [addButtonVisible, onAdd])

  const itemFilter: Props['filterOption'] = useCallback((keyword, option) => {
    const trimedKeyword = keyword.trim()
    const { name, leader } = (option.data as Supplier)
    return name?.includes(trimedKeyword) || leader?.includes(trimedKeyword)
  }, [])

  return (
    <Select<number>
      placeholder='请选择供应商'
      showSearch
      filterOption={itemFilter}
      {...dropdownRender}
      dropdownMatchSelectWidth={false}
      {...props}
      optionLabelProp='name'
    >
      {
        suppliers.map(supplier => (
          <Option key={supplier.id} value={supplier.id} data={supplier} name={supplier.name}>
            <span>{ supplier.name }</span>
            {
              !!supplier.leader?.trim() && (
                <>
                  <Divider type='vertical' />
                  <span>{ supplier.leader }</span>
                </>
              )
            }
          </Option>
        ))
      }
    </Select>
  )
}

export default React.memo(SupplierSelect)
