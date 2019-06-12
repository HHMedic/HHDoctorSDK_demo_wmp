// pages/call/call.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options) {
      this.setData({
        hhRequest: options
      })
    } else {
      console.error('缺少呼叫参数');
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  onLogin(e) {
    console.log('登录事件,', JSON.stringify(e));
  },

  onHangup(e) {
    console.log('挂断事件,', JSON.stringify(e));
  }

})