let apiUtil

function getWxRunData() {
  return new Promise((resolve, reject) => {
    wx.getSetting({}).then(res => {
      if (!res.authSetting['scope.werun']) return reject({ message: '未授权微信步数' })
      wx.getWeRunData({
        success(res) {
          wx.setStorageSync('openWxRun', true)
          if (!apiUtil) apiUtil = require('./apiUtil')
          wx.showLoading({title:'获取步数中'})
          apiUtil.decryptData(res.encryptedData, res.iv).then(res => {
            wx.hideLoading()
            let data = JSON.parse(res.data.data)
            if (!data) return reject({ message: '微信步数读取失败' })
            console.log('准备上报微信步数至服务器')
            addWxStepDataList(data.stepInfoList, 0)
            let stepInfo = data.stepInfoList && data.stepInfoList.length && data.stepInfoList[data.stepInfoList.length - 1] || null
            resolve(stepInfo)
          }).catch(err => {
            wx.hideLoading()
            reject(err)
          })
        },
        fail: err => {
          wx.setStorageSync('openWxRun', false)
          reject(err)
        }
      })
    }).catch(err => reject(err))
  })
}
function addWxStepDataList(stepList, index) {
  if (index >= stepList.length) return console.log('上报微信步数完成')
  addWxStepData(stepList[index]).then(res => addWxStepDataList(stepList, ++index)).catch(err => { })
}
function addWxStepData(stepInfo) {
  let data = [{
    fieldId: 3,
    fieldValue: stepInfo.step,
    healthBeginTime: new Date(stepInfo.timestamp * 1000).getTime(),
    healthTimestamp: new Date(stepInfo.timestamp * 1000 + 86399000).getTime(),
    source: "WMP"
  }]
  if (!apiUtil) apiUtil = require('./apiUtil')
  return apiUtil.addHealthData(data)
}

module.exports = {
  getWxRunData,
  addWxStepData,
  addWxStepDataList
}