// components/hh-bottom/hh-bottom.js
var recording = false;
var recordStardPosition = null;
const rm = wx.getRecorderManager();
const hhDoctor = require('../hhDoctor.js');
const tools = require('../utils/tools.js')
let that;
Component({
  /**
   * 组件的属性列表
   */
  behaviors: [
    require('../behaviors/hhStarter'),
    require('../behaviors/hhCommon'),
  ],
  properties: {
    safeAreaHight: Number,
    memberList: Array,
    manyVideo: Boolean,
    shareCard: {
      type: Number,
      value: 0
    },
    product: {
      type: Object
    },
  },
  observers: {
    'product': function (val) {
      this.getRights(val)
    },
    'memberList': function (val) {
      if (this.properties.memberList && this.properties.memberList.length) this.getRights(this.data.product)
    }
  },
  lifetimes: {
    attached() {
      that = this;
      rm.onStart(that._onRecordStart);
      rm.onStop(that._onRecordStop);
    }
  },
  pageLifetimes: {
    show() {
      this._checkRecordAuth()
      this.bindBlurText()
    },
    hide() {

    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    _name: 'hh-bottom',
    bottomHeight: 300, //底部输入和工具栏高度
    inputText: '', //用户输入的文字
    inputTypeClass: 'audio', //输入区域类型
    inputTextVisible: true, //文本输入是否可见
    recordMaskVisible: 'hidden', //录音遮罩层是否可见
    recordBtnTip: '按住 说话', //录音按纽的提示文字
    recordCancel: false, //是否取消录音
    animationData: null, //顶部按纽栏动画对象
    utilsAnimation: null, //工具栏动画对象
    isInputTextFocus: false,
    autoplay: false,
    indicatorDots: true,
    current: 0,
    isAuthBox: false,
    isRecordAuth: false,
    isShowToolBar: false,
    manyVideo: false,
    rights: {},
    kbHeight: 0, //键盘默认高度 
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _requestComplete() {
      this.getRights(this.data.product);
    },
    getRights(product) {
      //console.log('>>> member:', this.data.memberList)
      console.log('>>> product:', this.data.product)
      let newRights = {}
      newRights['album'] = tools['album']
      newRights['camera'] = tools['camera']
      //给家人用（分享卡片）
      if (this.properties.shareCard && this.data.memberList.length && !this.data.memberList[0].pid) newRights['share_card'] = tools['share_card']
      if (product && product.productRightsList && this.data.memberList.length && 'temp' != this.data.memberList[0].kind && this.data._request.bottomRightsVisible) {
        product.productRightsList.map((item, index) => {
          if (item.serviceType && item.serviceType != 'common' && item.serviceType != 'expert' && item.productRightStatus == "normal" && item.icon2 && (item.productRightsRule ? item.productRightsRule.isShowUser !== false : true)) {
            if (item.rule && typeof item.rule == 'string') {
              item.rule = JSON.parse(item.rule)
            }
            newRights[item.serviceType] = item
          }
        })
      }
      if (this.data.memberList.length && !this.data.memberList[0].isAccount && this.data.manyVideo) {
        newRights['many_video'] = tools['many_video']
      }

      this.setData({ rights: this.getRightsData(newRights) })
    },

    getRightsData(rights) {
      let rightsData = []
      let count = -1
      let rightList = this.getArrSort(rights)
      rightList.map((item, index) => {
        index % 8 == 0 && count++
        if (typeof rightsData[count] == 'undefined') {
          rightsData[count] = []
        }
        rightsData[count].push(item)
      })
      return rightsData
    },
    getArrSort(arr) {
      let newArr = [arr['camera'], arr['album']]
      if (arr['many_video']) {
        newArr.push(arr['many_video'])
        delete arr['many_video']
      }
      delete arr['camera']
      delete arr['album']
      return newArr.concat(Object.values(arr))
    },
    bindEveryIcon(e) {
      this.triggerEvent('everyIcon', e.currentTarget.dataset)
    },

    //点击右侧加号
    _showHideUtils() {
      this.setData({
        isShowToolBar: !this.data.isShowToolBar
      })
    },

    //显示隐藏工具栏
    _showUtils(visible) {
      // this.setData({
      //   bottomHeight: visible ? 260 : 70,
      //   safeAreaHight: visible ? 0 : 34
      // })
      this.setData({
        isShowToolBar: visible
      })
    },

    // 1. 切换显示语音输入和文字输入 
    _changeInputType() {
      this._showUtils(false);
      var isAudio = 'audio' == this.data.inputTypeClass;
      this.setData({
        inputTypeClass: isAudio ? 'keyboard' : 'audio',
        inputTextVisible: !isAudio
      })
    },
    //2. 获取文本焦点
    bindFocusText() {
      this.setData({ isInputTextFocus: true })
    },
    /** 3.失去文本焦点 */
    bindBlurText() {
      this.setData({ isInputTextFocus: false, kbHeight: 0 })
      setTimeout(() => { that.triggerEvent('keyboardheightchange', { duration: 0, height: 0 }) }, 150)

    },
    /** 4.键盘高度发生变化 */
    bindkeyboardheightchange(e) {
      if (e.detail.height) this._showUtils(false);
      setTimeout(() => {
        that.setData({ kbHeight: e.detail.height })
        that.triggerEvent('keyboardheightchange', e.detail)
      }, 150)
    },

    /** 5.输入文本 */
    _inputText(e) {
      this.setData({
        inputText: e.detail.value
      })
    },
    /** 发送文本消息 */
    _sendTextMsg(e) {
      that.triggerEvent('sendTextMsg', that.data.inputText)
      that.setData({
        inputText: ''
      })
    },
    _checkRecordAuth() {
      wx.getSetting({
        success(res) {
          if (res.authSetting['scope.record'] === false) {
            that.data.isRecordAuth = false;
          }
          if (res.authSetting['scope.record'] === true) {
            that.data.isRecordAuth = true;
          }
        }
      })
    },
    bindAuthButton() {
      that.setData({
        isAuthBox: false
      })
    },

    // 录音 - 手指按下
    _startRecord(e) {
      if (!that.data.isRecordAuth) {
        wx.authorize({
          scope: 'scope.record',
          success(s) {
            that.setData({
              isAuthBox: false,
              isRecordAuth: true
            })
          }, fail() {
            that.setData({ isAuthBox: true })
          }
        })
        return;
      }
      if (recording) {
        wx.showToast({
          title: '录音中请稍候',
          icon: 'none'
        })
        return;
      }

      this.setData({
        recordBtnTip: '松开 结束',
        recordMaskVisible: '',
        recordCancel: false
      })
      recordStardPosition = e.touches[0].clientY;
      rm.start({
        format: 'mp3'
      });
    },

    //录音 - 手指松开
    _stopRecord(e) {
      if (!that.data.isRecordAuth) {
        return;
      }
      this._doStopRecord()
        .then(() => {
          that.setData({
            recordBtnTip: '按住 说话',
            recordMaskVisible: 'hidden'
          })
          recordStardPosition = null;
        })
    },
    //录音 - 停止录音
    _doStopRecord() {
      return new Promise((resolve, reject) => {
        let t = setInterval(function () {
          if (recording) {
            clearInterval(t);
            rm.stop();
            resolve();
          }
        }, 100)
      })
    },
    //录音 - 手指滑动 取消录音
    _cancelRecord(e) {
      if (recordStardPosition) {
        var deltarY = Math.abs(e.touches[0].clientY - recordStardPosition);
        if (deltarY > 50) {
          this.setData({
            recordCancel: true
          })
        } else {
          this.setData({
            recordCancel: false
          })
        }
      }
    },
    //录音 - 开始录音
    _onRecordStart() {
      recording = true;
    },
    // 录音结束后调用上传 
    _onRecordStop(res) {
      recording = false;
      if (that.data.recordCancel) {
        return;
      }
      if (res.duration <= 500) {
        wx.showToast({
          title: '录音时长过短',
          icon: 'none'
        })
        return;
      }
      that.triggerEvent('sendAudio', {
        tempFilePath: res.tempFilePath,
        duration: res.duration
      })
    },
    _callAsst(e) {
      that.triggerEvent('callasst', { localVideoStatus: e.currentTarget.dataset.lvs })
    },
    _contactAsst(e) {
      that.triggerEvent('contactasst', {})
    }
  }
})
