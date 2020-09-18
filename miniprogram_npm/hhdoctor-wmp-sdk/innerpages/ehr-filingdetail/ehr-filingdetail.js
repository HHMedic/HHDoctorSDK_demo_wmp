// components/innerpages/ehr-filingdetail/ehr-filingdetail.js
const app = getApp();
const apis = require("../../utils/api.js");
Page({

    /**
     * 页面的初始数据
     */
    data: {
        isConnect:true,
        isTip: true

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            id: options.id,
            memberUuid: options.memberUuid,
            memberUserToken: options.memberUserToken || ''
        })
        console.log(options)
        this.requestGetDetail();
    },
    // 点击病例资料
    bindFilingImg: function (e) {
        let current = e.currentTarget.dataset.imgs[0];
        let urls = e.currentTarget.dataset.imgs;
        wx.previewImage({
            current: current, // 当前显示图片的http链接
            urls: urls // 需要预览的图片http链接列表
        })
    },
    bindCloseTip(){
        this.setData({
            isTip:false
        })
    },
    requestGetDetail: function () {
        let self = this;
        let medicRecordId = this.data.id;
        let memberUuid = this.data.memberUuid;
        wx.showLoading();
        apis.requestGetEhrDetail(medicRecordId, memberUuid, this.data.memberUserToken).then(res => {
            wx.hideLoading();
            if (res.status == 200) {
                self.setData({
                    medicRecord: res.data.medicRecord,
                    patientInfo: res.data.patientInfo,
                    patientId: res.data.patientId,
                    config : res.data.config
                })
                self.setWxTitle(self.data.medicRecord.source)
            }
        }).catch(err=>{
            wx.hideLoading();
        })

    },
    // 设置标题
    setWxTitle: function (val) {
        let title = ''
        switch (val) {
            case 'self':
                title = '自建档案'
                break;
            case 'famDoctor':
                title = '总结详情'
                break;
            case 'expert':
                title = '专家总结'
                break;
        }
        wx.setNavigationBarTitle({
            title //页面标题为路由参数
        })
    },

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

    }
})