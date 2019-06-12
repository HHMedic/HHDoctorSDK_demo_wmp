// components/hh-rightlist.js
Component({
  behaviors: [require('./hhBehaviors.js')],
  /**
   * 组件的属性列表
   */
  properties: {
    product: {
      type: Object,
      value: {},
      observer(newVal, oldVal, changedPath) {
      }
    }


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
    _view(e) {
      var url = e.currentTarget.dataset.url;
      this._viewUrl(url);
    }
  }
})