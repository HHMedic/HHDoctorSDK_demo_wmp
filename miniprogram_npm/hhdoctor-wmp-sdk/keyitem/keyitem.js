// test.js
const kbUtil = require('../utils/keyboard-util.js');
let controlKeyMap = [];
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    value: Object
  },
  observers: {
    'value': function(val) {
      //console.log('val',val)
      if (val.control) {
        this.setData({
          keyText: kbUtil.getControlKeyText(val.control),
          control: val.control
        })
      } else {
        this.setData({
          keyText: val.text
        })
      }
      this.setData({
        style: val.disabled ? ' disabled' : ''
      })
    }
  },
  attached: function() {

  },
  /**
   * 组件的初始数据
   */
  data: {
    keyText: '',
    control: '',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _onTap() {
      if (this.data.value.disabled) {
        return;
      }
      let keyCode;
      console.log('control',this.data.control)
      if (this.data.control) {
        keyCode = kbUtil.getControlKeyCode(this.data.control);
      } else if (this.data.keyText && 1 == this.data.keyText.length) {
        keyCode = this.data.keyText.charCodeAt();
      }
      this.triggerEvent('keypress', {
        keyText: this.data.keyText,
        keyCode: keyCode,
        timeStamp: new Date().getTime(),
        controlKey: this.data.control
      }, {})
    }
  }
})