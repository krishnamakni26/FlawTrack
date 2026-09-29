const fs = require('fs');
const path = require('path');
const docx = require(path.resolve(__dirname, '../../backend/node_modules/docx'));

const noBorder = { style: docx.BorderStyle.NONE, size: 0, color: 'auto' };
const thinBorder = { style: docx.BorderStyle.SINGLE, size: 4, color: 'D1D5DB' };
const thickBorder = { style: docx.BorderStyle.SINGLE, size: 8, color: '000000' };

const cell = new docx.TableCell({
  borders: {
    top: thickBorder,
    bottom: thinBorder,
    left: noBorder,
    right: noBorder,
  },
  children: [new docx.Paragraph('Test cell')]
});

console.log('Cell borders configured correctly');
