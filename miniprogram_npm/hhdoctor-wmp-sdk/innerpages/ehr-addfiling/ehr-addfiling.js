// components/innerpages/ehr-addfiling/ehr-addfiling.js
const app = getApp();
const apis = require("../../utils/api.js");
Page({

    /**
     * 页面的初始数据
     */
    data: {
        chooseImages: [],
        isCheck: true,
        textarea: '',
        isDbClick: true,
        fileList: [],
        list: [{
            isCheck: false,
            title: '提供影像DICOM',
            texts: ['什么是Dicom资料？', '  Dicom是医疗影像设备（X射线、CT、核磁共振、超声等）检查后的图像保存格式', 'Dicom资料如何上传', '  首先选择【提供影像dicom资料】并保存本次档案，然后在电脑上将影像文件放到文件夹内并压缩成.zip或.rar文件，文件名修改为视频医生账号（手机号）+患者姓名', '上传方式', ' 1、电脑打开e.hh-medic.com , ', ' 2、点击档案后面+号选择影像压缩文件并上传', ' 3、上传成功后，30分钟内系统会自动关联您的健康档案', 'Dicom获取方式', ' 1、去医院影像科索要光盘（部分医院需要支付费用购买），然后按照上面步骤上传。', ' 2、如果医院不提供光盘，可以拍摄照片，然后从上面病历资料入口上传照片即可。', '（1）可到医院科室用看片灯观看胶片，然后对着胶片拍照，每张照片只拍摄胶片的4个小画面，确保小画面日期可被清晰显示', '（2）可在家中找一个显示器，然后将显示器调整为纯白色桌面，把胶片放到显示器前拍照，同样每张照片只拍摄4个小画面。'],
        },
        {
            isCheck: false,
            title: '提供病理切片',
            texts: ['病理切片', ' 1、请将病理切片包装好并快递给我司', ' 2、我司完成切片扫描及档案关联后，会把切片寄回给您', ' 地址：北京市东城区东直门来福士大厦7层和缓医疗', ' 收件人：田建浩 15028281602']
        }
        ],
        memberUuid: "",
        nickname: "",
        isAuthCode: false,
        authData: null

    },


    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            memberUuid: options.uuid,
            nickname: options.nickname
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
    //点击上传图片按钮
    bindAddImg: function () {
        let self = this;
        let chooseImages = this.data.chooseImages;
        wx.chooseImage({
            count: 9 - chooseImages.length,
            sizeType: ["compressed"],
            success(res) {
                let tempFiles = res.tempFiles;
                tempFiles.map((item, index) => {
                    self.data.chooseImages.push(item)
                })
                console.log(self.data.chooseImages)
                self.uploadFun();
            }
        })
    },
    //3.1 循环上传图片
    uploadFun: function () {
        let chooseImages = this.data.chooseImages;
        let self = this;
        console.log(chooseImages)
        chooseImages.map((item, index) => {
            if (!item.path_server) {
                self.getUploadImg(chooseImages, index)
            }
        })
    },
    //3.2上传图片
    getUploadImg: function (chooseImages, index) {
        var self = this;
        wx.showLoading({
            title: '上传图片中...',
            icon: 'loading',
            mask: true
        })
        var upload_task = wx.uploadFile({
            url: `${apis.getUploadUrl()}?sdkProductId=8500&userToken=6D8BB8E3EE62162AD1367B2D343870463F0D04F68EA2608F6783B874E4F50EEF`,
            filePath: chooseImages[index].path,
            name: 'uploadFile',
            success: function (res) {
                wx.hideLoading()
                let data = JSON.parse(res.data)
                if (data.status == 200) {
                    chooseImages[index]['path_server'] = data.data
                    self.setData({
                        chooseImages
                    })
                    wx.showToast({
                        title: '图片上传完成'
                    })
                } else {
                    wx.showModal({
                        title: '提示',
                        content: '网络不给力,图片上传未完成',
                        cancelText: false
                    })
                }
            },
            fail: function (e) {
                wx.hideLoading();
                wx.showToast({
                    title: '上传图片失败，建议您检查网络后再试',
                    icon: 'none'
                })
            }
        })
    },
    bindPreviewImg: function () {
        let current = this.data.chooseImages[0].path;
        let chooseImages = this.data.chooseImages;
        let urls = [];
        chooseImages.map((item, index) => {
            urls.push(item.path)
        })
        wx.previewImage({
            current: current, // 当前显示图片的http链接
            urls: urls // 需要预览的图片http链接列表
        })
    },
    //点击展开选项
    bindIsChecked: function (e) {
        let index = e.currentTarget.dataset.index;
        let self = this;
        self.data.list[index].isCheck = !self.data.list[index].isCheck
        this.setData({
            list: self.data.list
        })
    },
    //
    bindTextarea: function (e) {
        this.setData({
            textarea: e.detail.value
        })
    },
    // 保存数据
    bindSubmitSave: function () {
        if (!this.data.chooseImages.length && !this.data.textarea) {
            wx.showToast({
                title: '请上传图片或者填写描述',
                icon: 'none',
                duration: 1000
            })
            return;
        }
        if (this.data.chooseImages.length) {
            this.getImageFomate();//处理图片上传参数
        }
        let params = {
            fileList: this.data.fileList,
            hasDicom: this.data.list[0].isCheck,
            hasPathology: this.data.list[1].isCheck,
            memberUuid: this.data.memberUuid,
            desc: this.data.textarea
        }
        if (getApp()._throttle('addfiling'))return;
        wx.showLoading({ mask: true })
        apis.requestAddEhr(params).then(res => {
            wx.hideLoading();
            if (res.status == 200) {
                wx.navigateBack();
            } else {
                wx.showToast({
                    title: '保存失败',
                    icon: 'none'
                })
            }

        }).catch(err => {
            wx.hideLoading();
            getApp().getCheckNetWork();
        })

    },
    getImageFomate: function () {
        let self = this;
        self.data.chooseImages.map((item, index) => {
            if (item.path_server) {
                self.data.fileList.push(item.path_server)
            }
        })
        console.log(self.data.fileList)
    },
    bindCloseCode() {
        this.setData({
            isAuthCode:false
        })
    },
    //获取授权码登录
    bindGetAuthCode() {
        wx.showLoading({
            mask: true
        })
        apis.requestGetAuthCode().then(res => {
            wx.hideLoading();
            if (res.status == 200) {
                this.setData({
                    authData:res.data,
                    isAuthCode:true
                })

            }
        }).catch(res => {
            wx.hideLoading();
            getApp().getCheckNetWork();
        })
    }

})