// components/hh-phase/phase-b/phase-b.js
Component({
    behaviors: [require('../phaseBehavior.js'), require('../../hhBehaviors.js')],
  /**
   * 组件的属性列表
   */
  properties: {
	doctor:Object,
  callTips:Object,
  },
  /**
   * 组件的初始数据
   */
  data: {
      loading:'data:image/png;base64,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'
  },
  /**
   * 组件的方法列表
   */
  methods: {
	bindHangUp(){
        if (getApp()._throttle('hangup-1')) return;
		this.triggerEvent('hangUp') 
	}
  }
})
