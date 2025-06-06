import fs from 'fs';
const versions = JSON.parse(fs.readFileSync('versions.json', 'utf-8'));
const latest = Object.keys(versions).sort((a, b) => {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) - (pb[i] || 0);
  }
  return 0;
}).pop();
console.log(latest);
