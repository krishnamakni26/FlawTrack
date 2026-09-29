const fs = require('fs');
const path = require('path');
const docx = require(path.resolve(__dirname, '../../backend/node_modules/docx'));

const doc = new docx.Document({
  styles: {
    default: {
      document: {
        run: { font: 'Times New Roman', size: 20 }
      }
    },
    paragraphStyles: [
      {
        id: 'BodyTextIndent',
        name: 'Body Text Indent',
        basedOn: 'Normal',
        next: 'BodyTextIndent',
        run: { font: 'Times New Roman', size: 20 },
        paragraph: { indent: { firstLine: 245 }, alignment: docx.AlignmentType.JUSTIFIED }
      },
      {
        id: 'Heading1',
        name: 'Heading 1',
        basedOn: 'Normal',
        next: 'Normal',
        run: { font: 'Times New Roman', size: 20, smallCaps: true },
        paragraph: { spacing: { before: 240, after: 120 } }
      },
      {
        id: 'Heading2',
        name: 'Heading 2',
        basedOn: 'Normal',
        next: 'Normal',
        run: { font: 'Times New Roman', size: 20, italics: true },
        paragraph: { spacing: { before: 180, after: 60 } }
      },
      {
        id: 'Caption',
        name: 'Caption',
        basedOn: 'Normal',
        next: 'Normal',
        run: { font: 'Times New Roman', size: 20, smallCaps: true },
        paragraph: { spacing: { before: 120, after: 120 } }
      },
      {
        id: 'Source',
        name: 'Source',
        basedOn: 'Normal',
        next: 'Normal',
        run: { font: 'Times New Roman', size: 18 },
        paragraph: { spacing: { before: 20, after: 120 } }
      },
      {
        id: 'TableHead',
        name: 'Table Head',
        basedOn: 'Normal',
        next: 'Normal',
        run: { font: 'Times New Roman', size: 20, bold: true },
        paragraph: { spacing: { before: 60, after: 60 } }
      },
      {
        id: 'BulletList',
        name: 'BulletList',
        basedOn: 'Normal',
        next: 'BulletList',
        run: { font: 'Times New Roman', size: 20 },
        paragraph: { indent: { left: 720 }, spacing: { before: 20, after: 40 } }
      },
      {
        id: 'NumberedList',
        name: 'NumberedList',
        basedOn: 'Normal',
        next: 'NumberedList',
        run: { font: 'Times New Roman', size: 20 },
        paragraph: { indent: { left: 720 }, spacing: { before: 20, after: 40 } }
      },
      {
        id: 'BlockQuote',
        name: 'BlockQuote',
        basedOn: 'Normal',
        next: 'Normal',
        run: { font: 'Times New Roman', size: 20 },
        paragraph: { indent: { left: 720, right: 720 }, spacing: { before: 120, after: 120 } }
      },
      {
        id: 'ReferencesText',
        name: 'References Text',
        basedOn: 'Normal',
        next: 'ReferencesText',
        run: { font: 'Times New Roman', size: 18 },
        paragraph: { spacing: { before: 0, after: 200 }, indent: { left: 360, hanging: 360 } }
      }
    ],
    characterStyles: [
      {
        id: 'AuthorName',
        name: 'AuthorName',
        run: { font: 'Times New Roman', size: 20, bold: true }
      }
    ]
  },
  sections: [
    {
      properties: {
        page: {
          margin: { top: 1440, bottom: 1620, left: 1170, right: 1170 }
        }
      },
      children: [
        new docx.Paragraph({
          text: 'Title of the Paper',
          heading: docx.HeadingLevel.TITLE,
          alignment: docx.AlignmentType.CENTER
        })
      ]
    },
    {
      properties: {
        type: docx.SectionType.CONTINUOUS,
        column: { count: 2, space: 450 },
        page: {
          margin: { top: 1440, bottom: 1620, left: 1170, right: 1170 }
        }
      },
      children: [
        new docx.Paragraph({
          style: 'Heading1',
          text: 'INTRODUCTION'
        }),
        new docx.Paragraph({
          style: 'BodyTextIndent',
          text: 'This is body text with indent.'
        })
      ]
    }
  ]
});

docx.Packer.toBuffer(doc).then(buf => {
  console.log('DOCX built successfully, buffer size:', buf.length);
}).catch(err => {
  console.error('Error:', err);
});
