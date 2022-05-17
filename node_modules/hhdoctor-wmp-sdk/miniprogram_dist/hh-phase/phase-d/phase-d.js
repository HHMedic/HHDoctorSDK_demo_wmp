// components/hh-phase/phase-d/phase-d.js
const apis = require('../../utils/api.js')
const dateUtil = require('../../utils/dateUtil.js')
const hhDoctor = require('../../hhDoctor.js');
const uiUtil = require('../../utils/uiUtil')
const commonUtil = require('../../utils/commonUtil')
let self;
let uploadTask;
let start;
const pageStatusEnum = {
  HIDDEN: 0,   //隐藏半屏
  AUTH: 1,     //显示实名
  MEMBERS: 2   //显示成员
}
Component({
  behaviors: [require('../phaseBehavior')],
  /**
   * 组件的属性列表
   */
  properties: {
    doctor: Object,
    cameraTorch: Boolean,
    order: Object,
    videoTime: String,
    videoTimeSeconds: Number,
    systeminfo: Object,
    isAuth: {
      type: Boolean,
      value: true
    },
    patientUuid: Number,
    patientUserToken: String,
    patientName: String,
    request: Object,
    remoteUserCount: Number
  },

  /**
   * 组件的初始数据
   */
  data: {
    isCertificate: false,
    isEnterCamera: false,
    isExpand: false,
    chooseImages: [],
    uploadImages: ['https://imgfamily.hh-medic.com/family/20200709/8ad4a29a2c3342dd9689a2f4e9fa0949.jpg'],
    isPreviewPhoto: false,
    photoIdx: 0,
    systeminfo: null,
    setWidth: '',
    setHeight: '',
    isClickCamera: false,
    menuButton: {},
    pageStatus: pageStatusEnum.HIDDEN,
    pageStatusEnum,
    showMoreSize: {},
    isAccount: false
  },
  ready() {
    self = this;
    wx.getSystemInfo({
      success: function (systeminfo) {
        self.data.systeminfo = systeminfo;
      }
    });
    this.setData({ menuButton: wx.getMenuButtonBoundingClientRect(), isAccount: hhDoctor.getIsAccount() })

    //commonUtil.getViewSize('#d-showmore', this).then(res => { this.setData({ showMoreSize: res }) }).catch(err => { })
  },

  /**
   * 组件的方法列表
   */
  methods: {

    //挂断
    bindHangUp() {
      if (this.throttle('hangup-3')) return;
      this.triggerEvent('hangUp')
    },
    //切换上下箭头
    bindArrow() {
      commonUtil.getViewSize('#d-showmore', this).then(res => {
        this.setData({ showMoreSize: res })
        this.setData({ isExpand: !this.data.isExpand })
      }).catch(err => this.setData({ isExpand: !this.data.isExpand }))
      //this.setData({ isExpand: !this.data.isExpand })
    },
    //预览证书
    _bindPreviewCertificate() {
      self.requestRtcLog('1', 'user preview certificate', self.data.id);
      this.setData({
        isCertificate: !this.data.isCertificate
      })
    },
    //切换闪光灯
    bindFlashIcon() {
      if (this.throttle('toggleTorch')) return;
      this.triggerEvent('toggleTorch')
    },
    //切换摄像头
    bindChangeCamera() {
      if (this.throttle('change-camera')) return;
      this.triggerEvent('changeCamera')
    },
    bindInvite(e) {
      if (this.throttle('invite')) return;
      console.log('>>> bindInvite:', self.data.doctor)
      this.triggerEvent('invite', {
        userToken: e.currentTarget.dataset.userToken,
        orderId: self.data.order.orderid,
        doctorId: self.data.doctor.doctorid,
        caller: self.data.order.patientUuid,
        callerUserToken: self.data.request.userToken,
      })
      this.hidePage()
    },
    // 隐藏拍照弹窗
    bindCancel() {
      self.requestRtcLog('1', 'user click cancel camera', self.data.order.orderid);
      this.setData({
        isClickCamera: false
      })
    },
    //点击拍照按钮谈出弹窗

    bindCamera() {
      self.requestRtcLog('1', 'user click camera：' + this.data.isClickCamera ? '显示选择相册相机弹窗' : '隐藏选择相册相机弹窗', self.data.order.orderid);
      this.setData({
        isClickCamera: !this.data.isClickCamera
      })

    },
    bindUserImage(e) {
      let type = e.currentTarget.dataset.photo;
      if (getApp()._throttle('camera-' + type)) return;
      self.triggerEvent('enterCamera', type)
      this.setData({
        isClickCamera: false
      })
      // self.joinCameraFun(type)

    },

    //外部调用了
    joinCameraFun(type) {
      console.log('进入相册chooseImage')
      self.requestRtcLog('1', '进入相册', self.data.order.orderid);
      wx.chooseImage({
        count: 3,
        sizeType: ['original', 'compressed'],
        sourceType: [type],
        success(res) {
          self.requestRtcLog('1', 'chooseImage success', self.data.order.orderid);
          let chooseImages = self.data.chooseImages.concat(res.tempFiles);
          self.setData({
            chooseImages
          })
          self.uploadFun(res.tempFiles);
        },
        fail: function (res) {
          self.requestRtcLog('1', 'chooseImage fail', self.data.order.orderid);
        },
        complete: function (res) {
          self.requestRtcLog('1', 'chooseImage complete', self.data.order.orderid);
          self.triggerEvent('completeCamera')
          wx.setKeepScreenOn({ keepScreenOn: true })

        },
      })
    },


    //循环上传图片
    uploadFun(chooseImages) {
      chooseImages.map((item, index) => {
        if (!item.path_server) {
          self.getUploadImg(item.path, self.data.chooseImages.length - chooseImages.length + index);
        }
      });
    },
    getUploadImg(path, index) {
      wx.showLoading()
      self.requestRtcLog('1', 'chooseImage uploadImg start', self.data.order.orderid);
      uploadTask = wx.uploadFile({
        url: apis.getRtcUploadUrl(),
        filePath: path,
        name: 'uploadFile',
        success: function (res) {
          wx.hideLoading()
          let data = JSON.parse(res.data)
          if (data.status == 200) {
            self.requestRtcLog('1', 'chooseImage uploadImg success:' + data.data, self.data.order.orderid);
            self.data.chooseImages[index]['path_server'] = data.data;
            self.getAddAttatch(data.data)
            self.setData({
              chooseImages: self.data.chooseImages
            })
            wx.showToast({
              title: '图片已发送给医生',
              icon: 'none',
              duration: 1000
            })
            console.log(self.data.chooseImages)
          } else {
            self.data.chooseImages.sclice(index, 1)
            self.setData({
              chooseImages: self.data.chooseImages,
            })
          }
        },
        fail: function (e) {
          wx.hideLoading()
          self.requestRtcLog('1', 'chooseImage uploadImg fail', self.data.order.orderid);
          self.data.chooseImages.sclice(index, 1)
          self.setData({
            chooseImages: self.data.chooseImages,
          })
        }
      })
    },
    getAddAttatch(url) {
      let params = `?famOrderId=${self.data.order.orderid}&url=${url}`
      apis.requestAddAttatch(params).then(res => {
        if (res.status == 200) {
          self.requestRtcLog('1', 'user click:add attatch success:' + url, self.data.order.orderid)
        }
      })
    },
    bindClosePreviewPhotos() {
      self.requestRtcLog('1', 'user click close preview photos', self.data.order.orderid);
      self.setData({
        isPreviewPhoto: !self.data.isPreviewPhoto
      })
    },
    bindPreviewPhotos() {
      self.requestRtcLog('1', 'user click preview photos', self.data.order.orderid);
      let uploadImages = [];
      self.data.chooseImages.map((item, index) => {
        uploadImages.push(item.path_server)
      })
      self.setData({
        uploadImages,
        isPreviewPhoto: !self.data.isPreviewPhoto
      })
    },
    //图片加载完成
    bindImagesLoad(e) {
      console.log(e)
      let systeminfo = self.data.systeminfo;
      let sWidth = systeminfo.screenWidth;
      let sHeight = systeminfo.screenHeight;
      let imgWidth = e.detail.width;
      let imgHeight = e.detail.height;
      let setWidth = imgWidth >= imgHeight ? '100%' : Math.floor(imgWidth / (imgHeight / sHeight)) + 'px';
      let setHeight = imgWidth >= imgHeight ? 'auto' : (Math.floor(imgHeight / (imgWidth / sWidth)) >= sHeight ? '100%' :
        Math.floor(imgHeight / (imgWidth / sWidth)) + 'px');
      self.setData({ setWidth, setHeight })
      wx.hideLoading();
    },
    previewPre() {
      if (this.data.uploadImages.length > 1) {
        this.data.photoIdx--
        if (this.data.photoIdx < 0) {
          this.setData({
            photoIdx: this.data.uploadImages.length - 1
          })
        }
        this.setData({
          photoIdx: this.data.photoIdx
        })
      }

    },
    previewNext() {
      if (this.data.uploadImages.length > 1) {
        this.data.photoIdx++
        if (this.data.photoIdx > this.data.uploadImages.length - 1) {
          this.data.photoIdx = 0
        }
        this.setData({
          photoIdx: this.data.photoIdx
        })
      }
    },
    // 下面主要模仿滑动事件
    touchstart: function (e) {
      start = e.changedTouches[0];
    },

    touchend: function (e) {
      this.getDirect(start, e.changedTouches[0]);
    },

    // 计算滑动方向
    getDirect(start, end) {
      if (!start || !end) return;
      var X = end.pageX - start.pageX,
        Y = end.pageY - start.pageY;
      if (Math.abs(X) > Math.abs(Y) && X > 0) {
        console.log("left 2 right 右边");
        this.previewPre()
      } else if (Math.abs(X) > Math.abs(Y) && X < 0) {
        console.log("right 2 left 左边");
        this.previewNext()
      }
    },
    bindIndexChangeDoctor() {
      if (self.throttle('change-doctor')) return;
      self.requestRtcLog('1', 'user click change doctor', self.data.order.orderid);
      this.triggerEvent('changeDoctor')
    },
    // hideRealname() {
    // 	this.setData({ showAuth: false })
    // 	if (!this.properties.isAuth) self.sendRealNameStatus(2)
    // },
    hidePage() {
      uiUtil.hideLoading()
      let status = this.data.pageStatus
      this.setData({ pageStatus: pageStatusEnum.HIDDEN })
      if (status == pageStatusEnum.AUTH && !this.properties.isAuth) self.sendRealNameStatus(2)
    },

    showRealname() {
      self.setData({ isAuth: false, pageStatus: pageStatusEnum.AUTH })
      self.sendRealNameStatus(3)
    },
    commitRealname() {
      let realName = this.selectComponent('#realname')
      let data = realName.submitValidate()
      console.log('>>> commitRealname', data)
      if (!data) return
      let medicUtil = require('../../utils/medicUtil')
      medicUtil.saveIdCard(data, this.properties.patientUserToken, 'call')
        .then(res => {
          self.setData({ isAuth: true })
          self.sendRealNameStatus(1)
          self.setData({ pageStatus: pageStatusEnum.HIDDEN })
          realName.clearData()
        })
        .catch(err => {
          uiUtil.error(err, '网络不给力，请稍后再试')
          self.sendRealNameStatus(2)
        })
    },
    sendRealNameStatus(certificationState) {
      let orderId = self.data.order.orderid, msgData = {
        command: 'user_certification',
        uuid: this.properties.patientUuid || hhDoctor.getUserId(),
        certificationState
      }
      hhDoctor.sendMessage(self.data.doctor.login.uuid, msgData, orderId).then(res => {
        console.log('发消息成功', this.properties.patientUuid, msgData)
        self.requestRtcLog('1', 'sendMessage success:user_certification,certificationState:' + certificationState, self.data.order.orderid);
      }).catch(err => {
        console.error('发消息失败', err);
      })
    },
    getMembers() {
      if (this.data.memberList && this.data.memberList.length) {
        this.showMembers()
      } else {
        uiUtil.loading('加载中')
        apis.requestGetMember().then(res => {
          if (res.status == 200) {
            let memberList = res && res.data && res.data.memberList || [];
            self.setData({ memberList })
            this.showMembers()
          } else {
            uiUtil.toast(res.data.message || '系统错误，请稍后再试')
            this.hidePage()
          }
        }).catch(err => {
          uiUtil.toast('系统错误，请稍后再试')
          this.hidePage()
        })
      }
    },
    showMembers() {
      uiUtil.hideLoading()
      //if (!this.data.memberList.length) return wx.showToast({ title: '请添加成员后再邀请家人', icon: 'none', duration: 1500 })
      this.setData({ pageStatus: pageStatusEnum.MEMBERS })
    },
  }
})
