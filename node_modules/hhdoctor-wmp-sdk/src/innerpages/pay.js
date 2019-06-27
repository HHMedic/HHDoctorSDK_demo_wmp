const wxPayUtil = require('../utils/wxPayUtil.js');

var that;
var initTimeout = 0;
var checkHandler;
var kind = 'buy_product';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: '',
    desc: '',
    price: -1,
    famPid: '',
    orderId: '',
    userToken: '',
    sdkProductId: '',
    openId: '',
    wxAppId: '',
    status: 0,
    nextPage: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    that = this;
    initTimeout = 0;
    // this.setData({
    //   name: options.name,
    //   price: options.price,
    //   famPid: options.pid
    // })
    if ('undefined' != typeof(options.name)) {
      this.setData({
        name: options.name
      })
    }
    if ('undefined' != typeof(options.price)) {
      this.setData({
        price: options.price
      })
    }
    if ('undefined' != typeof(options.payMoney)) {
      this.setData({
        price: options.payMoney
      })
    }
    if ('undefined' != typeof(options.pid)) {
      this.setData({
        famPid: options.pid
      })
    }
    if ('undefined' != typeof(options.orderId)) {
      this.setData({
        orderId: options.orderId
      })
    }

    if ('undefined' != typeof(options.desc)) {
      this.setData({
        desc: options.desc
      })
    }
    if ('undefined' != typeof(options.userToken)) {
      this.setData({
        userToken: options.userToken
      })
    }
    if ('undefined' != typeof(options.openId)) {
      this.setData({
        openId: options.openId
      })
    }
    if ('undefined' != typeof(options.sdkProductId)) {
      this.setData({
        sdkProductId: options.sdkProductId
      })
    }
    if ('undefined' != typeof(options.nextPage)) {
      this.setData({
        nextPage: options.nextPage
      })
    }

    checkHandler = setInterval(function() {
      //未登录用户
      if (!that.data.userToken || !that.data.sdkProductId) {
        console.error('请传入userToken和sdkProductId参数');
        clearInterval(checkHandler);
        checkHandler = null;
        wx.navigateBack({
          delta: 1
        })
        return;
      }

      if (that.checkParams()) {
        clearInterval(checkHandler);
        checkHandler = null;
        that.pay();
      }
      initTimeout += 500;
      if (initTimeout > 3000) {
        clearInterval(checkHandler);
        checkHandler = null;
        wx.showModal({
          title: '支付失败',
          content: '请稍候再试',
          showCancel: false,
          success: function() {
            wx.navigateBack({
              delta: 1
            })
          }
        })
      }
    }, 500)
  },

  checkParams() {
    var accoutInfo = wx.getAccountInfoSync();
    this.setData({
      wxAppId: accoutInfo.miniProgram.appId
    })

    if (!this.data.openId) {
      return false;
    }

    if (this.data.name &&
      this.data.price &&
      this.data.famPid) {
      kind = 'buy_product';
      return true;
    } else {
      if (this.data.orderId) {
        kind = 'buy_drug';
        return true;
      }
    }
    return false;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    if (launchOpts && 1037 == launchOpts.scene) {
      //从其他小程序跳转
      var extData = {
        success: paySuccess
      }
      wx.navigateBackMiniProgram({
        extraData: extData,
        success: function(res) {
          console.log('wx.navigateBackMiniProgram succes');
        }
      })
      return;
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  pay() {
    var url = getApp().globalData._hhSdkOptions._host.wmpHost + 'pay/buyProduct' +
      '?famPid=' + this.data.famPid +
      '&wxAppId=' + this.data.wxAppId +
      '&openId=' + this.data.openId;
    if (this.data.userToken) {
      url += ('&userToken=' + this.data.userToken);
    }
    if (this.data.sdkProductId) {
      url += ('&sdkProductId=' + this.data.sdkProductId);
    }
    if (this.data.orderId) {
      url += ('&orderId=' + this.data.orderId);
    }
    url += '&kind=' + kind;
    this.doPrepay(url);
  },

  doPrepay(url) {
    wx.request({
      url: url,
      data: {},
      method: 'POST',
      success: function(res) {
        if (res && res.data && 200 == res.data.status) {
          //成功
          if (!res.data.data ||
            !res.data.data.result ||
            !res.data.data.result.tn) {
            //判断是否为0元
            if (0 == that.data.price) {
              that.zeroPay();
            } else {
              wx.showModal({
                title: '支付失败',
                content: '暂时无法使用微信支付，请稍后再试',
                showCancel: false,
                success: function() {
                  wx.navigateBack({
                    delta: 1
                  })
                }
              })
            }
            return;
          }
          var tn = JSON.parse(res.data.data.result.tn);
          that.doWxPay(tn);
        } else {
          //失败
          wx.showModal({
            title: '支付失败',
            content: '暂时无法使用微信支付，请稍后再试',
            showCancel: false,
            success: function() {
              wx.navigateBack({
                delta: 1
              })
            }
          })
        }
      },
      fail: function() {
        //服务器错误
        wx.showModal({
          title: '支付失败',
          content: '暂时无法使用微信支付，请稍后再试',
          showCancel: false
        })
        wx.navigateBack({
          delta: 1
        })
      }
    })
  },

  zeroPay() {
    wx.showModal({
      title: '支付完成',
      content: '订单支付成功',
      showCancel: false,
      success: function() {
        that.naviToNextPage(true);
      }
    })
  },

  doWxPay(tn) {
    wxPayUtil.pay({
      prePayId: tn.prepayid,
      nonce: tn.nonceStr,
      //host: '',
      data: {
        appId: this.data.wxAppId
      },
      success: function(res) {
        console.log('pay success');
        that.naviToNextPage(true);
      },
      fail: function() {
        wx.hideLoading();
        wx.showModal({
          title: '支付失败',
          content: '支付出现问题或已取消，请稍后再试',
          showCancel: false,
          success: function() {
            that.naviToNextPage(false);
          }
        })
      }
    })
  },

  naviToNextPage(paySuccess) {
    if (paySuccess) {
      var page = getApp().globalData._hhSdkOptions.redirectPage;
      if (!page) {
        page = '/pages/index/index';
      }
      if (page.indexOf('?') >= 0) {
        page += ('&paySuccess=true');
      } else {
        page += ('?paySuccess=true');
      }
      wx.redirectTo({
        url: page
      })
    } else {
      wx.navigateBack({
        delta: 1
      })
    }
  }
})