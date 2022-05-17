const hhDoctor = require('../hhDoctor.js');
var that;
let hasRequestWeRun = false
let apiUtil, healthUtil, uiUtil = require('../utils/uiUtil'), phoneNumMask = require('../utils/commonUtil').phoneNumMask
Component({
  behaviors: [
    require('../behaviors/hhStarter'),
    require('../behaviors/hhCommon'),
    require('../behaviors/hhNavigator'),
    require('../behaviors/hhLayout'),
  ],
  properties: {
  },

  data: {
    _name: 'hh-my',
    primeLevel: 'prime',
    showBeanTip: false,
    user: null,
    product: null,
    productDesc: '',
    vMoney: -1,
    cacheSize: '',
    doctorTeamUrl: '',
    drugMoneyTypeEnum: ['', '和豆 (可1:1抵扣药费)', '', '报销额度', '健康金 (可1:1抵扣药费)'],
    weRunAuth: false,
    openWxRun:true,
    stepInfo: {},
    menuList: [
      [
        { name: 'ehr', visible: true, icon: 'ehr', text: '档案库', remark: '', arrow: true, acl: 'showEhr' },
        { name: 'invoicerequest', visible: true, icon: 'invoicerequest', text: '申请发票', remark: '', arrow: true, acl: 'requestInvoice' },
        { name: 'invoice', visible: true, icon: 'invoice', text: '发票抬头', remark: '', arrow: true, acl: 'showInvoice' },
        { name: 'order', visible: true, icon: 'order', text: '我的订单', remark: '', arrow: true, acl: 'orderList' },
        { name: 'address', visible: true, icon: 'address', text: '地址管理', remark: '', arrow: true, acl: 'showAddress' }],
      [
        { name: 'doctor', visible: true, icon: 'doctor', text: '私人医生团队', remark: '', arrow: true }],
      [
        { name: 'coupon', visible: true, icon: 'coupon', text: '抵用券', remark: '', arrow: true }],
      [
        { name: 'step', visible: true, icon: 'step', text: '我的步数', remark: '', arrow: true, acl: 'showStep' }],
      [
        { name: 'code', visible: true, icon: 'code', text: '激活码激活', remark: '', arrow: true, acl: 'showActiveCode' },
        { name: 'expertservice', visible: true, icon: 'expertservice', text: '使用专家宝', remark: '', arrow: true, acl: 'showExpertService' }],
      [
        { name: 'changePhone', visible: true, icon: 'setting', text: '更换手机号', remark: '', arrow: true, acl: 'changePhone' },
        { name: 'clear', visible: true, icon: 'clear', text: '清理缓存', remark: '', arrow: true, acl: 'showClearCache' },
        { name: 'license', visible: true, icon: 'license', text: '经营证照', remark: '', arrow: true, acl: 'showCorpLicense' },
        { name: 'scan', visible: true, icon: 'scan', text: '扫一扫', remark: '', arrow: true, acl: 'showScan' },
        { name: 'about', visible: true, icon: 'about', text: '关于', remark: '', arrow: true, acl: 'showAbout' }]
    ]
  },
  lifetimes: {
    attached() {
      that = this;
    },
    ready() {
      if ('unreg' != this.data._request.userToken) { }
      /*var info = wx.getSystemInfoSync();
      this.setData({
        sysInfo: info
      })*/
      this._getCacheSize();
    }
  },
  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function () {
      this._getProductInfo();
      if(wx.getStorageSync('openWxRun')) this.getRunData()

      
    },
    hide: function () { },
    resize: function () { },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    _requestComplete() {
      apiUtil = require('../utils/apiUtil')
      if ('unreg' == this.data._request.userToken) {
        this._getUnregAcl();
      } else if (this.data._request.autoAcl) {
        this._getUserAcl();
      } else this._applyAcl()
    },
    _showBeanTip() {
      this.setData({
        showBeanTip: true
      })
    },
    _hideBeanTip() {
      this.setData({
        showBeanTip: false
      })
    },
    _getUserAcl() {
      var url = this._getHost().wmpHost +
        'wmp/personalAcl' +
        '?userToken=' + this.data._request.userToken +
        '&sdkProductId=' + this.data._request.sdkProductId;
      url = this._appendUrlParams(url);

      wx.request({
        url: url,
        data: {},
        method: 'POST',
        success: function (res) {
          if (res && res.data && 200 == res.data.status) {
            //成功
            let _acl = Object.assign(that.data._request.userAcl, res.data.data);
            _acl = that._getSpecialAcl(_acl);
            that.setData({
              '_request.userAcl': _acl
            })
            that._applyAcl()
          }
        }
      })
    },

    _getUnregAcl() {
      that.setData({
        '_request.userAcl.showAbout': false,
        '_request.userAcl.showClearCache': false
      })
      that._applyAcl()
    },

    _getSpecialAcl(acl) {
      if ('2DDDC0689C23CC70F0BCE3C0A819B95F3F0D04F68EA2608F6783B874E4F50EEF' == this.data._request.userToken ||
        '170054A50BDF416BE7071D0ED8B85BE3CCCB578FFE9820E7F43A1807648A85D9' == this.data._request.userToken ||
        '3AEDB253DA9C8385819A1B7B575DF5E0BB7A1F1299CAF508460D59212594CED3' == this.data._request.userToken ||
        '961AD83D26E50BD667AD7BBF5F758B49BB7A1F1299CAF508460D59212594CED3' == this.data._request.userToken ||
        'E826935372505F5D6926382A8E9DD339BB7A1F1299CAF508460D59212594CED3' == this.data._request.userToken) {
        acl.showClearCache = false;
        acl.showProductRight = false;
        acl.showBuyProduct = false;
        acl.changePhone = true;
        acl.showAbout = false;
        acl.requestInvoice = false;
        acl.showLogout = true;
      }
      return acl;
    },
    _applyAcl() {
      //data-msg='{{_request.userAcl.activeCodeMsg}}'
      this.data.menuList.forEach(group => {
        group.forEach(item => {
          if (item.acl) item.visible = this.data._request.userAcl[item.acl]
          switch (item.name) {
            case 'doctor': item.visible = this.data._request.sdkProductId == 10265 && this.data.doctorTeamUrl; break
            case 'coupon': item.visible = this.data._request.sdkProductId == 10239; break
            case 'clear': item.remark = this.data.cacheSize; break
            case 'step': item.remarkClass = (this.data.weRunAuth ? 'step' : 'tap'); item.remark = (this.data.weRunAuth ? '今日步数 ' + this.data.stepInfo.step : '点击获取微信步数授权'); break
            case 'changePhone': item.remark = phoneNumMask(this.data.user && this.data.user.phoneNum || ''); break
            case 'code': item.data = this.data._request.userAcl.activeCodeMsg; break
            default: break
          }
        })
      })
      this.setData({ menuList: this.data.menuList })
    },

    _getProductInfo() {
      if ('unreg' == this.data._request.userToken) {
        return;
      }
      this.setData({ doctorTeamUrl: getApp().globalData.loginUser && getApp().globalData.loginUser.loadcfg && getApp().globalData.loginUser.loadcfg.doctorTeamUrl || '' })

      var url = this._getHost().wmpHost + 'my/product' +
        '?userToken=' + this.data._request.userToken +
        '&sdkProductId=' + this.data._request.sdkProductId;
      url = this._appendUrlParams(url);

      wx.request({
        url: url,
        data: {},
        method: 'POST',
        success: function (res) {
          if (res && res.data && 200 == res.data.status) {
            //成功
            that.setData({
              user: res.data.data.user,
              vMoney: 'undefined' != typeof (res.data.data.vMoney) ? res.data.data.vMoney : -1
            })
            if (res.data.data.product) {
              that.setData({
                productDesc: res.data.data.product.productStatusDescn
              })
              if ('normal' == res.data.data.product.productStatusEnum) {
                that.setData({
                  product: res.data.data.product,
                  primeLevel: 1 == res.data.data.product.cardLevel ? 'prime' : ''
                })
              }
            } else {
              that.setData({
                productDesc: '暂未开通会员'
              })
            }
          } else {

          }

        },
        complete: function () {
          wx.hideLoading();
        }
      })
    },
    _tapMenu(e) {
      console.log(e)
      let menuData = e.currentTarget.dataset.menuData || ''
      switch (e.currentTarget.dataset.menuName) {
        case 'ehr': return this._viewEhrFamily()
        case 'invoicerequest': return this._requestInvocie()
        case 'invoice': return this._viewInvoice()
        case 'order': return this._viewMedicineOrderList()
        case 'address': return this._viewAddress()
        case 'doctor': return this._viewDoctorTeam()
        case 'coupon': return this._viewShopCoupon()
        case 'step': return this.requestWeRunAuth()
        case 'code': return this._viewActiveCode(menuData)
        case 'expertservice': return this._userExpertService()
        case 'changePhone': return this._changePhone()
        case 'clear': return this._clearCache()
        case 'license': return this._viewCorpLicense()
        case 'scan': return this._scan()
        case 'about': return this._viewAbout()
        default: return
      }
    },
    _changePhone() {
      if (this._isUnReg(true)) return;
      wx.showModal({
        title: '',
        content: '请在首页联系您的助理，帮您修改手机号',
        showCancel: false,
        confirmText: '我知道了'
      })
    },
    //跳转档案库
    _viewEhrFamily() {
      if (this._isUnReg(true)) return;
      wx.navigateTo({
        url: this.data.basePath + 'innerpages/ehr-family/ehr-family'
      })
    },
    //跳转私人医生团队
    _viewDoctorTeam() {
      if (this._isUnReg(true)) return;
      wx.navigateTo({
        url: this.data.basePath + 'innerpages/sunshine-doctor/sunshine-doctor'
      })
    },
    _viewDoctorTeamTx() {
      wx.navigateTo({
        url: '/pages/doctor/group'
      })
    },
    //查看光速商城优惠券列表
    _viewShopCoupon() {
      if (this._isUnReg(true)) return;
      let url = this._getHost().portal + `guangda/coupon.html?userToken=${this.data._request.userToken}`;
      console.log(url)
      // this._viewUrl(url)
      wx.navigateTo({
        url: '/pages/portal/portal?page=coupon',
      })

    },
    _viewCorpLicense() {
      var url = this._getHost().wmpHost +
        'wmp/corpLicense?sdkProductId=' + this.data._request.sdkProductId;
      this._viewUrl(url);
    },
    _viewAbout() {
      var url = this._getHost().wmpHost +
        'wmp/about?appId=' + this.data._request.sdkProductId;
      this._viewUrl(url);
    },

    _viewAddress() {
      this._viewAddressList();
    },

    _requestInvocie() {
      if (this._isUnReg(true)) return;
      var url = this._getHost().wmpHost +
        'pay/list?' + this._getPublicRequestParams() +
        '&buyPage=' + encodeURIComponent(this.data.basePath + 'innerpages/buyProduct') +
        '&payPage=' + encodeURIComponent(this.data._request.payPage);
      this._viewUrl(url);
    },
    _viewInvoice() {
      if (this._isUnReg(true)) return;
      var url = this._getHost().wmpHost +
        'invoice/list?' + this._getPublicRequestParams();
      this._viewUrl(url);
    },

    _userExpertService() {
      if (this.data._request.userAcl.expertServiceStatus) {
        wx.showModal({
          title: '提示',
          content: this.data._request.userAcl.expertServiceStatus,
          showCancel: false,
        })
        return;
      }
      wx.showLoading({
        title: '处理中...',
      })
      var url = this._getHost().wmpHost +
        'wmp/useExpertService?=' + this._getPublicRequestParams();
      url = this._appendUrlParams(url);
      wx.request({
        url: url,
        data: {},
        method: 'POST',
        success: function (res) {
          wx.hideLoading();
          if (res && res.data && 200 == res.data.status) {
            wx.navigateBack({
              delta: 1
            })
          } else {
            wx.showModal({
              title: '错误',
              content: res.data.message,
              showCancel: false
            })
          }
        }, complete: function () { wx.hideLoading() }
      })
    },

    _buyProduct() {
      var pageUrl = this.data.basePath + 'innerpages/buyProduct/buyProduct?' + this._getPublicRequestParams() +
        '&payPage=' + this.data._request.payPage;
      wx.navigateTo({ url: pageUrl, })
    },
    _logoutConfirm() {
      wx.showModal({
        title: '',
        content: '是否立即退出登录?',
        confirmColor: '#0592f5',
        success: function (e) { if (e.confirm) that._logout() }
      })
    },

    _logout() {
      hhDoctor.off('chatMessage');
      hhDoctor.logout(true)
        .then(res => this._triggerEvent('logout', res))
        .catch(err => this._triggerEvent('error', err))
    },
    _getCacheSize() {
      wx.getStorageInfo({
        success: function (res) {
          that.setData({
            cacheSize: res.currentSize + ' KB'
          })
        }
      })
    },
    _clearCache() {
      wx.clearStorage();
      this.data.menuList.forEach(group => { group.forEach(item => { if ('clear' == item.name) item.remark = '0 KB' }) })
      wx.showToast({ title: '清理完毕' })
      that.setData({ cacheSize: '0 KB', menuList: this.data.menuList })
    },
    _reg() {
      if (!this.data._request.regPage) return
      wx.navigateTo({ url: this.data._request.regPage, })
    },
    _scan() {
      if (!this.data._request.userToken) return wx.showToast({ title: '未登录用户无法扫码', icon: 'none' })
      wx.scanCode({
        onlyFromCamera: true,
        scanType: ['qrCode']
      }).then(res => {
        if (res && res.result) this.parseShareCode(res.result)
      }).catch(err => uiUtil.error(err, '系统错误，请稍后再试'))
    },
    parseShareCode(shareCode) {
      apiUtil.parseShareCode('ehrweb', shareCode).then(res => {
        let url = `${res.data.page}?sdkProductId=${this.data._request.sdkProductId}&userToken=${this.data._request.userToken}&shareCode=${shareCode}`
        this._viewUrl(url)
      }).catch(err => uiUtil.toast('二维码已过期，请刷新页面再试'))
    },
    requestWeRunAuth() {
      if (this.data.weRunAuth && wx.getStorageSync('openWxRun')) return     
      if (hasRequestWeRun && wx.getStorageSync('openWxRun')) {
        wx.openSetting({})
      } else {
        wx.authorize({ scope: 'scope.werun' }).then(res => {
          this.getRunData()
        }).catch(err => hasRequestWeRun = true)
      }
    },
    getRunData() {
      this.setData({openWxRun:wx.getStorageSync('openWxRun')})
      wx.getSetting({}).then(res => {
        this.setData({ weRunAuth: res.authSetting['scope.werun'] || false })
        if ('undefined' != typeof res.authSetting['scope.werun']) hasRequestWeRun = true
        if (!res.authSetting['scope.werun']) return
        if (!healthUtil) healthUtil = require('../utils/healthUtil')
        healthUtil.getWxRunData().then(res => {
          that.setData({ stepInfo: res })
          this.data.menuList.forEach(group => {
            group.forEach(item => {
              if ('step' == item.name) {
                item.remarkClass = (this.data.weRunAuth ? 'step' : 'tap')
                item.remark = (this.data.weRunAuth ? '今日步数 ' + this.data.stepInfo.step : '点击获取微信步数授权')
                item.arrow = false
              }
            })
          })
          this.setData({ menuList: this.data.menuList })
        }).catch(err => console.error(err))
      }).catch(err => uiUtil.error(err, '系统错误，请稍后再试'))
    }
  }
})