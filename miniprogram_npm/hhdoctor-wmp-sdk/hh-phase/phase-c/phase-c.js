// components/hh-phase/phase-c/phase-c.js
Component({
  behaviors: [require('../phaseBehavior.js')],
  /**
   * 组件的属性列表
   */
  properties: {
    callTips: Object,
    waitTips: Object,
    doctor: Object,
    isEnterWaitRoom: Boolean
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
    bindHangUp() {
      if (this.throttle('hangup-2')) return;
      if (!this.data.isEnterWaitRoom) return this.triggerEvent('hangUp')
      wx.showModal({
        title: '',
        content: '确认取消等待，再次进入需重新排队',
        cancelText: '再等一会',
        confirmText: '取消等待',
        confirmColor: '#0592f5'
      }).then(res => {
        if (res.cancel) return
        this.triggerEvent('hangUp')
      }).catch(err => { })
    },
    bindChangeDoctor() {
      if (this.throttle('c-callother')) return;
      wx.showModal({
        title: '',
        content: '确认退出排队，呼叫其他医生？',
        cancelText: '再等一会',
        confirmText: '换医生',
        confirmColor: '#0592f5'
      }).then(res => {
        if (res.cancel) return
        this.triggerEvent('changedoctor')
      }).catch(err => { })
    }
  }
})
