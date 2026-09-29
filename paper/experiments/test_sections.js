const fs = require('fs');
const path = require('path');
const docx = require(path.resolve(__dirname, '../../backend/node_modules/docx'));

const doc = new docx.Document({
  sections: [
    {
      properties: {
        page: { margin: { top: 1440, bottom: 1620, left: 1170, right: 1170 } }
      },
      children: [new docx.Paragraph('Title Block (1 col)')]
    },
    {
      properties: {
        type: docx.SectionType.CONTINUOUS,
        column: { count: 2, space: 450 },
        page: { margin: { top: 1440, bottom: 1620, left: 1170, right: 1170 } }
      },
      children: [new docx.Paragraph('Two column text')]
    },
    {
      properties: {
        type: docx.SectionType.CONTINUOUS,
        column: { count: 1, space: 0 },
        page: { margin: { top: 1440, bottom: 1620, left: 1170, right: 1170 } }
      },
      children: [new docx.Paragraph('Full width table / figure (1 col)')]
    },
    {
      properties: {
        type: docx.SectionType.CONTINUOUS,
        column: { count: 2, space: 450 },
        page: { margin: { top: 1440, bottom: 1620, left: 1170, right: 1170 } }
      },
      children: [new docx.Paragraph('Two column text again')]
    }
  ]
});

docx.Packer.toBuffer(doc).then(buf => {
  console.log('Continuous sections OK, size:', buf.length);
}).catch(err => {
  console.error('Error:', err);
});
