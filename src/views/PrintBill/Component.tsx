import './index.less'
import React, { useEffect, useState } from 'react'
import { useUpdateEffect } from 'ahooks'
import moment from 'moment'
import { CheckOut } from '../../rematch/models/checkOut'
import { ReturnGoods } from '../../rematch/models/returnGoods'
import { Collection } from '../../rematch/models/collection'
import { Filter } from '../../rematch/models/bill'
import BillPreview from '../../components/BillPreview'

const PrintBill: React.FC = function() {
  const [filter, setFilter] = useState<Filter | undefined>()
  const [checkOuts, setCheckOuts] = useState<CheckOut[] | undefined>()
  const [returnGoods, setReturnGoods] = useState<ReturnGoods[] | undefined>()
  const [collections, setCollections] = useState<Collection[] | undefined>()

  useUpdateEffect(() => {
    if (filter && checkOuts && returnGoods && collections) {
      window.print()
      setFilter(undefined)
      setCheckOuts(undefined)
      setReturnGoods(undefined)
      setCollections(undefined)
    }
  }, [filter, checkOuts, returnGoods, collections])

  useEffect(() => {
    const onMessage = (e: MessageEvent<{ filter: Filter, checkOuts: CheckOut[], returnGoods: ReturnGoods[], collections: Collection[] }>): void => {
      setFilter(e.data.filter)
      setCheckOuts(e.data.checkOuts)
      setReturnGoods(e.data.returnGoods)
      setCollections(e.data.collections)
    }
    window.addEventListener('message', onMessage)
    window.parent.postMessage(true)
    return () => {
      window.removeEventListener('message', onMessage)
    }
  }, [])

  return <BillPreview checkOuts={checkOuts || []} returnGoods={returnGoods || []} collections={collections || []} startDate={filter?.startTime ? moment(filter.startTime) : moment()} endDate={filter?.endTime ? moment(filter.endTime) : moment()} />
}

export default React.memo(PrintBill)
