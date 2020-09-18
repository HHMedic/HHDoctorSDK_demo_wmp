// components/innerpages/ehr-addmember/ehr-addmember.js
const app = getApp();
const apis = require("../../utils/api.js");
const hhDoctor = require('../../hhDoctor.js');


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
        relations: "",
        isedit: "",
        isAddEhr: '',
        isIndex: "",
        isUpdate: "",
        item: "",
        showAccount: "",
        pageUrl: "",
        endDate: ""
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options)
        //上一个页面调用接口返回的数据在这个页面要用 - 传参 编辑模式亦需要将数据传过来 布尔值为字符串 没有则不传
        let relationList = options.relationList ? JSON.parse(options.relationList) : [];
        let relations = [];
        relationList.map((item, index) => { relations.push(item.name) })
        let item =  options.item && options.item!='undefined'? JSON.parse(options.item) : null;
        this.setData({
            relationList,
            relations,
            isedit: options.isedit || false, //编辑成员
            isIndex: options.isIndex || false,//首页进入添加成员
            isUpdate: options.isUpdate || false,//首页进入补充成员信息
            isAddEhr: options.isAddEhr || false,//档案库进入
            item,
            showAccount: options.showAccount||false,
            isAccount: item && item.isAccount?item:false,
            pageUrl: options.pageUrl || '',
            endDate: this.formatBirth(Date.now())
        })
        if (options.isUpdate) {
            this.data.memberUuid = options.memberUuid;
            this.getLoadUpdate(item)
        }
        if (options.isedit) {
            this.getLoadEdit(item);
        }
        console.log(this.data.showAccount)
    },
    //只有补全信息 会调用此方法
    getLoadUpdate(item){
        wx.setNavigationBarTitle({ title: '补充成员信息' });
        let genderIdx = (item.sex == '男') ? 0 : (item.sex == '女') ? 1 : -1;
        this.setData({
            inputVal: item.name && item.name !='请完善信息以发起呼叫'?item.name:'',
            genderIdx,
            date: item.birthday?this.formatBirth(item.birthday):''
        })
    },
    //只有编辑 会调用此方法
    getLoadEdit: function (item) {
        wx.setNavigationBarTitle({ title: '编辑家庭成员' })
        this.data.relations.map((i, index) => {
            if (i == item.relation) { this.data.relationIdx = index }
        })
        let genderIdx = (item.sex == '男') ? 0 : (item.sex == '女') ? 1 : -1;
        this.setData({
            memberUuid: item.uuid,
            inputVal: item.name,
            relationIdx: this.data.relationIdx,
            genderIdx,
            date: item.birthday?this.formatBirth(item.birthday):'',
            isLoginChecked: item.isAccount,
            loginname: item.isAccount ? item.loginname.split(":")[0] : ''
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
            loginname:val
        })
    },
    bindLoginBlur: function (e) {
        let val = e.detail.value.replace(/\s+/g, '');
        this.setData({
            loginname:val
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
        if (this.data.isedit && this.data.isAccount) {
            let content = type == 'switch' ? '请在首页联系你的助理，帮你关闭此成员独立登录功能' : '请在首页联系你的助理，帮你修改手机号';
            wx.showModal({
                title: '提示',
                content: content,
                showCancel: false,
                confirmText: '我知道了'
            });
        }
    },

    //form-submit
    bindMemberSubmit: function (e) {
        let member = {
            name: this.data.inputVal,
            gender: this.data.gender[this.data.genderIdx],
            birthday: this.data.date
        }
        if (!this.data.isUpdate) {
            member['relation'] = this.data.relations[this.data.relationIdx]
        }
        if (!member.name) {
            wx.showToast({
                title: '请输入成员姓名',
                icon: 'none'
            })
            return;
        }
        if (!member.relation && !this.data.isUpdate) {
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
        console.log(this.data)
        let saveType = e.detail.target.dataset.type || false;

        // 编辑页或成员列表页首页进入添加成员
        if (this.data.isedit || this.data.isUpdate) {
            this.requestUpdateMember(member, this.data.memberUuid, saveType)
        }
        if (this.data.isIndex || this.data.isAddEhr) {
            this.requestAddUserMember(member, saveType);
        }

    },

    //更新成员信息
    requestUpdateMember: function (member, memberUuid, saveType) {
        wx.showLoading({ mask: true })
        let self = this;
        apis.requestUpdateMember(member, memberUuid).then(res => {
            wx.hideLoading();
            if (res.status == 200) {
                var pageUrl = self.data.pageUrl + '?' + hhDoctor.getPublicParams() + '&dept=600002' + '&uuid=' + memberUuid;
                switch (saveType) {
                    case 'updateCall':
                        wx.redirectTo({
                            url: pageUrl
                        })
                        break;
                    default:
                        if (res.data.isAccount && res.data.loginname) {
                            wx.redirectTo({
                                url: '../ehr-accounttip/ehr-accounttip'
                            });
                        } else {
                            wx.navigateBack();
                        }

                }

            } else {
                wx.showToast({
                    title: res.message,
                    icon: 'none',
                    duration: 1000
                })
            }

        }).catch(err=>{
            wx.hideLoading();
            getApp().getCheckNetWork();
        })
    },
    //添加成员
    requestAddUserMember: function (member, saveType) {
        wx.showLoading({ mask: true });
        apis.requestAddUserMember(member).then(res => {
            wx.hideLoading();
            if (res.status == 200) {
                console.log(this.data.pageUrl, res)
                switch (saveType) {
                    case 'save':
                        wx.redirectTo({
                            url: '/pages/index/index',
                        })
                        break;
                    case 'saveCall':
                        //跳转呼叫页  需修改  
                        var pageUrl = this.data.pageUrl + '?' + hhDoctor.getPublicParams() + '&dept=600002' + '&uuid=' + res.data.uuid;
                        wx.redirectTo({
                            url: pageUrl
                        })
                        break;
                    default:
                        if (res.data.isAccount) {
                            wx.redirectTo({
                                url: '../ehr-accounttip/ehr-accounttip'
                            })
                        } else {
                            wx.navigateBack();
                        }
                }
            } else {
                wx.showToast({
                    title: res.message,
                    icon: 'none',
                    duration: 1000
                })
            }
        }).catch(err=>{
            wx.hideLoading();         
            getApp().getCheckNetWork();
        })
    },

})