// components/hh-phase/phase-d/phase-d.js
const apis = require('../../utils/api.js')
const dateUtil = require('../../utils/dateUtil.js')
const hhDoctor = require('../../hhDoctor.js');
let self;
let uploadTask;
let start;
Component({
	behaviors: [require('../../hhBehaviors.js'), require('../phaseBehavior.js')],
	/**
	 * 组件的属性列表
	 */
	properties: {
		doctor: Object,
		cameraTorch: Boolean,
		order: Object,
		videoTime:String,
		systeminfo:Object,
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
		isClickCamera: false
	},
	ready() {
		self = this;
		wx.getSystemInfo({
			success: function (systeminfo) {
				self.data.systeminfo = systeminfo;
			}
		});
	},

	/**
	 * 组件的方法列表
	 */
	methods: {

		//挂断
		bindHangUp() {
			if (getApp()._throttle('hangup-3')) return;
			this.triggerEvent('hangUp')
		},
		//切换上下箭头
		_bindArrow() {
			this.setData({
				isExpand: !this.data.isExpand
			})
		},
		//预览证书
		_bindPreviewCertificate() {
			self.requestRtcLog('1', 'user preview certificate', self.data.orderid);
			this.setData({
				isCertificate: !this.data.isCertificate
			})
		},
		//切换闪光灯
		bindFlashIcon() {
			if (getApp()._throttle('toggleTorch')) return;
			this.triggerEvent('toggleTorch')
		},
		//切换摄像头
		bindChangeCamera() {
			if (getApp()._throttle('change-camera')) return;
			this.triggerEvent('changeCamera')
		},

		// 隐藏拍照弹窗
		bindCancel() {
			self.requestRtcLog('1', 'user click cancel camera', self.data.orderid);
			this.setData({
				isClickCamera: false
			})

		},
		//点击拍照按钮谈出弹窗

		bindCamera(){
			self.requestRtcLog('1', 'user click camera：'+this.data.isClickCamera?'显示选择相册相机弹窗':'隐藏选择相册相机弹窗', self.data.orderid);
			this.setData({
				isClickCamera: !this.data.isClickCamera
			})

		},
		bindUserImage(e){
			let type =e.currentTarget.dataset.photo;
			if (getApp()._throttle('camera-'+type)) return;
			self.triggerEvent('enterCamera',type)
			this.setData({
				isClickCamera:false
			})
			// self.joinCameraFun(type)
	
		},			
		
		//外部调用了
		joinCameraFun(type){
            console.log('进入相册chooseImage')
            self.requestRtcLog('1', '进入相册', self.data.orderid);
            wx.chooseImage({
                count: 3,
                sizeType: ['original', 'compressed'],
                sourceType: [type],
                success(res) {
                    self.requestRtcLog('1', 'chooseImage success', self.data.orderid);
                    let chooseImages = self.data.chooseImages.concat(res.tempFiles);
                    self.setData({
                        chooseImages
                    })
                    self.uploadFun();
                },
                fail: function(res) {
                    self.requestRtcLog('1', 'chooseImage fail', self.data.orderid);
                },
                complete: function(res) {
                   self.requestRtcLog('1', 'chooseImage complete', self.data.orderid);
				   self.triggerEvent('completeCamera')
				   wx.setKeepScreenOn({ keepScreenOn: true })

                },
            })
        },


		//循环上传图片
		uploadFun() {
			let chooseImages = self.data.chooseImages;
			chooseImages.map((item, index) => {
				if (!item.path_server) {
					self.getUploadImg(item.path, index);
				}
			});
		},
		getUploadImg(path, index) {
			wx.showLoading()
			self.requestRtcLog('1', 'chooseImage uploadImg start', self.data.orderid);
			uploadTask = wx.uploadFile({
				url: apis.getRtcUploadUrl(),
				filePath: path,
				name: 'uploadFile',
				success: function (res) {
					wx.hideLoading()
					let data = JSON.parse(res.data)
					if (data.status == 200) {
						self.requestRtcLog('1', 'chooseImage uploadImg success', self.data.orderid);
						self.data.chooseImages[index]['path_server'] = data.data;
						self.getAddAttatch(data.data)
						self.setData({
							chooseImages: self.data.chooseImages
						})
						wx.showToast({
						  title: '图片已发送给医生',
						  icon:'none',
						  duration:1000
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
					self.requestRtcLog('1', 'chooseImage uploadImg fail', self.data.orderid);
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
					self.requestRtcLog('1', 'user click:add attatch success:' + url, self.data.orderid)
				}
			})
		},
		bindClosePreviewPhotos() {
			self.requestRtcLog('1', 'user click close preview photos', self.data.orderid);

			self.setData({
				isPreviewPhoto: !self.data.isPreviewPhoto
			})
		},
		bindPreviewPhotos() {
			self.requestRtcLog('1', 'user click preview photos', self.data.orderid);
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
			if (getApp()._throttle('change-doctor')) return;
			self.requestRtcLog('1', 'user click change doctor', self.data.orderid);
			this.triggerEvent('changeDoctor')
		},
	}
})
