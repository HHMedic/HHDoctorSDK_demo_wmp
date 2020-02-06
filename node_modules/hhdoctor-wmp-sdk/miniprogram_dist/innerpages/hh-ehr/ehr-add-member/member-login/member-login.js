// components/innerpages/hh-ehr/ehr-add-member/member-login/member-login.js
Component({
  behaviors: ['wx://form-field'],

  /**
   * 组件的属性列表
   */
  properties: {
    name:{
      type:String,
      value:''
    },
    isLoginChecked:{
      type:Boolean,
      value:false
    },
    defaultVal: {
      type: String,
      value: ''
    },
    isedit:{
      type:Boolean,
      value:false
    },
    isAccount:{
      type:Boolean,
      value:false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    value:''
  },
  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function () { 
      this.setData({ value: this.data.defaultVal })
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    bindLoginChecked:function(e){
      this.setData({ isLoginChecked : e.detail.value})
      this.triggerEvent('isLoginChecked', e.detail.value)
    },
    bindLoginInput:function(e){
      this.setData({value:e.detail.value})
    },
    bindLoginBlur:function(e){
      let val = e.detail.value.replace(/\s+/g, '');
      this.setData({value:val})
    },
    bindDisabledModal:function(e){
      let type = e.currentTarget.dataset.type;
      if(this.data.isedit && this.data.isAccount){
        let content = type=='switch'?'请在首页联系你的和缓助理，帮你关闭此成员独立登录功能':'请在首页联系你的和缓助理，帮你修改手机号'
        wx.showModal({
          title: '提示',
          content: content,
          showCancel:false,
          confirmText:'我知道了'
        })
      } else if (this.data.isedit && !this.data.isAccount){
        wx.showModal({
          title: '提示',
          content: '小程序暂不支持在编辑页中创建成员独立登录功能,您可以删除此成员，在重新创建中设置',
          showCancel: false,
          confirmText: '我知道了'
        })
      }
    }
  }
})
