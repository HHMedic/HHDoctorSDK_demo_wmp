// components/hh-phase/phase-e/phase-e.js
Component({
    behaviors: [require('../phaseBehavior.js'), require('../../hhBehaviors.js')],
  /**
   * 组件的属性列表
   */
  properties: {
  doctor:Object,
  order:Object,
  isInvite:{
    type:Number,
    value:0
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
	  bindHangUp(){
          if (getApp()._throttle('hangup-4')) return;
	  	this.triggerEvent('hangUp') 
	  },
	  bindAccept(){
          if (getApp()._throttle('accept-4')) return;
		  this.triggerEvent('accept') 
	  }

  }
})
