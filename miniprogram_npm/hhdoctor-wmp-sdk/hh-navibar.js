var that;
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    text: {
      type: String,
      value: ''
    },
    color: {
      type: String,
      value: '#000'
    },
    backgroundColor: {
      type: String,
      value: '#fff'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    customNavBar: false,
    topHeight: 0
  },
  lifetimes: {
    attached() {
      that = this;

    },
    ready() {
      
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    
    _resize() {
      var res = wx.getSystemInfoSync();
      //var rect = wx.getMenuButtonBoundingClientRect();
      let rect = {
        bottom: 58,
        height: 32,
        left: 278,
        right: 365,
        top: 26,
        width: 87
      }
      try {
        rect = wx.getMenuButtonBoundingClientRect();
      } catch (e) {}
      var paddingTop = rect.top - 26;
      this.setData({
        topHeight: paddingTop
      })

      if (res && res.screenHeight && res.windowHeight &&
        res.screenHeight == res.windowHeight) {
        console.log(this.data.text + ':显示自定义导航栏');
        this.setData({
          customNavBar: true
        })
        this.triggerEvent('navbarresize', {
          height: 64 + paddingTop
        }, {})
      } else {
        this.triggerEvent('navbarresize', {
          height: paddingTop
        }, {})
      }
    },
    _naviBack() {
      this.triggerEvent('naviback', {}, {});
    }
  }
})