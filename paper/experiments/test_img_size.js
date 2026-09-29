const fs = require('fs');
const path = require('path');
['fig1_methodology_flowchart.png', 'fig2_system_architecture.png', 'fig4_state_machine.png', 'fig8_cvss_vs_vulntrack_ranking.png', 'fig7_duplicate_metrics_curve.png', 'fig6_risk_formula_breakdown.png'].forEach(f => {
  const p = path.join('paper/figures', f);
  const buf = fs.readFileSync(p);
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  console.log(f, w, 'x', h, 'aspect:', (w/h).toFixed(2));
});
