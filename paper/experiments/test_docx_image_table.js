const fs = require('fs');
const path = require('path');
const docx = require(path.resolve(__dirname, '../../backend/node_modules/docx'));

const imgPath = path.resolve(__dirname, '../figures/fig1_methodology_flowchart.png');
const imgBuffer = fs.readFileSync(imgPath);

const table = new docx.Table({
  width: { size: 100, type: docx.WidthType.PERCENTAGE },
  rows: [
    new docx.TableRow({
      children: [
        new docx.TableCell({
          children: [new docx.Paragraph({ style: 'TableHead', text: 'Header 1' })]
        }),
        new docx.TableCell({
          children: [new docx.Paragraph({ style: 'TableHead', text: 'Header 2' })]
        })
      ]
    }),
    new docx.TableRow({
      children: [
        new docx.TableCell({
          children: [new docx.Paragraph({ text: 'Cell 1' })]
        }),
        new docx.TableCell({
          children: [new docx.Paragraph({ text: 'Cell 2' })]
        })
      ]
    })
  ]
});

const doc = new docx.Document({
  sections: [
    {
      children: [
        new docx.Paragraph({
          children: [
            new docx.ImageRun({
              data: imgBuffer,
              transformation: { width: 500, height: 180 }
            })
          ]
        }),
        table
      ]
    }
  ]
});

docx.Packer.toBuffer(doc).then(buf => {
  console.log('Image and Table OK, size:', buf.length);
}).catch(err => {
  console.error('Error:', err);
});
