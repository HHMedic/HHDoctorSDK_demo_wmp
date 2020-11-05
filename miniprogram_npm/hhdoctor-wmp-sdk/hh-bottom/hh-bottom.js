// components/hh-bottom/hh-bottom.js
var recording = false;
var recordStardPosition = null;
const rm = wx.getRecorderManager();
let that;
Component({
    /**
     * 组件的属性列表
     */
    properties: {
      safeAreaHight:Number
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
        },
        hide() {

        },
    },

    /**
     * 组件的初始数据
     */
    data: {
        bottomHeight: 300, //底部输入和工具栏高度
        inputText: '', //用户输入的文字
        inputTypeClass: 'audio', //输入区域类型
        inputTextVisible: true, //文本输入是否可见
        recordMaskVisible: 'hidden', //录音遮罩层是否可见
        recordBtnTip: '按住 说话', //录音按纽的提示文字
        recordCancel: false, //是否取消录音
        animationData: null, //顶部按纽栏动画对象
        utilsAnimation: null, //工具栏动画对象
        isInputTextFocus:false,
        autoplay:false,
        indicatorDots:true,
        current:0,
        isAuthBox:false,
        isRecordAuth:false,
        isShowToolBar:false,
        tools:[
          [
            {name:'照片',icon:'album' },
            {name:'相机',icon:'camera'},
            // {name:'挂号',icon:'registration'},
            // {name:'预约专家',icon:'appointment'},
            // {name:'心理咨询',icon:'psychological'},
            // {name:'线下护理',icon:'offlinenurse'},
            // {name:'陪同咨询',icon:'accompany'},
            // {name:'送药上门',icon:'sendmedicine'}
          ]
        ]


    },

    /**
     * 组件的方法列表
     */
    methods: {
      bindEveryIcon(e){
        let type = e.currentTarget.dataset.type
        this.triggerEvent('everyIcon',{type})
      },

    //点击右侧加号
    _showHideUtils() {
        this.setData({
            isShowToolBar:!this.data.isShowToolBar
        })
      },
  
      //显示隐藏工具栏
      _showUtils(visible) {
        // this.setData({
        //   bottomHeight: visible ? 260 : 70,
        //   safeAreaHight: visible ? 0 : 34
        // })
        this.setData({
            isShowToolBar:visible
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
      bindFocusText(){
        // this._showUtils(false);
        this.setData({isInputTextFocus:true})
      },
      //3. 失去文本焦点
      bindBlurText(){
        this.setData({isInputTextFocus:false})
      },
  
      //3. 输入文本
      _inputText(e) {
        this.setData({
          inputText: e.detail.value
        })
      },
  
      /** 发送文本消息 */
      _sendTextMsg(e) {
        that.triggerEvent('sendTextMsg',that.data.inputText)
        that.setData({
          inputText: ''
        })
      },
      _checkRecordAuth() {
        wx.getSetting({
          success(res) {
            if (!res.authSetting['scope.record']) {
              that.data.isRecordAuth = false;
            } else {
              that.data.isRecordAuth = true;
            }
          }
        })
      },
      bindAuthButton(){
          that.setData({
              isAuthBox:false
          })
      },
  
      // 录音 - 手指按下
      _startRecord(e) {
        if (!that.data.isRecordAuth) {
          that.setData({ isAuthBox: true })
          wx.authorize({
            scope: 'scope.record',
            success(s) {
              that.setData({
                isAuthBox: false,
                isRecordAuth: true
              })
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
        that.triggerEvent('sendAudio',{
            tempFilePath:res.tempFilePath,
            duration:res.duration
        })
        // hhim.sendAudio(res.tempFilePath, res.duration, that._sendCallback, that.data._request.appointedOrderId);
      },
  

    }
})
