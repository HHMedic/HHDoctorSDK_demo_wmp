// components/hh-auth/hh-auth.js
let self;
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        authList:Object
    },

    /**
     * 组件的初始数据
     */
    data: {},
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
