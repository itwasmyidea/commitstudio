// Suppress Node.js DEP0040 warning about punycode
const originalEmit = process.emit;
process.emit = function(name, ...args) {
  if (name === 'warning' && args[0] && args[0].name === 'DeprecationWarning' && args[0].code === 'DEP0040') {
    return false;
  }
  return originalEmit.call(this, name, ...args);
};
