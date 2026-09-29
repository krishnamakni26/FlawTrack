const fs = require('fs');
const content = fs.readFileSync('paper/experiments/build_pdf.js', 'utf8');

// Find text before the references section
const refSectionIndex = content.indexOf('<div class="references-container">');
const bodyText = content.substring(0, refSectionIndex);

const regex = /\[(\d+)\]/g;
let match;
const firstSeen = {};
let order = [];
while ((match = regex.exec(bodyText)) !== null) {
  const num = parseInt(match[1]);
  if (!firstSeen[num]) {
    firstSeen[num] = match.index;
    order.push(num);
  }
}
console.log('Order of in-text citations before References block:');
console.log(order);

// Check if all 1 to 18 are present
for (let i = 1; i <= 18; i++) {
  if (!firstSeen[i]) console.log(`Missing citation [${i}] in body text!`);
}
