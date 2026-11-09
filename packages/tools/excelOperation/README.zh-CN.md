# Excel 操作

通过受控 workbook 脚本 API 操作 `.xlsx` 文件，并返回处理后的文件链接。

脚本运行在一个受限 facade 中，只能产生支持的工作簿操作；真实 Excel 文件由插件外层使用 ExcelJS 修改并上传。

## 示例

```js
const sheet = workbook.getWorksheet('Sheet1');

sheet.getRange('A1').setValue('处理完成');
sheet.getRange('A2:B3').setValues([
  ['姓名', '分数'],
  ['张三', 95]
]);

sheet.getRange('C2').setFormula('=SUM(B2:B10)');
sheet.getUsedRange().getFormat().autofitColumns();
```

This tool is not Microsoft Office Scripts and is not affiliated with Microsoft.
