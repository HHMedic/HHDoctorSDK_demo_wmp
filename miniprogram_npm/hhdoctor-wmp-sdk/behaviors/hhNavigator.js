module.exports = Behavior({
  behaviors: [],
  properties: {},
  data: {
  },
  attached: function () { },
  methods: {
    _viewMedicine(drugOrderId, redirectPage) {
      wx.hideLoading().then().catch(err => { })
      getApp().globalData._hhSdkOptions.drugOrderId = drugOrderId;
      getApp().globalData._hhSdkOptions.redirectPage = redirectPage;
      let url = this.data._host.patHost + 'drug/order.html?' +
        'drugOrderId=' + drugOrderId +
        '&payPage=' + encodeURIComponent(this.data.basePath + 'innerpages/pay/pay') +
        '&redirectPage=' + encodeURIComponent(redirectPage ? redirectPage : '/pages/newIndex/newIndex')
      this._viewUrl(url)
    },
    _viewBanerAdv(e){
      let url = e.currentTarget.dataset.url
      this._viewUrl(url);
    },
    _viewMedicineOrderList(redirectPage) {
      if (this._isUnReg(true)) return;
      getApp().globalData._hhSdkOptions.redirectPage = redirectPage;
      let url = this.data._host.patHost + 'drug/order-list.html'
      this._viewUrl(url);
    },
    //查看更多权益
    _viewMoreRightList(e) {
      let host = this.data._host.secHost;
      let url = host + 'hhmy/quanyi/quanyi.html?' +
        'UserToken=' + this.data._request.userToken
      this._viewUrl(url)
      //卡片式权益
      // let index = 0
      // if (e) index = e.currentTarget.dataset.index
      // let url = '/pages/right/right?index=' + index
      // wx.navigateTo({ url })
    },
    _viewAddressList() {
      if (this._isUnReg(true)) return;
      let url = this.data._host.patHost + 'drug/addr-list.html'
      this._viewUrl(url);
    },
    _viewRight(e) {
      var pageUrl = this.data.basePath + 'innerpages/right/right?' + this._getPublicRequestParams();
      let pid = e && e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.pid || ''
      if (pid) pageUrl += ('&pid=' + pid)
      wx.navigateTo({
        url: pageUrl,
      })
    },
    _viewBeanList(e) {
      let url = this.data._host.patHost + 'drug/account.html?drugMoneyType=' + e.currentTarget.dataset.drugMoneyType
      this._viewUrl(url)
    },

    _viewUrl(url) {
      url = this._appendUrlParams(url);
      url = this.data.basePath + 'innerpages/view/view?url=' + encodeURIComponent(url);
      wx.hideLoading().then().catch(err => { })
      wx.navigateTo({ url })
    },
    _viewReLauch(url) {
      url = this._appendUrlParams(url);
      url = this.data.basePath + 'innerpages/view/view?url=' + encodeURIComponent(url);
      wx.reLaunch({ url })

    },
    _buyProduct(productId) {
      if (!this.data._request.payPage) return
      let url = this.data._request.payPage + '?' + this._getPublicRequestParams() + '&name=购买套餐&price=9999&pid=' + productId;
      wx.navigateTo({ url })
    },
    _viewActiveCode(msg) {
      if (this._isUnReg(true)) return;
      //let msg = e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.msg || ''
      let param = 'sdkProductId=' + this.data._request.sdkProductId +
        '&userToken=' + this.data._request.userToken +
        '&openId=' + this.data._request.openId +
        '&profileName=' + this.data._request.profileName +
        '&subDomain=' + this.data._request.subDomain +
        '&source=wmpSdk' +
        '&version=' + this.data._sdkVersion +
        '&activeCodeMsg=' + msg;
      let pageUrl = this.data.basePath + 'innerpages/invitationcode/invitationcode?' + param;
      wx.navigateTo({
        url: pageUrl
      })
    },
    _appendUrlParams(url) {
      url += url.indexOf('?') >= 0 ? '&' : '?'
      url += ('_=' + new Date().getTime() + '&source=wmpSdk');
      url = this._appendParam(url, 'openId', this.data._request.openId)
      url = this._appendParam(url, 'wmpVersion', getApp().globalData.wmpVersion)
      url = this._appendParam(url, 'sdkVersion', this.data._sdkVersion)
      url = this._appendParam(url, 'sdkProductId', this.data._request.sdkProductId)
      url = this._appendParam(url, 'userToken', this.data._request.userToken)
      url = this._appendParam(url, 'wxAppId', getApp().globalData.wxAppId)
      return url;
    },
    _appendParam(url, key, value) {
      if (url.indexOf(key + '=') < 0 && value) url += (`&${key}=${value}`)
      return url
    }
  }
})