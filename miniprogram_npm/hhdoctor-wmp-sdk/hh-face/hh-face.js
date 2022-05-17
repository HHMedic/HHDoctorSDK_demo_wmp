// components/hh-face/hh-face.js
const validate = require("../utils/validate.js")
const customApis = require('../utils/customApi.js')
const throttle = require('../utils/commonUtil').throttle
Component({
    properties: {
        sysInfo: Object,
        patient: Object,
        parent: Object,
        showSkipFace:Boolean
    },
    pageLifetimes: {
        show() {}
    },
    data: {
        isSelfFaceType: true,//true 本人认证 false 投保人帮助认证
        username: '',
        idCard: '',
        whiteName:'',
    },
    lifetimes: {
        // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
        attached: function () {
            console.log(this.data)
            this.changeFaceData()
        },
        moved: function () { },
        detached: function () { },
    },
    methods: {
        changeFaceData() {
            let patient = this.data.patient
            let parent = this.data.parent
            let sdkProductId = patient.sdkProductId
            let userExtra = patient.userExtra || {}
            let username = ''
            let idCard = ''
            let whiteName = ''
            // 本人认证/帮助认证
            if(this.data.isSelfFaceType){
                idCard = sdkProductId==10182?patient.loginname.split(":")[0]:patient.cardInfo
                username = patient.realName
                whiteName = parent?parent.realName:userExtra.guardianName?userExtra.guardianName:''
            }else{
                username = parent?parent.realName:userExtra.guardianName?userExtra.guardianName:''
                idCard = parent?(sdkProductId==10182?parent.loginname.split(":")[0]:parent.cardInfo):userExtra.guardianCardInfo?userExtra.guardianCardInfo:'',
                whiteName = patient.realName
            }
            this.setData({
                isSelfFaceType:this.data.isSelfFaceType,
                username,
                idCard,
                whiteName
            })
        },
        
        //关闭人脸识别
        bindCloseFace() {
            this.triggerEvent('closeFace')
        },
        //去认证
        bindFaceVerify() {
            this.triggerEvent('beginFaceVerify', { username: this.data.username, idCard: this.data.idCard })
        },
        //跳过人脸-可配
        bindContinue() {
            this.triggerEvent('continue')
        },
        //协助认证 独立子账号才会显示该按钮
        bindHelpVerify() {
            this.data.isSelfFaceType = !this.data.isSelfFaceType
            this.changeFaceData()
        },
        throttle(btn, wait) {
            return throttle(btn, wait)
        },
        // bindInputData(e){
        //     let value = e.detail.value.trim()
        //     this.setData({idCard : value , errorText:''})
        // },
        // bindBlurMsg(e){
        //     let value = e.detail.value.trim()
        //     if(value){
        //         this.setData({
        //             errorText : validate.checkIdCardNum(value)?'':'身份证号输入有误，请检查重新输入'
        //         })
        //     }
        // },
        //人保未实名用户-点击下一步保存信息
        // bindSaveIdCard() {
        //     if (this.throttle('faceSaveIdCard')) return;
        //     if (!validate.checkIdCardNum(this.data.idCard)) {
        //         this.setData({
        //             errorText :'身份证号输入有误，请检查重新输入'
        //         })
        //         return
        //     }
        //     let phone = this.data.patient.phone_num ||''
        //     let data = {
        //         username : this.data.username,
        //         phoneNum : phone == 'undefined'?'':phone,
        //         memberUserToken : this.data.patient.userToken,
        //         idCard : this.data.idCard
        //     }
        //     this.getSaveIdCard(data)
        // },
        //保存实名信息
        // getSaveIdCard(data) {
        //     return new Promise((resolve, reject) => {
        //         if (!data) {
        //             resolve()
        //             return
        //         }
        //         wx.showLoading({mask:true})
        //         let host =  getApp().globalData._hhSdkOptions._host.wmpHost
        //         let result = [data['username'],data['idCard'],data['phoneNum'],data['memberUserToken']]
        //         customApis.REQUESTPOSTCUS(host, customApis.APIURLS.saveFaceIdCard, ...result).then(res => {
        //             this.setData({isAuth : true})
        //             wx.hideLoading()
        //             resolve()
        //         }).catch(err => {
        //             wx.hideLoading()
        //             if(err.errMsg && err.errMsg.indexOf('fail')!=-1){
        //                 wx.showToast({
        //                   title: '网络连接失败',
        //                   icon:'none',
        //                   duration:3000
        //                 })
        //             }
        //             if(err.status == 400){
        //                 this.setData({
        //                     errorText : err.message || '服务异常'
        //                 })
        //             }
        //             reject(err)
        //         })
        //     })
        // },
    }
})
