// components/innerpages/hh-ehr/ehr-index/ehr-index.js
const app = getApp();
const apis = require("../../utils/api.js");
const hhDoctor = require("../../hhDoctor.js");


Page({

    /**
     * 页面的初始数据
     */
    data: {
        memberList: [],
        startX: 0, //开始坐标
        startY: 0,
        showAddBtn: "",
        showAccount: "",
        relationList: "",
        isShowModal: false,
        basePath: '/components/',
        modalMsgData: {
            source: 'delMember',
            content: '删除该成员后仍占用成员名额，确定删除吗？',
            confirmText: '确定删除',
            btnChange: true
        },
        userCnt: 0,
        deleteCount: 0,
        isLoading: false,
        isConnect: true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) { },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        let self = this;
        wx.getNetworkType({
            success: (res) => {
              if(res.networkType=='none'){
                self.setData({ isConnect: false})
              }
            }
          })
        this.getMember();
        this.setData({
            userCnt: hhDoctor.getProduct() ? hhDoctor.getProduct().userCnt : 0
        })
        console.log(this.data.userCnt)
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },
    //手指触摸动作开始 记录起点X坐标
    touchstart: function (e) {
        //开始触摸时 重置所有删除
        this.data.memberList.forEach(function (v, i) {
            if (v.isTouchMove) //只操作为true的
                v.isTouchMove = false;
        })

        this.setData({
            startX: e.changedTouches[0].clientX,
            startY: e.changedTouches[0].clientY,
            memberList: this.data.memberList
        })

    },

    //滑动事件处理
    touchmove: function (e) {
        var that = this,
            index = e.currentTarget.dataset.index, //当前索引
            startX = that.data.startX, //开始X坐标
            startY = that.data.startY, //开始Y坐标
            touchMoveX = e.changedTouches[0].clientX, //滑动变化坐标
            touchMoveY = e.changedTouches[0].clientY, //滑动变化坐标

            //获取滑动角度
            angle = that.angle({
                X: startX,
                Y: startY
            }, {
                    X: touchMoveX,
                    Y: touchMoveY
                });

        that.data.memberList.forEach(function (v, i) {
            v.isTouchMove = false

            //滑动超过30度角 return
            if (Math.abs(angle) > 30) return;
            if (i == index) {
                if (touchMoveX > startX) //右滑
                    v.isTouchMove = false
                else //左滑
                    v.isTouchMove = true
            }
        })

        //更新数据
        that.setData({
            memberList: that.data.memberList
        })

    },

    /**
     * 计算滑动角度
     * @param {Object} start 起点坐标
     * @param {Object} end 终点坐标
     */
    angle: function (start, end) {
        var _X = end.X - start.X,
            _Y = end.Y - start.Y
        //返回角度 /Math.atan()返回数字的反正切值
        return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
    },

    //获取成员信息
    getMember: function () {
        wx.showLoading();
        apis.requestGetMember().then(res => {
            wx.hideLoading();
            if (res.status == 200) {
                let memberList = res.data.memberList;
                let patient = res.data.patient;
                memberList.unshift(patient)
                for (var i = 0; i < 10; i++) {
                    this.data.memberList.push({
                        isTouchMove: false //默认隐藏删除
                    })
                }
                this.setData({
                    memberList,
                    showAddBtn: res.data.showAddBtn,
                    showAccount: res.data.showAccount,
                    relationList: JSON.stringify(res.data.relationList),
                    deleteCount: res.data.deleteCount,
                    isLoading:true
                })
            } else {
                wx.showToast({
                    title: res.data.message,
                    icon: 'none',
                    duration: 1000
                })
            }
        }).catch(err=>{
            wx.hideLoading();
        })
    },
    _bindMyConfirm(){
        let self = this;
        self.setData({
            isShowModal:false
        })
        switch (self.data.modalMsgData.source) {
            case 'member':
                let params = '?isUpdate=' + true + '&pageUrl=/pages/room/room' + '&memberUuid=' + self.data.memberUuid + '&item=' + JSON.stringify(self.data.storeMsg);
                wx.navigateTo({
                    url: `/components/innerpages/ehr-addmember/ehr-addmember${params}`
                })
                break;
            case 'addmember': self.navigateAddMember();
                break;
            case 'delmember': self.deleteMember(self.data.memberUuid);
                break;
        }
    },
    //添加家庭成员
    bindAddFimily() {
        if (this.data.userCnt == -1) {
            this.navigateAddMember();
            return;
        }
        let userNum = this.data.userCnt - (this.data.memberList.length - 1) - this.data.deleteCount;
        let modalCon = this.data.deleteCount > 0 ? `还可添加${userNum}成员（删除已添加成员后仍占用名额，已删除${this.data.deleteCount}成员），确定添加吗？` : `还可添加${userNum}成员（删除已添加成员后仍占用名额），确定添加吗？`
        this.setData({
            isShowModal:true,
            modalMsgData: { source: 'addmember', content: modalCon, confirmText: '确定添加' }
        })
    },
    //跳转添加成员
    navigateAddMember() {
        let params = `?relationList=${this.data.relationList}&showAccount=${this.data.showAccount}&isAddEhr=true`;
        wx.navigateTo({
            url: `../ehr-addmember/ehr-addmember${params}`
        });
   
    },
    //编辑家庭成员信息
    bindFillingEdit (e) {
        let item = JSON.stringify(e.currentTarget.dataset.item);
        let params = `?relationList=${this.data.relationList}&showAccount=${this.data.showAccount}&item=${item}&isedit=true`;
        wx.navigateTo({
            url: `../ehr-addmember/ehr-addmember${params}`
        });
    },
    //进入详情页
    bindItemNavigator: function (e) {
        //检查信息是否补全
        if (!this.checkMemberMessage(e.currentTarget.dataset.name, e.currentTarget.dataset.sex, e.currentTarget.dataset.birthday)) {
            this.setData({
                modalMsgData: { source: 'member', content: '请补充该成员的年龄等信息', confirmText: '立即补充' },
                isShowModal: true,
                memberUuid: e.currentTarget.dataset.uuid
            })
            return;
        }
        let uuid = e.currentTarget.dataset.uuid;
        let nickname = e.currentTarget.dataset.nickname;
        wx.navigateTo({
            url: `../ehr-filings/ehr-filings?memberUuid=${uuid}&nickname=${nickname}`,
        })
    },
    //检查成员信息是否补全
    checkMemberMessage(name, sex, birthday) {
        let obj = {}
        obj['birthday'] = birthday;
        obj['name'] = name;
        obj['sex'] = sex;
        this.setData({ storeMsg: obj })
        for (var key in obj) {
            if (obj[key] == '' || !obj[key] || obj[key] == '请完善信息以发起呼叫') {
                return false;
            }
        }
        return true;
    },
    //删除事件
    bindDelete: function (e) {
        let memberUuid = e.currentTarget.dataset.uuid;
        let isself = !e.currentTarget.dataset.isself;
        let isAccount = e.currentTarget.dataset.isaccount;
        let self = this;
        if (isself) {
            wx.showToast({
                title: '您不能删除自己',
                icon: 'none',
                duration: 1000
            })
            return;
        }
        if (isAccount) {
            wx.showModal({
                title: '提示',
                content: '请联系和缓助理删除此成员',
                showCancel: false,
                confirmText: '我知道了'
            });
            return;
        }
        this.setData({
            modalMsgData: { source: 'delmember', content: '删除该成员后仍占用成员名额，确定删除吗？', confirmText: '确定删除' },
            isShowModal:true,
            memberUuid
        })
        

    },
    //删除函数
    deleteMember: function (memberUuid) {
        wx.showLoading({
            mask: true
        })
        let self = this;
        apis.requestDeleteMember(memberUuid).then(res => {
            wx.hideLoading();
            if (res.status == 200) {
                self.getMember();
            } else {
                wx.showToast({
                    title: res.message,
                    icon: 'none'
                })
            }
        })
    }

})