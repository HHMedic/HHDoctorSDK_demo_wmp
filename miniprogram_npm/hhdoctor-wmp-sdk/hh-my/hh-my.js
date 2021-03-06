const hhDoctor = require('../hhDoctor.js');
var that;
Component({
  behaviors: [require('../hhBehaviors.js')],
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    _name: 'hh-my',
    primeLevel: 'prime',
    showBeanTip: false,
    user: null,
    product: null,
    productDesc: '',
    vMoney: -1,
    cacheSize: ''
  },
  lifetimes: {
    attached() {
      that = this;
    },
    ready() {
      if ('unreg' != this.data._request.userToken) {
        // wx.showLoading({
        //   title: '加载中...',
        //   mask: true
        // })
        // setTimeout(function () {
        //   wx.hideLoading();
        // }, 3000);
      }
      var info = wx.getSystemInfoSync();
      this.setData({
        sysInfo: info
      })
      this._getCacheSize();
    }
  },
  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function () {
      this._getProductInfo();
    },
    hide: function () { },
    resize: function () { },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    _requestComplete() {
      //this._getProductInfo();
      if ('unreg' == this.data._request.userToken) {
        this._getUnregAcl();
      } else if (this.data._request.autoAcl) {
        this._getUserAcl();
      }
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
    // _viewRight() {
    //   var pageUrl = this.data.basePath + 'innerpages/right?' + this._getPublicRequestParams();
    //   wx.navigateTo({
    //     url: pageUrl,
    //   })
    // },
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
          }
        }
      })
    },

    _getUnregAcl() {
      that.setData({
        '_request.userAcl.showAbout': false,
        '_request.userAcl.showClearCache': false
      })
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

    _getProductInfo() {
      if ('unreg' == this.data._request.userToken) {
        return;
      }
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
              url: this.data.basePath+'innerpages/ehr-family/ehr-family'
          })
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
        },
        complete: function () {
          wx.hideLoading();
        }
      })
    },

    _buyProduct() {
      var pageUrl = this.data.basePath + 'innerpages/buyProduct/buyProduct?' + this._getPublicRequestParams() +
        '&payPage=' + this.data._request.payPage;
      wx.navigateTo({
        url: pageUrl,
      })
    },
    _logoutConfirm() {
      wx.showModal({
        title: '',
        content: '是否立即退出登录?',
        confirmColor:'#0592f5',
        success: function (e) {
          if (e.confirm) {
            that._logout();
          }
        }
      })
    },

    _logout() {
      var url = this._getHost().wmpHost +
        'wmp/logoutWmp?' + this._getPublicRequestParams();
      url = this._appendUrlParams(url);
      wx.request({
        url: url,
        data: {},
        method: 'POST',
        success: function (res) {
          //if (res && res.data && 200 == res.data.status) {
          //成功
          //清理本地缓存
          if (getApp().globalData._hhim) {
            getApp().globalData._hhim.clearCache();
            if (getApp().globalData._hhim.loginStatus()) {
              getApp().globalData._hhim.logout();
            }
          }
          hhDoctor.off('chatMessage');
          getApp().globalData._hhim = null;
          that._triggerEvent('logout', res.data.data);
          /*} else {
            wx.showModal({
              title: '错误',
              content: '暂时无法注销，请稍后再试',
              showCancel: false
            })
          }*/
        },
        fail:function(){
          getApp().getCheckNetWork();
        }
      })
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
      wx.showToast({
        title: '清理完毕'
      })
      that.setData({
        cacheSize: '0 KB'
      })
    },
    _reg() {
      if (!this.data._request.regPage) {
        return;
      }
      wx.navigateTo({
        url: this.data._request.regPage,
      })
    }
  }
})