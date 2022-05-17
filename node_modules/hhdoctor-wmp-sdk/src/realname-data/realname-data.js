// components/realname-data/realname-data.js
const validate = require("../utils/validate.js")
//let this;
let dataMap = {
    username: '患者真实姓名',
    idcard: '患者身份证号',
    phone: '患者手机号',
    guardian_username: '监护人真实姓名',
    guardian_idcard: '监护人身份证号',
    guardian_phone: '监护人手机号'
}
Component({
    properties: {
        hasRx: Boolean,
        memberName: String
    },
    data: {
        isGuardian: false,//默认不展示监护人
        data: {},
    },
    pageLifetimes: {
        // 组件所在页面的生命周期函数
        show: function () {
            //this = this
        },
        hide: function () { },
        resize: function () { },
    },

    methods: {
        bindInputData(e) {
            let [name, value] = [e.detail.name, e.detail.value]
            this.data.data[name] = value
            this.setData({
                data: this.data.data
            })
            if (value) this.setData({ errorText1: '', errorText2: '' })
            switch (name) {
                case 'username': this.setData({ errorText1: '' })
                    break
                case 'idcard':
                    if (validate.checkIdCardNum(value)) {
                        this.getAgeLessSeven(this.getCurrentAge(value))
                    } else {
                        this.setData({ isGuardian: false, errorTex2: '' })
                    }
                    break
                case 'phone':
                    if (validate.checkPhoneNum(value)) {
                        this.setData({ errorText1: '' })
                    }
                    break
                case 'guardian_idcard':
                    if (validate.checkIdCardNum(value)) {
                        this.getAgeLessEighteen(this.getCurrentAge(value))
                    }
                    break
                case 'guardian_username': this.setData({ errorText2: '' })
                    break
                case 'guardian_phone':
                    if (validate.checkPhoneNum(value)) {
                        this.setData({ errorText2: '' })
                    }
                    break;
            }
        },
        //失去焦点
        bindBlurMsg(e) {
            let [name, value] = [e.detail.name, e.detail.value]
            if (value) {
                switch (name) {
                    case 'username': this.setData({ errorText1: '' })
                        break;
                    case 'idcard':
                        this.setData({ errorText1: validate.checkIdCardNum(value) ? '' : '患者身份证号输入有误，请重新输入' })
                        break;
                    case 'phone':
                        this.setData({ errorText1: validate.checkPhoneNum(value) ? '' : '患者手机号输入有误，请重新输入' })
                        break;
                    case 'guardian_username': this.setData({ errorTex2: '' })
                        break;
                    case 'guardian_idcard':
                        if (validate.checkIdCardNum(value)) this.getAgeLessEighteen(this.getCurrentAge(value))
                        else this.setData({ errorText2: '监护人身份证号输入有误，请重新输入' })
                        break;
                    case 'guardian_phone':
                        this.setData({ errorText2: validate.checkPhoneNum(value) ? '' : '监护人手机号输入有误，请重新输入' })
                        break;
                }
            } else {
                //字段值为空
                console.log()
                if ('username' == name || 'idcard' == name || ('phone' == name && !this.data.isGuardian)) this.setData({ errorText1: dataMap[name] + '不能为空，请输入' })
                else this.setData({ errorText2: dataMap[name] + '不能为空，请输入' })
            }
        },
        //就诊人 - 小于7周岁 处方药不可购买 非处方药需要填写监护人信息
        getAgeLessSeven(age) {
            if (age < 7) {
                if (this.data.hasRx) {
                    wx.showModal({
                        title: '',
                        showCancel: false,
                        confirmText: '我知道了',
                        confirmColor: '#0592F5',
                        content: '互联网复诊不得为7周岁以下儿童开具处方药，请前往医院购药。',
                        success(res) {
                            if (res.confirm) {
                                wx.navigateBack()
                            }
                        }
                    })
                } else {
                    this.setData({ isGuardian: true })
                }
                return
            }
            this.setData({ isGuardian: false })

        },
        //监护人 - 小于18周岁的判定
        getAgeLessEighteen(age) {
            this.setData({
                errorText2: age < 18 ? '监护人须年满18周岁' : ''
            })
        },
        //获取当前年龄
        getCurrentAge(idcard) {
            let now = new Date();
            var month = now.getMonth() + 1;
            var day = now.getDate();
            var age = now.getFullYear() - idcard.slice(6, 10) - 1;
            if (idcard.substring(10, 12) < month || idcard.substring(10, 12) == month && idcard.substring(12, 14) <= day) age++;
            return age;
        },
        submitValidate() {
            let data = this.data.data;
            if (!data['username'])
                return this.setData({ errorText1: '患者真实姓名不能为空，请输入' })
            if (!data['idcard'])
                return this.setData({ errorText1: '患者身份证号不能为空，请输入' })
            if (!validate.checkIdCardNum(data['idcard']))
                return this.setData({ errorText1: '患者身份证号输入有误，请重新输入' })
            this.getAgeLessSeven(this.getCurrentAge(data['idcard']))
            if (!this.data.isGuardian && !data['phone'])
                return this.setData({ errorText1: '患者手机号不能为空，请输入' })
            if (!this.data.isGuardian && !validate.checkPhoneNum(data['phone']))
                return this.setData({ errorText1: '患者手机号输入有误，请重新输入' })

            if (this.data.isGuardian) {
                if (!data['guardian_username'])
                    return this.setData({ errorText2: '监护人真实姓名不能为空，请输入' })
                if (!data['guardian_idcard'])
                    return this.setData({ errorText2: '监护人身份证号不能为空，请输入' })
                if (!validate.checkIdCardNum(data['guardian_idcard']))
                    return this.setData({ errorText2: '监护人身份证号输入有误，请重新输入' })
                if (this.getCurrentAge(data['guardian_idcard']) < 18)
                    return this.setData({ errorText2: '监护人须年满18周岁' })
                if (!data['guardian_phone'])
                    return this.setData({ errorText2: '监护人手机号不能为空，请输入' })
                if (!validate.checkPhoneNum(data['guardian_phone']))
                    return this.setData({ errorText2: '监护人手机号输入有误，请重新输入' })
            }
            return this.getReturnData(data)
        },
        getReturnData(data) {
            return this.data.isGuardian ? data : { username: data['username'], idcard: data['idcard'], phone: data['phone'] }
        },
        clearData() {
            this.selectAllComponents('.input-item').forEach(item => {
                item && item.clearData()
            })
        }
    }
})
