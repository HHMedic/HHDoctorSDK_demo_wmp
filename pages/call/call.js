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
      options.style = {
        logoImage: '', //视频通话时左上角logo，支持本地图片和网络图片，如使用网络图片请确保小程序后台已添加图片url域名
        navicationBar: {
          bColor: '#ffffff', //视频界面标题栏背景色
          fColor: '#000000', //视频界面标题栏字体颜色
          text: '视频医生' //视频界面顶部标题
        }
      }
      options.ringtone = 'https://imgs.hh-medic.com/icon/wmp/nokia.mp3'; //自定义铃声url
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