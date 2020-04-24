
function getKeyboardLayout(layout) {
  let kbLayout = require('./keyboard-layout-' + layout + '.js')
  return kbLayout;
}

module.exports = {
  getKeyboardLayout
}