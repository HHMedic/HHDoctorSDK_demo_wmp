const app = getApp();
const apis = require('../utils/api.js');
const dateUtil = require('../utils/dateUtil.js');
const hhDoctor = require('../hhDoctor.js');

let start;
module.exports = Behavior({
  behaviors: [],
  properties: {
    myBehaviorProperty: {
      type: String
    }
  },
  data: {
    bgImgs: {
      defaultImg: 'https://imgs.hh-medic.com/icon/wmp/bg-default.jpg',
      waitImg: 'https://imgs.hh-medic.com/icon/wmp/wait-for-doctor.jpg',
    },
    icons: {
      flash_off: 'https://imgs.hh-medic.com/icon/wmp/flash-off.png',
      flash_on: 'https://imgs.hh-medic.com/icon/wmp/flash-on.png',
      certificate: 'https://imgs.hh-medic.com/icon/wmp/license.png',
      hangup: 'https://imgs.hh-medic.com/icon/wmp/hangup.png',
      accept: "https://imgs.hh-medic.com/icon/wmp/accept.png",
      camera: 'https://imgs.hh-medic.com/icon/wmp/camera.png',
      switch_camera: 'https://imgs.hh-medic.com/icon/wmp/camera-change.png',
      mask: 'https://upload-images.jianshu.io/upload_images/5869240-7476cdf461a49c51.png',
      arrow_up: 'https://imgs.hh-medic.com/icon/wmp/up.png',
      arrow_down: 'https://imgs.hh-medic.com/icon/wmp/down.png',
      warning: 'https://imgs.hh-medic.com/icon/wmp/warning.png'
    },
    isFlash: false, //闪光灯
    photoIdx: 0, //预览上传图片的下标
  },
  attached: function() {},
  pageLifetimes: {
    show: function() {
      this.data.isClickPhoto = false;

    },
    hide: function() {}
  },

  methods: {
    /** 检查用户授权 */
    _checkAuthorize: function() {
      let self = this;
      self.requestRtcLog(1, 'authorize:check start');
      //检查用户麦克风和摄像头是否已授权
      return new Promise((resolve, reject) => {
        wx.authorize({
          scope: "scope.record",
          success: function() {
            console.log('麦克风已授权')
            wx.authorize({
              scope: "scope.camera",
              success: function() {
                console.log('摄像头已授权')
                self.setData({
                  isAuthBox: false
                })
                self.requestRtcLog(1, 'authorize:successs');
                resolve();
              },
              fail: function() {
                self.requestRtcLog('1', 'authorize:failed camera')
                console.log('摄像头未授权')
                self.setData({
                  isAuthBox: true
                })
                reject();
              }
            })
          },
          fail: function() {
            console.log('麦克风未授权')
            self.requestRtcLog('1', 'authorize: failed record')
            reject();
          }
        })
      })
    },
    // 进入视频计时
    _startVideoTimer() {
      let self = this;
      //self.setData({
      //videoTimeStart: new Date().getTime()
      //})
      let interval = setInterval(() => {
        if (!self.data.videoTimeStart) {
          clearInterval(interval);
          return;
        }
        let vt = parseInt((new Date().getTime() - self.data.videoTimeStart) / 1000);
        self.setData({
          videoTime: dateUtil.formatTimeLength(vt)
        })
      }, 1000)
    },
    //1.点击授权按钮
    bindAuthButton: function() {
      wx.navigateBack()
    },
    _addMonitorLog() {
      let self = this;
      wx.getSystemInfo({
        success: function(systeminfo) {
          self.requestRtcLog(1, JSON.stringify(systeminfo));
          let smallViewTop = systeminfo.statusBarHeight + 42 + 'px'
          self.setData({
            systeminfo,
            smallViewTop
          })
        }
      })
      wx.getNetworkType({
        success(res) {
          self.requestRtcLog(1, 'networkType: ' + JSON.stringify(res));
        }
      })
      wx.onNetworkStatusChange(function(res) {
        if (!res.isConnected) {
          console.log('网络状态变化：已断开');
          self.requestRtcLog('1', 'networkStatusChange:' + JSON.stringify(res));
        } else {
          console.log('网络状态变化：已连接');
          self.requestRtcLog('1', 'networkStatusChange:' + JSON.stringify(res));
        }
      })
      wx.onMemoryWarning(function() {
        self.requestRtcLog('1', 'onMemoryWarning:内存告警')

      })
    },
    //4.右侧功能区-箭头
    bindArrow: function() {
      this.setData({
        isExpand: !this.data.isExpand
      })
    },
    //5.右侧功能区-点击证书预览
    bindCertificateIcon: function() {
      let self = this;
      self.requestRtcLog('1', 'user click:tapShowLicense start', self.data.orderid)
      this.setData({
        isCertificate: true,
        isLivePusher: false
      })
    },
    //6.右侧功能区-关闭证书预览
    bindCloseCertificate: function() {
      let self = this;
      self.requestRtcLog('1', 'user click:tapShowLicense complete', self.data.orderid)
      this.setData({
        isCertificate: false,
        isLivePusher: true

      })
    },
    //7.右侧功能区- 点击闪光灯
    bindFlashIcon: function() {
      let self = this;
      if (this.data.frontCamera) {
        wx.showToast({
          title: '需要切换为后置摄像头',
          icon: 'none'
        })
        return;
      }
      self.requestRtcLog('1', 'user click:tapToggleFlash', self.data.orderid)
      this.data.webrtcroomCom.toggleTorch();
      this.setData({
        isFlash: !this.data.isFlash
      })
    },
    //8.uploadImg-点击相机上传图片
    bindCamera: function() {
      let self = this;
      self.requestRtcLog('1', 'user click:selectImage start', self.data.orderid)
      if (!self.data.isClickPhoto) {
        self.chooseImage(['album', 'camera'])
      }
      self.data.isClickPhoto = true;

    },
    //9.uploadImg chooseImage
    chooseImage: function(sourceType) {
      let self = this;
      self.setData({
        isChoosePhoto: true
      }) //仅有拍照功能 onhide时 用以判断小程序退出挂断
      wx.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: sourceType,
        success(res) {
          self.requestRtcLog('1', 'user click:selectImage count:1', self.data.orderid)
          let tempFiles = res.tempFilePaths[0];
          self.data.chooseImages.push(tempFiles)
          self.setData({
            chooseImages: self.data.chooseImages,
          })
          self.getUploadImg(tempFiles);
        },
        fail: function(res) {
          self.requestRtcLog('1', 'user click:selectImage fail', self.data.orderid)
        },
        complete: function(res) {
          self.data.isChoosePhoto = false;
          self.data.isClickPhoto = false;
          self.requestRtcLog('1', 'user click:selectImage complete', self.data.orderid)
        },

      })
    },
    //10.uploadImg-上传图片换取httpurl
    getUploadImg: function(tempFiles) {
      var self = this;
      let url = `${apis.getRtcUploadUrl()}?sdkProductId=${self.data._request.sdkProductId}&userToken=${self.data._request.userToken}`
      var upload_task = wx.uploadFile({
        url: url,
        filePath: tempFiles,
        name: 'uploadFile',
        success: function(res) {
          let data = JSON.parse(res.data)
          if (data.status == 200) {
            console.log('上传成功的图片', data.data)
            self.getAddAttatch(data.data)
            self.data.uploadImages.push(data.data)
            self.setData({
              uploadImages: self.data.uploadImages,
              uploadFail: false
            })
            self.requestRtcLog('1', 'user click:upload image success:' + data.data, self.data.orderid);
            console.log(self.data.uploadImages)
          } else {
            self.setData({
              uploadFail: true
            })
          }
        },
        fail: function(e) {
          self.requestRtcLog('1', 'user click:upload image fail:', self.data.orderid)
          self.setData({
            uploadFail: true
          })
        }
      })
    },
    getAddAttatch(url) {
      let self = this;
      // famOrderId sdkProductId url userToken
      let params = `?famOrderId=${self.data.orderid}&url=${url}`
      apis.requestAddAttatch(params).then(res => {
        if (res.status == 200) {
          self.requestRtcLog('1', 'user click:add attatch success:' + url, self.data.orderid)
        }
      })
    },
    //11.uploadImg-预览或重新上传图片
    bindUploadPhotos: function(e) {
      let type = e.currentTarget.dataset.type;
      let self = this;
      if (type == 'upload') {
        this.chooseImage(['album'])
      }
      if (type == 'preview') {
        self.requestRtcLog('1', 'user click:preview image', self.data.orderid)
        this.setData({
          isPreviewPhoto: true,
          isLivePusher: false

        })
      }
    },
    //12.uploadImg- 点击关掉预览图
    bindPhotoPreview: function() {
      let self = this;
      this.setData({
        isPreviewPhoto: false,
        isLivePusher: true
      })
      self.requestRtcLog('1', 'user click:tapShowUploaded complete ', self.data.orderid)
    },
    previewPre() {
      if (this.data.uploadImages.length>1){
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
    //13.uploadImg- 预览下一张
    previewNext() {
      if (this.data.uploadImages.length > 1) {
        this.data.photoIdx++
          if (this.data.photoIdx > this.data.uploadImages.length - 1) {
            this.setData({
              photoIdx: 0
            })
          }
        this.setData({
          photoIdx: this.data.photoIdx
        })
      }
    },
    // 下面主要模仿滑动事件
    touchstart: function(e) {
      start = e.changedTouches[0];
      console.log(e)
    },

    touchend: function(e) {
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

    //14.底部功能 - 切换摄像头
    bindChangeCamera: function() {
      let self = this;
      this.data.webrtcroomCom.switchCamera();
      this.setData({
        frontCamera: !this.data.frontCamera
      })
      self.requestRtcLog('1', 'user click:switchCamera', self.data.orderid)
    },
    _getStyle() {
      if (!this.data._request.style) {
        return;
      }
      var style = this.data._request.style;
      if (style.logoImage) {
        this.setData({
          logoImage: style.logoImage
        })
        this.getSettingLogo(style.logoImage);
      }
    },
    /** 上报日志 */
    requestRtcLog(type, content, orderId) {
      hhDoctor.addLog(type, content, orderId);
      if ('life:detached' == content) {
        hhDoctor.refreshSession(500);
      }
    },
    //计算logo的高度
    getSettingLogo(logoImage) {
      let self = this;
      let logoHeight;
      wx.getImageInfo({
        src: logoImage,
        success(res) {
          console.log(res)
          logoHeight = Math.ceil(400 / (res.width / res.height)) + 'rpx'
          self.setData({
            logoHeight
          })
          console.log(logoHeight)
        }
      })
    }
  }
})