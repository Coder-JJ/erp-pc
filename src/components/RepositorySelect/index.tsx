import styles from './index.less'
import React, { useMemo } from 'react'
import { Select, Divider, Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { SelectProps } from 'antd/lib/select'
import { useRepositories } from '../../hooks'
import { AddForm } from '../../views/Repository/FormModal'

const { Option } = Select

interface Props extends SelectProps<number> {
  addButtonVisible?: boolean
  onAdd? (id: number): void
}

const RepositorySelect: React.FC<Props> = function ({ addButtonVisible, onAdd, ...props }) {
  const [repositories] = useRepositories()
  const dropdownRender = useMemo<{} | { dropdownRender: Props['dropdownRender'] }>(() => {
    if (addButtonVisible) {
      return {
        dropdownRender: menu => (
          <div className={styles.dropdown}>
            { menu }
            <Divider className={styles.divider} />
            <div className={styles.add}>
              <AddForm onSave={onAdd}>
                <Button type='link' block icon={<PlusOutlined />}>新增仓库</Button>
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
      placeholder='请选择仓库'
      {...dropdownRender}
      {...props}
    >
      {
        repositories.map(repo => <Option key={repo.id} value={repo.id}>{ repo.name }</Option>)
      }
    </Select>
  )
}

export default React.memo(RepositorySelect)
