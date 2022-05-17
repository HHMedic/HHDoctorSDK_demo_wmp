const dateUtil = require('../../utils/dateUtil')
Component({
  behaviors: [require('../phaseBehavior.js')],
  properties: {
    order: Object
  },
  data: {
    videoTime: ''
  },
  observers: {
    "order": function (val) {
      console.log(val)
      if (!val || !val.provideTime) return
      let d1 = new Date(val.provideTime), d2 = new Date(val.provideTime + 600000)
      this.setData({
        videoTime: `预计专家${dateUtil.format(d1, 'hh:mm')}-${dateUtil.format(d2, 'hh:mm')}进入`
      })
    }
  },
  lifetimes: {
    attached: function () {
      this.setData({ menuButton: wx.getMenuButtonBoundingClientRect() })
    }
  },
  methods: {
    bindCancel() {
      if (this.throttle('cancel-4')) return;
      this.triggerEvent('cancel')
    },
  }
})
