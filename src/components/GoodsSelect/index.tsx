import styles from './index.less'
import React, { useMemo } from 'react'
import { Select, Button, Divider } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { SelectProps } from 'antd/lib/select'
import { useGoods } from '../../hooks'
import { AddForm } from '../../views/Goods/FormModal'

const { Option } = Select

interface Props extends SelectProps<number> {
  addButtonVisible?: boolean
  onAdd? (id: number): void
}

const GoodsSelect: React.FC<Props> = function ({ addButtonVisible, onAdd, ...props }) {
  const [goods] = useGoods()
  const dropdownRender = useMemo<{} | { dropdownRender: Props['dropdownRender'] }>(() => {
    if (addButtonVisible) {
      return {
        dropdownRender: menu => (
          <div className={styles.dropdown}>
            { menu }
            <Divider className={styles.divider} />
            <div className={styles.add}>
              <AddForm onSave={onAdd}>
                <Button type='link' block icon={<PlusOutlined />}>新增货物</Button>
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
      placeholder='请选择货物'
      {...dropdownRender}
      {...props}
    >
      {
        goods.map(goods => <Option key={goods.id} value={goods.id} data={goods}>{ goods.name }</Option>)
      }
    </Select>
  )
}

export default React.memo(GoodsSelect)
