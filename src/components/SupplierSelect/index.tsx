import styles from './index.less'
import React, { useMemo } from 'react'
import { Select, Divider, Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { SelectProps } from 'antd/lib/select'
import { useSuppliers } from '../../hooks'
import { AddForm } from '../../views/Supplier/FormModal'

const { Option } = Select

interface Props extends SelectProps<number> {
  addButtonVisible?: boolean
  onAdd? (id: number): void
}

const SupplierSelect: React.FC<Props> = function ({ addButtonVisible, onAdd, ...props }) {
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

  return (
    <Select<number>
      placeholder='请选择供应商'
      {...dropdownRender}
      {...props}
    >
      {
        suppliers.map(supplier => <Option key={supplier.id} value={supplier.id}>{ supplier.name }</Option>)
      }
    </Select>
  )
}

export default React.memo(SupplierSelect)
