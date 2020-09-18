// components/hh-phase/phase-c/phase-c.js
Component({
    behaviors: [require('../phaseBehavior.js'), require('../../hhBehaviors.js')],
  /**
   * 组件的属性列表
   */
  properties: {
	callTips:Object,
	waitTips:Object
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
	bindHangUp(){
        if (getApp()._throttle('hangup-2')) return;
		this.triggerEvent('hangUp') 
	}
  }
})
