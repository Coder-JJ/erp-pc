import React, { useCallback } from 'react'
import { Select, Divider } from 'antd'
import { SelectProps } from 'antd/lib/select'
import { useRepostitoryGoods } from '../../hooks'
import { StockDetail } from '../../rematch/models/stock'

const { Option } = Select

interface Props extends Omit<SelectProps<number>, 'onChange'> {
  repositoryId: number
  onChange? (value: number | undefined, goods: StockDetail[]): void
}

const RepositoryGoodsSelect: React.FC<Props> = function({ onChange, ...props }) {
  const goods = useRepostitoryGoods(props.repositoryId)
  const onGoodsChange = useCallback((value: number | undefined) => onChange && onChange(value, goods), [onChange, goods])

  const itemFilter: Props['filterOption'] = useCallback((keyword: string, option) => {
    const trimedKeyword = keyword.trim()
    const { goodName, goodBrand, goodTexture, goodSize } = (option.data as StockDetail)
    return goodName?.toLowerCase()?.includes(trimedKeyword.toLowerCase()) || goodBrand?.toLowerCase()?.includes(trimedKeyword.toLowerCase()) || goodTexture?.includes(trimedKeyword) || goodSize?.includes(trimedKeyword)
  }, [])

  return (
    <Select<number>
      placeholder='请选择货物'
      showSearch
      filterOption={itemFilter}
      dropdownMatchSelectWidth={false}
      {...props}
      optionLabelProp='name'
      onChange={onGoodsChange}
    >
      {
        goods.map(goods => {
          let name: string | React.ReactElement = goods.goodName
          if (goods.goodSize?.trim()) {
            name = (
              <div>
                <span>{ goods.goodName }</span>
                <Divider type='vertical' />
                <span>{ goods.goodSize }</span>
              </div>
            )
          }

          return (
            <Option key={goods.goodId} value={goods.goodId} data={goods} name={name}>
              {
                !!goods.goodBrand?.trim() && (
                  <>
                    <span>{ goods.goodBrand }</span>
                    <Divider type='vertical' />
                  </>
                )
              }
              <span>{ goods.goodName }</span>
              {
                !!goods.goodSize?.trim() && (
                  <>
                    <Divider type='vertical' />
                    <span>{ goods.goodSize }</span>
                  </>
                )
              }
              {
                !!goods.goodTexture?.trim() && (
                  <>
                    <Divider type='vertical' />
                    <span>{ goods.goodTexture }</span>
                  </>
                )
              }
            </Option>
          )
        })
      }
    </Select>
  )
}

export default React.memo(RepositoryGoodsSelect)
