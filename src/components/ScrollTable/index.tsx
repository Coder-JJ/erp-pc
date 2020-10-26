import styles from './index.less'
import React, { PropsWithChildren, useCallback, useState, useMemo } from 'react'
import { Table } from 'antd'
import { TableProps } from 'antd/lib/table'
import ResizeObserver from 'rc-resize-observer'

type FC = <RecordType extends object = any>(props: PropsWithChildren<TableProps<RecordType>>) => React.ReactElement<any, any>

const ScrollTable = React.memo(
  <RecordType extends object>(props: PropsWithChildren<TableProps<RecordType>>): React.ReactElement<any, any> => {
    const [y, setY] = useState(0)
    const onResize = useCallback(({ height }: { height: number }) => setY(height), [])
    const scroll = useMemo(() => ({ y: Math.max(y - 47, 0) }), [y])

    return (
      <ResizeObserver onResize={onResize}>
        <div className={styles.wrap}>
          <Table<RecordType> scroll={scroll} bordered pagination={false} size='middle' {...props} />
        </div>
      </ResizeObserver>
    )
  }
) as FC

export default ScrollTable
