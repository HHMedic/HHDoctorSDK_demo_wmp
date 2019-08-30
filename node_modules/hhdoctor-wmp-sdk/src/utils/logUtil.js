var common = require('./commonUtil.js');
//输出日志
function info(content, ...args) {
  if (debug())
    console.log('[' + common.formatDate('hh:mm:ss.S') + '] [HH_IM_SDK] ' + content, args);
};

function error(content, ...args) {
  if (debug())
    console.error('[' + common.formatDate('hh:mm:ss.S') + '] [HH_IM_SDK] ' + content, args);
};

function debug() {
  return getApp().globalData && getApp().globalData.profile && 'test' == getApp().globalData.profile;
}

module.exports = {
  info: info,
  error: error
}