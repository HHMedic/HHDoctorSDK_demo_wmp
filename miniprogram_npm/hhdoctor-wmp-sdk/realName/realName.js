// components/realName/realName.js
const validate = require("../utils/validate.js");
const apis = require('../utils/api.js');
let self;
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        realNameMsg:Object
    },

    /**
     * 组件的初始数据
     */
    data: {
        topVal: '',
        nickname: '',
        username: '',
        useridcard: '',
        userphone: '',
        errorText: '',
        closeReal:true
    },
    lifetimes: {
        // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
        attached: function () {
            self=this;
            this.setData({
                topVal: wx.getSystemInfoSync().safeArea.top,
                userphone:this.data.realNameMsg.phone||'',
                nickname:this.data.realNameMsg.name||''
            })
            console.log(this.data.realNameMsg)

            
        },
        moved: function () { },
        detached: function () { },
    },



    // this.setData({
    //     drugCount:options.drugCount,
    //     drugId:options.drugId,
    //     nickname:options.name||'',
    //     userphone:options.phoneNum||'',
    //     isAuth:options.isAuth,
    //     hasRx:options.hasRx,
    //     informationId:options.informationId,
    //     memberUserToken:options.memberUserToken,
    //     status:self.data.status,
    //     medicRecordId:options.medicRecordId,
    //     buttonName:options.buttonName,
    //     source:options.source,
    //     pageUrl:options.pageUrl||'',
    //     medicationList:options.medicationList?JSON.parse(decodeURIComponent(options.medicationList)):[]
    // })    

    /**
     * 组件的方法列表
     */
    methods: {
        bindClose() {
            this.triggerEvent('closeRealName')
        },
        //获取焦点
        bindFocusMsg(e) {
            self.setData({ errorText: ''})
        },

        // input close
        bindCloseInput(e) {
            console.log('bindclose', e.currentTarget.dataset.type)
            setTimeout(() => {
                switch (e.currentTarget.dataset.type) {
                    case 'username': self.setData({ username: '' })
                        break;
                    case 'useridcard': self.setData({ useridcard: '' })
                        break;
                    case 'userphone': self.setData({ userphone: '' })
                        break;
                }
            }, 50)

            console.log(self.data)
        },
        // 键盘输入时-患者姓名
        bindInputMsgName(e) {
            this.setData({
                username: e.detail.value
            })
        },
        // 键盘输入时-患者身份证号
        bindInputMsgIdCard(e) {
            this.setData({
                useridcard: e.detail.value
            })
        },
        // 键盘输入时 - 联系人电话
        bindInputMsgPhone(e) {
            this.setData({
                userphone: e.detail.value
            })
        },
        //实名认证确认提交
        bindSubmit() {
            if (!self.data.username) {
                self.setData({
                    errorText: '患者真实姓名不能为空'
                })
                return;
            }
            if (!self.data.useridcard) {
                self.setData({
                    errorText: '患者真实身份证号码不能为空'
                })
                return;

            }
            if (!validate.checkIdCardNum(self.data.useridcard)) {
                self.setData({
                    errorText: '患者身份证号输入有误，请重新输入'
                })
                return;
            }
            if (!validate.checkPhoneNum(self.data.userphone)) {
                self.setData({
                    errorText: '联系人电话输入有误，请检查后输入'
                })
                return;
            }
            let data={
                memberUserToken:self.data.realNameMsg.realPatientUserToken,
                username:self.data.username,
                useridcard:self.data.useridcard,
                informationId:self.data.realNameMsg.informationId,
                userphone:self.data.userphone,
                url:self.data.realNameMsg.url
            }

            //保存实名信息
            // memberUserToken, name, idCard, phoneNum
            wx.showLoading({ mask: true })
            console.log(data.url)

            apis.requestSaveIdCard(data.memberUserToken, data.username, data.useridcard, data.informationId, data.userphone).then(res => {
                wx.hideLoading()
                if (res.status == 200) {
                    // //是否够7岁
                    // if (self.getCurrentAge(self.data.useridcard) < 7) {
                    //     wx.showModal({
                    //         title: '',
                    //         showCancel: false,
                    //         confirmText: '我知道了',
                    //         confirmColor: '#0592F5',
                    //         content: '据规定，未满7周岁患者不可开具线上处方，请前往医院购药。',
                    //         success(res) {
                    //             if (res.confirm) {
                    //                 wx.navigateBack()
                    //             }
                    //         }
                    //     })
                    //     return;
                    // }
                    this.triggerEvent('realNameSuccess',{url:data.url})
                } else {
                    self.setData({
                        errorText: res.message
                    })
                }
            }).catch(err => {
                wx.hideLoading();
                wx.showToast({
                  title: err.message||'服务异常',
                  icon:'none'
                })
            })
        },

    }
})
