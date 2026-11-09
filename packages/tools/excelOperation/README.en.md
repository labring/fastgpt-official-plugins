# Excel Operation

Manipulate `.xlsx` files via a controlled workbook scripting API and return a direct URL to the processed file.

Scripts execute within a restricted facade that produces only supported workbook operations. The real Excel file is modified and uploaded via ExcelJS in the outer plugin layer.

## Example

```js
const sheet = workbook.getWorksheet('Sheet1');

sheet.getRange('A1').setValue('Completed');
sheet.getRange('A2:B3').setValues([
  ['Name', 'Score'],
  ['Alice', 95]
]);

sheet.getRange('C2').setFormula('=SUM(B2:B10)');
sheet.getUsedRange().getFormat().autofitColumns();
```

This tool is not Microsoft Office Scripts and is not affiliated with Microsoft.
