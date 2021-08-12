let phoneKey = '_user_phone_number'
module.exports = Behavior({
  behaviors: [],
  properties: {
    user: {
      type: String
    }
  },
  data: {
    userData: {}
  },
  attached: function () { },
  methods: {
    getUserPhoneByUserToken() {
      return new Promise((resolve, reject) => {
        this.data.apiUtil.getUserPhone()
          .then(res => {
            if (200 != res.status) return reject(res)
            resolve(res.data.phoneNum)
          })
          .catch(err => reject(err))
      })
    },
    /** 获取用户微信绑定手机号 */
    getUserPhone(e) {
      return new Promise((resolve, reject) => {
        let detail = e.detail
        if ('getPhoneNumber:ok' != detail.errMsg) return reject('未授权')
        this.data.apiUtil.decryptData(detail.encryptedData, detail.iv)
          .then(res => {
            if (200 == res.status) {
              let data = JSON.parse(res.data.data)
              this.setPhoneToStorage(data)
              return resolve(data)
            }
          })
          .catch(err => reject(err))
      })
    },
    /** 从本地缓存读取用户手机号码 */
    getPhoneFromStorage() {
      let phoneData = wx.getStorageSync(phoneKey)
      return phoneData || null
    },
    /** 保存用户授权手机号码到本地缓存 */
    setPhoneToStorage(data) {
      wx.setStorage({
        data: data,
        key: phoneKey
      })
    },
    /** 显示注册协议 */
    showLicense() {
      return new Promise((resolve, reject) => {
        if (this.data.licenseNodes && this.data.licenseNodes.length > 0) {
          this.setData({ showLicense: true })
          return resolve()
        }
        this.data.apiUtil.getLicense(6)
          .then(res => {
            if (200 == res.status) {
              this.setData({
                licenseNodes: JSON.parse(res.data.nodes),
                showLicense: true
              })
              return resolve()
            }
          })
          .catch(err => {
            this.setData({ showLicense: false })
            reject(err)
          })
      })
    },
    /** 根据手机号注册或更新用户 */
    regOrUpdateUser(phoneNum, accountId) {
      if (accountId) {
        //传入第三方唯一标识，根据该唯一标识找到用户
        return new Promise((resolve, reject) => {
          this.data.apiUtil.getLoginUserByPhone(accountId)
            .then(res => {
              if (200 == res.status) {
                let userToken = res.data.userToken
                this.updateUser(userToken, phoneNum)
                  .then(rres => {
                    if (200 == rres.status) {
                      rres.data = { userToken }
                      resolve(rres)
                    }
                    else reject(rres)
                  })
                  .catch(err => reject(err))
              } else reject()
            })
            .catch(err => reject(err))
        })

      } else {
        let user = {
          name: phoneNum,
          phone: phoneNum,
          extData: '',
          accountId,
          wxAppId: getApp().globalData.wxAppId
        }
        return this.data.apiUtil.regUser(user)
      }
    },
    /** 更新用户手机号 */
    updateUser(userToken, phoneNum) {
      let user = {
        userToken,
        phoneNum
      }
      return this.data.apiUtil.updateUser(user)
    }
  }
})