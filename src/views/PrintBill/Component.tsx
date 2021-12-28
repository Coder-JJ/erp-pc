import './index.less'
import React, { useEffect, useState } from 'react'
import { useUpdateEffect } from 'ahooks'
import dayjs from 'dayjs'
import { CheckOut } from '../../rematch/models/checkOut'
import { ReturnGoods } from '../../rematch/models/returnGoods'
import { Filter } from '../../rematch/models/bill'
import BillPreview from '../../components/BillPreview'

const PrintBill: React.FC = function() {
  const [filter, setFilter] = useState<Filter | undefined>()
  const [checkOuts, setCheckOuts] = useState<CheckOut[]>([])
  const [returnGoods, setReturnGoods] = useState<ReturnGoods[]>([])

  useUpdateEffect(() => {
    if (checkOuts.length) {
      window.print()
      setCheckOuts([])
    }
  }, [checkOuts.length])

  useEffect(() => {
    const onMessage = (e: MessageEvent<{ filter: Filter, checkOuts: CheckOut[], returnGoods: ReturnGoods[] }>): void => {
      setFilter(e.data.filter)
      setCheckOuts(e.data.checkOuts)
      setReturnGoods(e.data.returnGoods)
    }
    window.addEventListener('message', onMessage)
    window.parent.postMessage(true)
    return () => {
      window.removeEventListener('message', onMessage)
    }
  }, [])

  return <BillPreview checkOuts={checkOuts} returnGoods={returnGoods} startDate={filter?.startTime ? dayjs(filter.startTime) : dayjs()} endDate={filter?.endTime ? dayjs(filter.endTime) : dayjs()} />
}

export default React.memo(PrintBill)
