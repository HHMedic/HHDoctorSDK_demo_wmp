const hhDoctor = require('../../hhDoctor')
const uiUtil = require('../../utils/uiUtil')
let redirect, userToken, memberName
let tips = {drug:'实名认证后，需呼叫医生重新开药'}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tip: '',
    mode:'',//模式标识，药卡drug点进来需支持购药提示和呼叫医生
  },
  
  onLoad: function (options) {
    console.log(options,options.mode)
    this.setData({ 
      mode:options.mode||'',
      tip: options.tip || (options.mode ? tips[options.mode]: ''), 
      memberName: options.memberName || '' ,
      realPatientUuid:options.realPatientUuid||'',
      callPage: hhDoctor.getOptions().callPage,
      informationId:options.informationId||''
    })
    redirect = options && options.redirect || 'back'
    userToken = options && options.userToken || ''
    
  },

  commit(e) {
    //这里需要加一个防连点
    setTimeout(()=>{
      let data = this.selectComponent('#realname').submitValidate()
      if(this.data.informationId){
        data['informationId'] = this.data.informationId//更新卡片实名状态
        wx.setStorageSync('needReloadMsg', true)
      }
      if (!data) return
      let medicUtil = require('../../utils/medicUtil')
      medicUtil.saveIdCard(data, userToken,'default')
        .then(res => {
          if(e.currentTarget.dataset.action == 'save-call'){
            redirect = 'call'
          }
          this.afterAuth()
        })
        .catch(err => uiUtil.error(err, '网络不给力，请稍后再试'))
        uiUtil.hideLoading()
    },200)
 
  },
  /** 实名认证后 */
  afterAuth() {
    switch (redirect) {
      case 'call':
        if(this.data.realPatientUuid){
          let url = this.data.callPage + '?' + hhDoctor.getPublicParams() + '&dept=600002' + '&realPatientUuid=' + this.data.realPatientUuid;
          wx.redirectTo({ url })
        }
        break
      default:
        wx.navigateBack({ delta: 1 })
        break
    }
  }
})