// components/innerpages/ehr-addmember/ehr-addmember.js
const app = getApp();
const apis = require("../../utils/api.js");
const hhDoctor = require('../../hhDoctor.js');
const dateUtil = require('../../utils/dateUtil')
const phoneNumMask = require('../../utils/commonUtil').phoneNumMask
const isMobilePhone = require('../../utils/commonUtil').isMobilePhone
Page({

    /**
     * 页面的初始数据
     */
    data: {
        loginname: '',
        inputVal: '',
        isLoginChecked: false,
        relationList: [],
        gender: ["男", "女"],
        relationIdx: -1,
        genderIdx: -1,
        date: '',
        isAccount: false,
        memberUuid: 0,
        showAccount: "",
        pageUrl: "/pages/room/room",
        endDate: "",
        type: 1,//1 不传则是默认值 正常添加档案成员 2 添加成员并呼叫界面 3 编辑成员(档案库进入) 4 补全信息-（默认为补全并呼叫界面-多人视频不显示呼叫按钮-档案库进入补全则isFilling传入不显示呼叫按钮）
        isInvite: 0,//默认单人视频 多人视频则不显示呼叫保存并呼叫按钮 结合type一起判断
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.hideShareMenu()
        this.setData({
            isInvite: options.isInvite || 0,
            type: options.type && parseInt(options.type) || 1,
            memberUuid: options.memberUuid || 0,
            callPage: hhDoctor.getOptions().callPage,
            isFilling: options.isFilling || false,
            endDate: dateUtil.format(new Date(), 'yyyy-MM-dd')
        })
        console.log(this.data)
        wx.setNavigationBarTitle({ title: options.type == 4 ? '完善信息' : options.type == 3 ? '编辑成员' : '添加成员' });
        this.getMemberList();
    },
    // 获取成员配置信息
    getMemberList() {
        wx.showLoading({
            mask: true
        })
        apis.requestGetMember().then(res => {
            wx.hideLoading();
            if (res.status == 200) {
                let memberList = res.data.memberList;
                let patient = res.data.patient;
                memberList.unshift(patient)
                this.setData({
                    relationList: res.data.relationList,
                    showAccount: res.data.showAccount,
                    showAddBtn: res.data.showAddBtn,
                    memberList,
                    patient
                })
                if (this.data.memberUuid) {
                    let currMember = null;
                    this.data.memberList.map((item, index) => {
                        if (item.uuid == this.data.memberUuid) {
                            currMember = item;
                            this.setData({ currMember })
                        }
                    })
                    this.data.relationList.map((i, index) => {
                        if (i.name == currMember.relation) {
                            this.data.relationIdx = index
                        }
                    })
                    if (currMember && '请完善信息以发起呼叫' == currMember.name) currMember.name = ''
                    this.setData({
                        inputVal: currMember.name,
                        relationIdx: this.data.relationIdx,
                        genderIdx: (currMember.sex == '男') ? 0 : (currMember.sex == '女') ? 1 : -1,
                        date: currMember.birthday ? this.formatBirth(currMember.birthday) : '',
                        isLoginChecked: currMember.isAccount,
                        loginname: currMember.isAccount ? currMember.loginname.split(":")[0] : ''
                    })
                    this.getPhoneNum()
                }
            }

        })

    },
    getPhoneNum() {
        let phoneNum = this.data.currMember.phone_num || '';
        //this.setData({ patientPhone: phoneNumMask(phoneNum), realPatientPhone: phoneNum })
        //不对手机号码脱敏 @housanchun
        this.setData({ patientPhone: phoneNum, realPatientPhone: phoneNum })
    },
    getInitMember() {
        let type = this.data.type;
        wx.setNavigationBarTitle({ title: type == 4 ? '完善信息' : type == 3 ? '编辑成员' : '添加成员' });
    },
    //form-submit
    bindMemberSubmit(e) {
        console.log(e)
        this.data.saveType = e.detail.target.dataset.type;
        let member = {
            name: this.data.inputVal,
            gender: this.data.gender[this.data.genderIdx],
            birthday: this.data.date,
            phoneNum: this.data.realPatientPhone
        }
        // 添加成员
        if (this.data.relationIdx > -1) {
            member['relation'] = this.data.relationList[this.data.relationIdx]['name']
        }
        console.log(member)
        if (!member.name) {
            wx.showToast({
                title: '请输入成员姓名',
                icon: 'none'
            })
            return;
        }
        if ('请完善信息以发起呼叫' == member.name) {
            this.setData({ inputVal: '' })
            wx.showToast({
                title: '请输入成员姓名',
                icon: 'none'
            })
            return;
        }
        if (!member.relation && this.data.relationIdx > -1) {
            wx.showToast({
                title: '请选择与成员关系',
                icon: 'none'
            })
            return;
        }
        if (!member.gender) {
            wx.showToast({
                title: '请选择性别',
                icon: 'none'
            })
            return;
        }
        if (!member.birthday) {
            wx.showToast({
                title: '请选择出生年月',
                icon: 'none'
            })
            return;
        }

        if (this.data.memberUuid == this.data.patient.uuid && !member.phoneNum) {
            wx.showToast({
                title: '请输入电话号码',
                icon: 'none'
            })
            return;
        }
        if (this.data.memberUuid == this.data.patient.uuid && !isMobilePhone(member.phoneNum)) {
            wx.showToast({
                title: '请输入正确的电话号码',
                icon: 'none'
            })
            return;
        }

        if (this.data.isLoginChecked) {
            let loginname = this.data.loginname;
            if (!loginname) {
                wx.showToast({
                    title: '请输入独立登录手机号',
                    icon: 'none'
                })
                return;
            } else if (loginname && !this.checkPhoneNum(loginname)) {
                wx.showToast({
                    title: '请检查手机号是否正确',
                    icon: 'none'
                })
                return;
            }
            member['loginname'] = loginname;
        }
        //补全信息不是自己的时候 不显示独立子账号
        if (!this.data.isLoginChecked && this.data.isInvite == 1) {
            if (this.data.memberUuid != this.data.patient.uuid) {
                wx.showToast({
                    title: '请设置独立子帐号',
                    icon: 'none'
                })
                return;
            }

        }
        switch (parseInt(this.data.type)) {
            case 1:
            case 2:
                this.requestAddUserMember(member);
                break;
            case 4:
                this.requestCompleteMember(member)
                break;
            default:
                this.requestUpdateMember(member)
                break;
        }
    },

    requestCompleteMember(member) {
        wx.showLoading({ mask: true })
        let self = this;
        let memberUuid = this.data.memberUuid;
        apis.requestCompleteMember(member, memberUuid).then(res => {
            wx.hideLoading();
            let title = res.status == 200 ? '更新信息成功' : (res && res.message || '更新信息失败')
            wx.showToast({ title, icon: 'none', mask: true })
            setTimeout(() => {
                if (this.data.saveType == 'save') return wx.navigateBack()
                let url = this.data.callPage + '?' + hhDoctor.getPublicParams() + '&dept=600002' + '&realPatientUuid=' + this.data.memberUuid;
                wx.redirectTo({ url })
            }, 1500)
        }).catch(err => {
            wx.hideLoading();
            getApp().getCheckNetWork();
        })
    },
    //更新成员信息
    requestUpdateMember: function (member) {
        wx.showLoading({ mask: true })
        let self = this;
        let memberUuid = this.data.memberUuid;
        apis.requestUpdateMember(member, memberUuid).then(res => {
            wx.hideLoading();
            if (res.status == 200) {
                if (this.data.saveType == 'save') {
                    // 如果已开通独立子账号
                    if (this.data.currMember && this.data.currMember.isAccount) {
                        wx.navigateBack();
                        return
                    }
                    res.data && res.data.isAccount ? wx.redirectTo({ url: '../ehr-accounttip/ehr-accounttip' }) : wx.navigateBack()
                    if (this.data.memberUuid == this.data.patient.uuid) wx.navigateBack()
                } else {
                    //跳转呼叫页  需修改  
                    var pageUrl = this.data.callPage + '?' + hhDoctor.getPublicParams() + '&dept=600002' + '&realPatientUuid=' + this.data.memberUuid;
                    wx.redirectTo({
                        url: pageUrl
                    })
                }
            } else {
                wx.showToast({
                    title: res.message,
                    icon: 'none',
                    duration: 1000
                })
            }

        }).catch(err => {
            wx.hideLoading();
            getApp().getCheckNetWork();
        })
    },
    //添加成员
    requestAddUserMember: function (member) {
        wx.showLoading({ mask: true });
        apis.requestAddUserMember(member).then(res => {
            wx.hideLoading();
            if (res.status == 200) {
                if (this.data.saveType == 'save') {
                    res.data.isAccount ? wx.redirectTo({ url: '../ehr-accounttip/ehr-accounttip' }) : wx.navigateBack()
                } else {
                    //跳转呼叫页  需修改  
                    var pageUrl = this.data.callPage + '?' + hhDoctor.getPublicParams() + '&dept=600002' + '&realPatientUuid=' + res.data.uuid;
                    wx.redirectTo({
                        url: pageUrl
                    })
                }

            } else {
                wx.showToast({
                    title: res.message,
                    icon: 'none',
                    duration: 1000
                })
            }
        }).catch(err => {
            wx.hideLoading();
            getApp().getCheckNetWork();
        })
    },
    //生日返回的是时间戳需要转化日期格式
    formatBirth: function (t) {
        var date = new Date(t)//一定要记得写这个，不然会报date.getFullYear is not a function
        var year = date.getFullYear()
        var month = date.getMonth() + 1
        var day = date.getDate()
        month = month < 10 ? '0' + month : month;
        day = day < 10 ? '0' + day : day;
        return year + '-' + month + '-' + day
    },

    bindInput: function (e) {

        this.setData({ inputVal: e.detail.value })
    },
    bindBlur: function (e) {
        let val = e.detail.value.replace(/\s+/g, "")
        this.setData({ inputVal: val })
    },
    inputPhoneNum(e) {
        this.setData({ realPatientPhone: e.detail.value })
    },
    bindPickerRelation: function (e) {
        console.log(e)
        let genderIdx = this.data.relationList[e.detail.value]['gender'] == '男' ? 0
            : this.data.relationList[e.detail.value]['gender'] == '女' ? 1 : -1
        this.setData({ relationIdx: e.detail.value, genderIdx });
    },
    bindPickerGender: function (e) {
        this.setData({ genderIdx: e.detail.value })
    },
    bindPickerDate: function (e) {
        this.setData({ date: e.detail.value })
    },
    bindLoginInput: function (e) {
        let val = e.detail.value.replace(/\s+/g, '');
        this.setData({
            loginname: val
        })
    },
    bindLoginBlur: function (e) {
        let val = e.detail.value.replace(/\s+/g, '');
        this.setData({
            loginname: val
        })

    },
    // 接收是否允许成员独立登录
    bindIsLoginChecked: function (e) {
        this.setData({ isLoginChecked: e.detail.value })
    },
    checkPhoneNum: function (phone) {
        if (phone && phone.length == 11) {
            return /^1\d{10}$/.test(phone)
        } else {
            return /^\d{6,10}$/.test(phone)
        }
    },
    bindDisabledModal: function (e) {
        let type = e.currentTarget.dataset.type;
        if ((this.data.type == 3 || this.data.type == 4) && this.data.currMember.isAccount) {
            let content = type == 'switch' ? '请在首页联系你的助理，帮你关闭此成员独立登录功能' : '请在首页联系你的助理，帮你修改手机号';
            wx.showModal({
                title: '提示',
                content: content,
                showCancel: false,
                confirmText: '我知道了'
            });
        }
    },



})