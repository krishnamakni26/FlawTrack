const fs = require('fs');
const path = require('path');

const files = [
  'paper/evidence/test_coverage_output.txt',
  'paper/evidence/npm_audit_backend.txt',
  'paper/evidence/npm_audit_frontend.txt'
];

files.forEach(f => {
  const p = path.resolve(__dirname, '..', f);
  if (fs.existsSync(p)) {
    const buf = fs.readFileSync(p);
    // Check if starts with UTF-16LE BOM or has null bytes
    if (buf.length > 2 && (buf[0] === 0xFF && buf[1] === 0xFE || buf[1] === 0x00)) {
      const str = buf.toString('utf16le');
      fs.writeFileSync(p, str, 'utf8');
      console.log(`Converted ${f} to UTF-8`);
    } else {
      console.log(`${f} already UTF-8`);
    }
  }
});
