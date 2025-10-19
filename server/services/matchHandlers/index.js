const fs = require('fs');
const path = require('path');

const handlers = {};
const dir = __dirname;
fs.readdirSync(dir).forEach(file => {
  if (file === 'index.js') return;
  const name = file.replace(/\.js$/, '');
  try { handlers[name] = require(path.join(dir, file)); } catch (e) { /* ignore load errors */ }
});

function getHandler(name) {
  if (!name) return null;
  return handlers[name.toString().toLowerCase()] || null;
}

module.exports = { handlers, getHandler };
