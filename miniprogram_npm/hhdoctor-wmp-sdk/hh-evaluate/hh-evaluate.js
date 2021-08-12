const apis = require('../utils/api.js')
const hhDoctor = require('../hhDoctor.js')
const throttle = require('../utils/commonUtil').throttle
let self;
Component({
  /**
   * 组件的属性列表
   */
  behaviors: [require('../behaviors/hhStarter')],
  properties: {
    evaluateData: {
      type: Object,
      value: null
    },
    famOrderId: {
      type: String,
      value: ''
    },
    doctor: Object
  },

  /**
   * 组件的初始数据
   */
  data: {
    template: 1,//1.评价初始页;2.星星评价页;3.评价不满意-感谢反馈;4.评价满意-感谢反馈;5.投诉页；6.投诉后-反馈
    starDesc: ['非常不满意，各方面都很差', '不满意，比较差', '一般，还需改善', '比较满意，仍可改善', '非常满意，无可挑剔'],
    questionIdx: 0,
    textVal: '',
    phone: '',
    isClose: false,//是否关闭评价页
    isClick: false,//初始化选择，防连点
    isStar: false,//点击星星，显示评价内容
    stars: [0, 0, 0, 0, 0],
    starIdx: -1,
    starList: [],
    photoUrl: 'https://imgs.hh-medic.com/icon/wmp/bg-default.jpg',
    enableChangeDoctor: true,   //是否允许更换医生
    enableComplain: true,       //是否允许投诉
    enableInputEvaluate: false,    //是否允许用户手工输入评价内容，默认false，从列表中选择
    evaluateText: ''
  },
  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached: function () {
      self = this;
      console.log('评价页参数log', this.data)
      this.setData({
        template: this.data._request.evaluateTemplate,
        enableChangeDoctor: this.data._request.enableChangeDoctor,
        enableComplain: this.data._request.enableComplain,
        enableInputEvaluate: this.data._request.enableInputEvaluate
      })
      this.getRateContentList();
    },
    moved: function () { },
    detached: function () { },
  },
  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function () {
      console.log('评价页参数log-show', this.data)
    },
    hide: function () { },
    resize: function () { },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    //1.匿名评价初始化页-第一步
    bindInitEvaluate(e) {
      if (throttle('evaluate')) return;
      let data = e.currentTarget.dataset
      self.setData({ questionIdx: data.index })
      wx.showLoading();
      apis.requestCommitQuestion(self.data.evaluateData.question.id, data.answer, self.data.famOrderId).then(res => {
        wx.hideLoading();
        if (res.status == 200) {
          setTimeout(res => {
            self.setData({
              template: 2
            })
          }, 1000)
        } else {
          wx.showToast({
            title: res.message,
            icon: 'none'
          })
        }
      }).catch(res => {
        wx.hideLoading();
        getApp().getCheckNetWork();
      })
    },
    // 初始化数据
    getRateContentList() {
      self.data.starList = self.data.evaluateData.rateContentList;
      self.data.starList.map((item, index) => {
        item['isChecked'] = false;
      })
      self.setData({
        starList: self.data.starList
      })

    },

    //2.点击星星 
    bindStar(e) {
      let score = e.currentTarget.dataset.index;
      self.data.stars = [0, 0, 0, 0, 0];
      for (var i = 0; i < self.data.stars.length; i++) {
        if (score < i) {
          continue;
        }
        self.data.stars[i] = 1;
      }
      self.setData({
        stars: self.data.stars,
        isStar: true,
        starIdx: score
      })
    },
    //3.选择星级评价内容
    bindStarText(e) {
      let index = e.currentTarget.dataset.index;
      self.data.starList[index].isChecked = !self.data.starList[index].isChecked;
      self.setData({
        starList: self.data.starList
      })
    },
    //4.星级评价选择完成后匿名提交
    bindStarSubmit() {
      wx.showLoading({
        mask: true
      })
      let content = [];
      self.data.starList.map((item, index) => {
        if (self.data.starIdx < 4 && item.isChecked && item.answerOne == '1-4') {
          content.push(item.content)
        }
        if (self.data.starIdx == 4 && item.isChecked && item.answerOne == '5') {
          content.push(item.content)
        }
      })
      content = content.join(',');
      if (this.data.enableInputEvaluate && this.data.evaluateText) content += (',' + this.data.evaluateText)
      let rate = self.data.starIdx + 1;
      let params = `&rate=${rate}&content=${content}&famOrderId=${self.data.famOrderId}`
      apis.requestCommitFeedback(params).then(res => {
        wx.hideLoading()
        if (res.status == 200) {
          //如果不满意=>3 满意=>4
          self.setData({
            rate,
            template: rate < 5 && this.properties.enableChangeDoctor ? 3 : 4
          })
          console.log('doctor', self.data.doctor)
          wx.setStorageSync('rate', rate)
          wx.setStorageSync('doctor', self.data.doctor)
        }
      }).catch(res => {
        wx.hideLoading();
        getApp().getCheckNetWork();
      })
    },
    //5.我要投诉
    bindComplainLink() {
      wx.showModal({
        title: '提示',
        content: '确认前往投诉页吗？',
        success(res) {
          if (res.confirm) {
            self.setData({
              template: 5
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    },
    bindTextarea(e) {
      let textVal = e.detail.value.replace(/\s+/g, '');
      self.setData({
        textVal
      })
    },
    bindInputPhone(e) {
      console.log(e)
      let phone = e.detail.value.replace(/\s+/g, '');
      self.setData({
        phone
      })
    },
    bindInputContent(e) {
      this.setData({ evaluateText: e.detail.value.replace(/\s+/g, '') })
    },
    //7.提交投诉
    bindComplainSubmit() {
      if (!self.data.textVal) {
        wx.showToast({
          title: '请填写投诉内容',
          icon: 'none'
        })
        return;
      }
      if (!self.data.phone) {
        wx.showToast({
          title: '请填写您的联系电话',
          icon: 'none'
        })
        return;
      }
      if (self.data.phone.length != 11) {
        wx.showToast({
          title: '请填写正确的手机号',
          icon: 'none'
        })
        return;
      }
      if (throttle('complain')) return;
      wx.showLoading({
        mask: true
      })
      let complainContent = self.data.textVal + ',' + self.data.phone;
      let params = `&complainContent=${complainContent}&famOrderId=${self.data.famOrderId}`
      apis.requestCommitFeedback(params).then(res => {
        wx.hideLoading();
        if (res.status == 200) {
          self.setData({
            template: 6
          })
        }
      }).catch(res => {
        wx.hideLoading();
        getApp().getCheckNetWork();
      })
    },
    //8.换个医生问问
    bindChangeDoctor() {
      console.log('评价页参数log', this.data)
      if (throttle('e-changedoctor')) return;
      let _options = hhDoctor.getOptions();
      if (!_options || !_options.callPage) return;
      // if (!getApp().globalData._hhSdkOptions || !getApp().globalData._hhSdkOptions._callPage) return
      wx.showLoading({ mask: true });
      apis.requestChangeDoctor(self.data.famOrderId).then(res => {
        wx.hideLoading();
        if (res.status == 200) {
          //跳转呼叫页重新呼叫 服务器返回成功后，重新进行呼叫，呼叫时的dept、实际患者uuid等参数使用用户上次呼叫时的参数值；
          //var pageUrl =  '/pages/room/room'+ '?' + hhDoctor.getPublicParams()+'&dept='+self.data._request.dept+'&uuid='+self.data._request.uuid;
          let params = self.data._request.realPatientUuid ? ('&realPatientUuid=' + self.data._request.realPatientUuid) : ('&userToken=' + self.data._request.userToken);
          let pageUrl = _options.callPage + '?' + hhDoctor.getPublicParams() + '&dept=' + self.data._request.dept + params;
          wx.redirectTo({
            url: pageUrl
          })
        } else {
          wx.showToast({
            title: res.message,
            icon: 'none',
            duration: 2000
          })
        }
      }).catch(res => {
        wx.hideLoading();
        getApp().getCheckNetWork();
      })
    },
    //2.关闭评价
    bindCloseEvalate() {
      this.triggerEvent('closeevalate', {}, {})
    },


  }
})
