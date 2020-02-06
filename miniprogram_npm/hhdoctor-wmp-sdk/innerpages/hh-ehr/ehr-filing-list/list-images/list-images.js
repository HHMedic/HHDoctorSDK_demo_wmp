// components/innerpages/hh-ehr/ehr-filing-list/list-images/list-images.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    imgUrls:{
      type:Array,
      value:''
    },
    name:String
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    //预览图片
    bindFilingImg: function (e) {
      let current = this.data.imgUrls[0];
      let urls = this.data.imgUrls;
      wx.previewImage({
        current: current, // 当前显示图片的http链接
        urls: urls // 需要预览的图片http链接列表
      })
    }

  }
})
