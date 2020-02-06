var that;
var evaMap = [];
const eventOption = {};
Component({
  //behaviors: [require('./hhBehaviors.js')],
  /**
   * 组件的属性列表
   */
  properties: {
    question: {
      type: Object,
      observer(newVal, oldVal, changedPath) {}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    status: 0, //0:问题；1：问题结果；2：满意度；3：满意度结果,
    evaStarVisible: 'hidden',
    evaValue: 5,
    evaTip: '非常满意',
    evaText: ''
  },
  lifetimes: {
    attached() {
      that = this;
      evaMap[1] = '极度不满意';
      evaMap[2] = '非常不满意';
      evaMap[3] = '不满意';
      evaMap[4] = '一般';
      evaMap[5] = '非常满意';
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    _close: function() {
      that._triggerEvent('close', {});
    },

    _triggerEvent(name, detail) {
      that.triggerEvent(name, detail, eventOption)
    },

    _answerQuestion(e) {
      var id = parseInt(e.currentTarget.dataset.answerId);
      that._triggerEvent('ask', {
        answerId: id,
        answerText: 1 == id ? that.data.question.answerOne : that.data.question.answerOne
      });

      that.setData({
        status: 1,
        evaStarVisible: ''
      })
    },

    _viewEva() {
      this.setData({
        status: 2
      })
    },

    _setEvaVal(e) {
      var v = parseInt(e.currentTarget.dataset.evaVal);
      this.setData({
        evaValue: v,
        evaTip: evaMap[v]
      })
    },

    _setEvaText(e) {
      this.setData({
        evaText: e.detail.value
      })
    },

    _commitEvaluation() {
      that._triggerEvent('evaluate', {
        evaValue: that.data.evaValue,
        evaText: that.data.evaText
      });
      this.setData({
        status: 3
      })
      setTimeout(function() {
        that._triggerEvent('close', {});
      }, 2000);
    }
  }
})