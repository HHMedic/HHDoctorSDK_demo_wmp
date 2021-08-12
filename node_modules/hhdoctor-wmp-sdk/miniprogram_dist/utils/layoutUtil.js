const resizeMap = {
  '/hh-im/hh-im': 'resizeIm',
  '/hh-my/hh-my': 'resizeMy'
}
let self

function getLayout(refresh) {
  return {
    clientRect: wx.getMenuButtonBoundingClientRect(),
    systemInfo: wx.getSystemInfoSync()
  }
}

function resizeIm(instance) {
  self = instance
  let layout = getLayout()
  let styleName = 'custom'
  let bTop = 35;
  if (layout.systemInfo.windowHeight < layout.systemInfo.screenHeight) {
    styleName = 'default'
    bTop = -35;
  }
  let safeArea = getSafeAreaHeight(layout.systemInfo);
  let mHeight = 64
  if ('custom' == styleName) {
    mHeight = layout.clientRect.top + ((self.data._request.callPage && self.data._request.callBtnVisible) ? 102 : 38);
  } else if (!self.data._request.callPage || !self.data._request.callBtnVisible) {
    mHeight = 0;
  }
  self.setData({
    sysInfo: layout.systemInfo,
    wxMbb: layout.clientRect,
    navStyle: styleName,
    callBtnTop: bTop,
    msgPanelTop: mHeight,
    msgPanelHeight: layout.systemInfo.windowHeight - mHeight - safeArea - 60,
    safeAreaHight: safeArea,
  })

  //隐藏底部输入框和工具栏
  if (!self.data._request.bottomToolsVisible) {
    self.setData({ msgPanelHeight: self.data.msgPanelHeight + 60 })
  }
}

function resizeMy(instance) {
  instance.setData({ bottomHeight: getSafeAreaHeight() })
}

function getSafeAreaHeight(info) {
  let safeArea = 0
  if (!info) info = wx.getSystemInfoSync()
  if (info.model.toLowerCase().indexOf('iphone x') >= 0) safeArea = 34
  else if (info.safeArea)
    safeArea = info.screenHeight - info.safeArea.bottom
  return safeArea
}

module.exports = {
  resizeMap,
  resizeIm,
  resizeMy
}