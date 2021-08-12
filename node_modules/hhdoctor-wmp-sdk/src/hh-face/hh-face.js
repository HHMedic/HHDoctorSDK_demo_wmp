// components/hh-face/hh-face.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        sysInfo:Object,
        patient:Object,
        parent:Object
    },
    pageLifetimes:{
      show(){
          
      }
    },

    /**
     * 组件的初始数据
     */
    data: {
        faceVerifyType:1,//本人认证 2 投保人帮助认证
        username:'',
        cardid:'',
    },
    lifetimes: {
        // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
        attached: function () {
            console.log(this.data.parent)
            //默认成员登录信息
            this.setData({
                username:this.data.patient.name,
                cardid:this.data.patient.loginname.split(":")[0]
            })
            
         },
        moved: function () { },
        detached: function () { },
      },
    
    

    /**
     * 组件的方法列表
     */
    methods: {
        //关闭人脸识别
        bindCloseFace(){
            this.triggerEvent('closeFace')
        },
        //去认证
        bindFaceVerify(){
            this.triggerEvent('beginFaceVerify',{username:this.data.username,cardid:this.data.cardid})
        },
        bindContinue(){
            this.triggerEvent('continue')
        },
        //协助认证 独立子账号才会显示该按钮
        bindHelpVerify(){
            console.log(this.data)
            //如果是成员登录才会显示协助认证按钮
            //1本人登录 2协助认证
            let data = this.data;
            this.setData({
                faceVerifyType:data.faceVerifyType==1?2:1,
                username:data.faceVerifyType==1?data.parent.name:data.patient.name,
                cardid:data.faceVerifyType==1?data.parent.loginname.split(":")[0]:data.patient.loginname.split(":")[0]
            })
            
            
        }
    }
})
