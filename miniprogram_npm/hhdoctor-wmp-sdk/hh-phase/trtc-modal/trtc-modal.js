// components/hh-phase/trtc-modal/trtc-modal.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        title:{
            type:String,
            value:'提示'
        },
        content:{
            type:String,
            value:''
        },
        showCancel:{
            type:Boolean,
            value:false
        },
        confirmText:{
            type:String,
            value:'我知道了'
        },
        isExitWx:{
            type:Boolean,
            value:false
        },

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
        bindConfirm(){
            wx.navigateBack();
            this.triggerEvent('trtcModalConfirm')
        }
    }
})
