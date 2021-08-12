/** 对UI交互API进行二次封装 */

function toast(title, duration, icon) {
  wx.hideLoading()
  wx.showToast({
    title,
    icon: icon || 'none',
    duration: duration || 1500,
    mask: true
  })
}

function modal(title, content, confirmText, confirmColor, showCancel, cancelText, cancelColor) {
  wx.hideLoading()
  return new Promise((resolve, reject) => {
    wx.showModal({
      title,
      content,
      showCancel: showCancel || false,
      cancelText: cancelText || '取消',
      cancelColor: cancelColor || '#000000',
      confirmText: confirmText || '确定',
      confirmColor: confirmColor || '#576B95',
      success: res => res.confirm ? resolve() : reject(),
      fail: () => reject()
    })
  })
}

function loading(title, timeout) {
  wx.showLoading({
    title,
    mask: true
  })
  if (timeout) {
    setTimeout(() => wx.hideLoading(), timeout)
  }
}
function hideLoading() {
  wx.hideLoading().then().catch()
}

function error(err, message) {
  console.error('>>> 出错了:', err)
  if (!message) message = '出错了'
  toast(err && err.message || message)
}

module.exports = {
  error,
  toast,
  modal,
  loading,
  hideLoading
}