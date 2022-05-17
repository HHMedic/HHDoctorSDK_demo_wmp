let netSpeedRemote = [], netSpeedRemoteMin = 20, netSpeedLocal = [], netSpeedLocalMin = 60, audioBpsMin = 10
let restartCamera = false
let self
module.exports = Behavior({
  behaviors: [],
  properties: {},
  data: {},
  attached: function () {
    self = this
  },
  methods: {
    /** 监测本地网络状态变化 */
    _onLocalNetStateUpdate(info) {
      if (this.data._request.localVideoStatus < 1 || this.data.enterChooseImages || this.data.enterShare || this.data.videoTimeSeconds <= 0) {
        restartCamera = false
        return netSpeedLocal = []
      }
      if (('undefined' != typeof info.netSpeed && info.netSpeed <= netSpeedLocalMin) || ('undefined' != typeof info.audioBitrate && info.audioBitrate <= audioBpsMin)) netSpeedLocal.push(info.netSpeed)
      if (netSpeedLocal.length >= 3) {
        netSpeedLocal = []
        console.error('>>> _onLocalNetStateUpdate', this.data._request.localVideoStatus, self.data.enterChooseImages, self.data.enterShare, self.data.videoTimeSeconds)
        if (!restartCamera) {
          this.trtcComponent.unpublishLocalVideo()
          this.trtcComponent.unpublishLocalAudio()
          setTimeout(() => {
            this.trtcComponent.publishLocalAudio()
            this.trtcComponent.publishLocalVideo()
          }, 500)
          restartCamera = true
          this.requestRtcLog('1', '音视频出现问题，尝试重启', self.data.orderid)
        } else {
          this.showToast('音视频出现问题，请挂断后重新呼叫', 'noBack')
          this.requestRtcLog('1', '音视频出现问题，请挂断后重新呼叫', self
          .data.orderid)
        }
      }
    },
    /** 监测远端网络状态变化` */
    _onRemoteNetStateUpdate(info) {
      if (info.netSpeed <= netSpeedRemoteMin) netSpeedRemote.push(info.netSpeed)
      else netSpeedRemote = []
      if (netSpeedRemote.length >= 5) {
        netSpeedRemote = []
        this.showToast('如果无法看到医生，请挂断后重新呼叫', 'noBack')
        this.requestRtcLog('1', '如果无法看到医生，请挂断后重新呼叫', self.data.orderid)
      }
    },
    //监听小程序内存
    _onMemoryWarning() {
      wx.onMemoryWarning(function (res) {
        wx.showToast({
          title: '小程序内存不足',
          icon: 'none',
          duration: 1000
        })
        this.requestRtcLog('1', 'onMemoryWarning:内存告警:' + JSON.stringify(res), this.data && this.data.orderid || '')
      })
    },
    _onAudioInterruption() {
      wx.onAudioInterruptionBegin(this._onAudioInterruptionBegin)
      wx.onAudioInterruptionEnd(this._onAudioInterruptionEnd)
    },
    _offAudioInterruption() {
      wx.offAudioInterruptionBegin(this._onAudioInterruptionBegin)
      wx.offAudioInterruptionEnd(this._onAudioInterruptionEnd)
    },

    _onAudioInterruptionBegin() {
      self.requestRtcLog('1', '小程序音频被占用开始', self.data && self.data.orderid || '')
    },
    _onAudioInterruptionEnd() {
      self.requestRtcLog('1', '小程序音频被占用结束', self.data && self.data.orderid || '')
    },

  }
})