let self;
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        authList:Object,
    },

    /**
     * 组件的初始数据
     */
    data: {
        duration: 300,
        position: 'bottom',
        round: false,
        overlay: true,
        customStyle: 'min-height:520rpx',
        overlayStyle: '',
        authArr:[
            {icons:'https://imgs.hh-medic.com/icon/wmp/auth/auth-camera.png',text:'摄像头：允许后可视频'},
            {icons:'https://imgs.hh-medic.com/icon/wmp/auth/auth-record.png',text:'语音：允许后可语音沟通'},
            {icons:'https://imgs.hh-medic.com/icon/wmp/auth/auth-position.png',text:'位置：精准匹配线下服务'}
        ]
    },
    lifetimes: {
        attached() {
          self = this;
        },
        detached() {

        }

    },

    /**
     * 组件的方法列表
     */
    methods: {
        //首次三联弹
        bindFirstAuth(){
            this.triggerEvent('isShowAuthTip',false)
            this.getAuthResult('scope.camera')
            this.getAuthResult('scope.record')
            this.getAuthResult('scope.userLocation')
         },
        //  暂不授权
         bindNoAuth(){
            this.triggerEvent('noAuth',false)
         },
         bindHideAuth(){
            this.triggerEvent('isShowAuthTip',false)
         },
        getAuthResult(scope){
            wx.authorize({
                scope: scope,
                success(res) {
                    console.log(scope,res)
                },
                fail(err){
                    console.log(scope,err)

                }
            })

           
        },

    }
})
