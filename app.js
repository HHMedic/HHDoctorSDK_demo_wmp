//app.js
const profileName = "test";
const sdkProductId = 9003;
const userToken = 'E6E6E880BB3AD4A1D8B31FE763B6ADEB3F0D04F68EA2608F6783B874E4F50EEF';
const openId = 'oirIW0Rc9lRBp3PyfCyxis123JR0';
const hhDoctor = require('./miniprogram_npm/hhdoctor-wmp-sdk/hhDoctor.js');;

App({
  onLaunch: function() {},

  hhDoctorLogin() {
    hhDoctor.logout();
    return hhDoctor.login({
      profileName: profileName,
      subDomain: '',
      sdkProductId: sdkProductId,
      userToken: userToken,
      openId: openId,
      callPage: '/pages/call/call'
    })
  },

  globalData: {
    profileName: profileName,
    sdkProductId: sdkProductId,
    userToken: userToken,
    openId: openId
  },

})