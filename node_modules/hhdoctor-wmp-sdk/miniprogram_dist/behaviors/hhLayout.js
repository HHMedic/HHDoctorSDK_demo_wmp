
const resizeMap = require('../utils/layoutUtil').resizeMap
module.exports = Behavior({
  behaviors: [],
  properties: {},
  data: {},
  created: function () { },
  attached: function () { },
  ready: function () {
    this._layoutResize()
  },
  methods: {
    _layoutResize: function () {
      let _name = this._getIsName()
      if (resizeMap[_name]) {
        let _execResize = require('../utils/layoutUtil')[resizeMap[_name]]
        this.waitForCheckRequest()
          .then(res => _execResize(this))
          .catch(err => { })
      }
    },
    /** 等待参数检查完成 */
    waitForCheckRequest() {
      return new Promise((resolve, reject) => {
        if ('undefined' == typeof this.data._requestCheck || this.data._requestCheck) return resolve()
        let _timeOut = 0
        let _handler = setInterval(() => {
          if (this.data._requestCheck) {
            clearInterval(_handler)
            return resolve()
          }
          _timeOut += 100
          if (_timeOut >= 5000) {
            clearInterval(_handler)
            return reject()
          }
        }, 100)
      })

    },
    _getIsName() {
      let _names = this.is.split('/')
      if (_names.length >= 2) return '/' + _names[_names.length - 2] + '/' + _names[_names.length - 1]
      else return this.is
    }
  }
})