import ExcelJs from 'exceljs'
import FileSaver from 'file-saver'

export default async(): Promise<void> => {
  const excel = new ExcelJs.Workbook()
  excel.creator = 'Me'
  excel.lastModifiedBy = 'Her'
  excel.created = new Date(1985, 8, 30)
  excel.modified = new Date()
  excel.lastPrinted = new Date(2016, 9, 27)
  excel.calcProperties.fullCalcOnLoad = true
  excel.views = [
    {
      x: 0,
      y: 0,
      width: 10000,
      height: 20000,
      firstSheet: 0,
      activeTab: 1,
      visibility: 'visible'
    }
  ]
  const sheet = excel.addWorksheet('Sheet111', {
    pageSetup: {
      paperSize: 9,
      fitToPage: true,
      fitToWidth: 9,
      showGridLines: true
    }
  })
  sheet.columns = [
    { header: 'Id', key: 'id', width: 10 },
    { header: 'Name', key: 'name', width: 32 },
    { header: 'D.O.B.', key: 'DOB', width: 10, outlineLevel: 1 }
  ]
  sheet.addRow({ id: 111, name: 'test', DOB: '哈哈哈' })
  const buffer = await excel.xlsx.writeBuffer()
  FileSaver.saveAs(new Blob([buffer]), `${Date.now()}_feedback.xlsx`)
}
