import styles from './index.less'
import React, { useMemo, useCallback } from 'react'
import { Select, Divider, Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { SelectProps } from 'antd/lib/select'
import { useRepositories } from '../../hooks'
import { AddForm } from '../../views/Repository/FormModal'
import { Repository } from '../../rematch/models/repository'

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

  const itemFilter: Props['filterOption'] = useCallback((keyword, option) => {
    const trimedKeyword = keyword.trim()
    const { name, leader } = (option.data as Repository)
    return name?.includes(trimedKeyword) || leader?.includes(trimedKeyword)
  }, [])

  return (
    <Select<number>
      placeholder='请选择仓库'
      {...dropdownRender}
      showSearch
      filterOption={itemFilter}
      dropdownMatchSelectWidth={false}
      {...props}
      optionLabelProp='name'
    >
      {
        repositories.map(repo => (
          <Option key={repo.id} value={repo.id} data={repo} name={repo.name}>
            <span>{ repo.name }</span>
            {
              !!repo.leader?.trim() && (
                <>
                  <Divider type='vertical' />
                  <span>{ repo.leader }</span>
                </>
              )
            }
          </Option>
        ))
      }
    </Select>
  )
}

export default React.memo(RepositorySelect)
