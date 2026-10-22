const fs = require('fs');
const path = require('path');
const {execFileSync} = require('child_process');

const root = path.join(__dirname, '..');

function walk(dir) {
  return fs.readdirSync(dir, {withFileTypes: true}).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const files = [path.join(root, 'cypress.config.js'), ...walk(path.join(root, 'cypress'))];

for (const file of files) {
  if (file.endsWith('.js')) execFileSync(process.execPath, ['--check', file], {stdio: 'inherit'});
  if (file.endsWith('.json')) JSON.parse(fs.readFileSync(file, 'utf8'));
}

console.log(`Checked ${files.length} files`);
