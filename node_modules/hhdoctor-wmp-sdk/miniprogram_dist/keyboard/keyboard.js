const kbUtil = require('../utils/keyboard-util.js');
const layout = require('../utils/keyboard-layout-default')
const s1 =require('../utils/keyboard-layout-symbol')
const s2 =require('../utils/keyboard-layout-upper')
let inputArr = [];
let _options = {
  layout: 'default',
  confirmText: '确定',
  clearAfterConfirm: true,
  vibrate: false,
  style: {},
  maxLength: -1
}
let kbReady = false;
Component({
  properties: {
    options: Object
  },
  observers: {
    'options': function (val) {
      console.log(val)
      _options = Object.assign(_options, val);
      if (kbReady) this._getKeyboardLayout(_options.layout);
    }
  },
  data: {},
  attached: function () {
    inputArr = [];
  },
  ready: function () {
    this._getKeyboardLayout(_options.layout);
    kbReady = true;
  },
  methods: {
    /** 获取键盘布局 */
    _getKeyboardLayout(layoutName) {
      kbUtil.setConfirmText(_options.confirmText);
      let layoutUtil = require('../utils/keyboard-layout.js')
      let layout = layoutUtil.getKeyboardLayout(layoutName);
      console.log(layout.layout.keyboard)
      if (layout.layout.keyboard) {
        this.setData({
          keyboards: layout.layout.keyboard
        })
      }
    },

    /** 键盘输入事件 */
    _onKeypress(e) {
      this._processKeyPress(e);
      if (_options.vibrate) wx.vibrateShort()
    },
    /** 处理键盘输入 */
    _processKeyPress(e) {
      console.log(e)
      if (e.detail.keyText == '确定') return;
      let key = e.detail;
      let eventName = 'keypress';
      if (key.controlKey) {
        eventName = this._precessControlKey(key);
      } else {
        if (_options.maxLength > 0 && inputArr.length >= _options.maxLength) return;
        inputArr.push(e.detail.keyText);
      }
      key.text = inputArr.join('');
      if (eventName) this.triggerEvent(eventName, key, {})
      if ('confirm' == eventName &&
        _options.clearAfterConfirm) {
        inputArr = [];
      }
    },
    /** 处理控制键 */
    _precessControlKey(key) {
      let eventName = 'keypress';
      switch (key.keyCode) {
        case -1: //切换到符号
          eventName = '';
          this._getKeyboardLayout('symbol');
          break;
        case -2: //切换到英文
        case -4:
          eventName = '';
          this._getKeyboardLayout('default');
          break;
        case -3: //切换到大写
          eventName = '';
          this._getKeyboardLayout('upper');
          break;
        case 8: //退格(删除)
          if (null == inputArr.pop()) eventName = '';
          break;
        case 13: //确认/登录等
          eventName = 'confirm';
          break;
        case 32: //空格
          inputArr.push(' ');
          break;
        default:
          eventName = '';
          break;
      }
      return eventName;
    }
  }
})