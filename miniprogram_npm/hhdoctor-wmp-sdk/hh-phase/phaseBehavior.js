const apis = require('../utils/api.js');
const hhDoctor = require('../hhDoctor.js');
const throttle = require('../utils/commonUtil').throttle
module.exports = Behavior({
  behaviors: [],
  properties: {},
  data: {
    bgImgs: {
      defaultImg: 'https://imgs.hh-medic.com/icon/wmp/bg-default.jpg',
      waitImg: 'https://imgs.hh-medic.com/icon/wmp/wait-for-doctor.jpg',
    },
    // icons: {
    //   flash_off: 'https://imgs.hh-medic.com/icon/wmp/flash-off.png',
    //   flash_on: 'https://imgs.hh-medic.com/icon/wmp/flash-on.png',
    //   certificate: 'https://imgs.hh-medic.com/icon/wmp/license.png',
    //   hangup: 'https://imgs.hh-medic.com/icon/wmp/hangup.png',
    //   accept: "https://imgs.hh-medic.com/icon/wmp/accept.png",
    //   camera: 'https://imgs.hh-medic.com/icon/wmp/camera.png',
    //   switch_camera: 'https://imgs.hh-medic.com/icon/wmp/camera-change.png',
    //   mask: 'https://upload-images.jianshu.io/upload_images/5869240-7476cdf461a49c51.png',
    //   arrow_up: 'https://imgs.hh-medic.com/icon/wmp/up.png',
    //   arrow_down: 'https://imgs.hh-medic.com/icon/wmp/down.png',
    //   warning: 'https://imgs.hh-medic.com/icon/wmp/warning.png',
    //   hangup_disabled: 'https://imgs.hh-medic.com/icon/wmp/hangup-disabled.png',
    //   change_doctor: 'https://imgs.hh-medic.com/icon/wmp/change-doctor.png'
    // },
    icons: {
      flash_off: 'https://imgs.hh-medic.com/icon/wmp/trtc/flash_off.png',
      flash_on: 'https://imgs.hh-medic.com/icon/wmp/trtc/flash_on.png',
      certificate: 'https://imgs.hh-medic.com/icon/wmp/trtc/certificate.png',
      hangup: 'https://imgs.hh-medic.com/icon/wmp/trtc/hangup.png',
      accept: 'https://imgs.hh-medic.com/icon/wmp/trtc/accept.png',
      camera: 'https://imgs.hh-medic.com/icon/wmp/trtc/camera2.png',
      switch_camera: 'https://imgs.hh-medic.com/icon/wmp/trtc/switch_camera3.png',
      arrow_up: 'https://imgs.hh-medic.com/icon/wmp/trtc/arrow_up3.png',
      arrow_down: 'https://imgs.hh-medic.com/icon/wmp/trtc/arrow_down2.png',
      warning: 'https://imgs.hh-medic.com/icon/wmp/trtc/warning.png',
      hangup_disabled: 'https://imgs.hh-medic.com/icon/wmp/trtc/hangup_disabled.png',
      change_doctor: 'https://imgs.hh-medic.com/icon/wmp/trtc/change_doctor.png',
      invite: 'https://imgs.hh-medic.com/icon/wmp/trtc/invite3.png',
      call_other: 'https://imgs.hh-medic.com/icon/wmp/trtc/call-other.png'
    }

  },
  methods: {
    /** 上报日志 */
    requestRtcLog(type, content, orderId) {
      hhDoctor.addLog(type, content, orderId);
      if ('life:detached' == content) {
        hhDoctor.refreshSession(500);
      }
    },
    throttle(btn, wait) {
      return throttle(btn, wait)
    }
  }
})