const uiUtil = require('./uiUtil')
const customApis = require('./customApi')
const envVersion = __wxConfig.envVersion == 'release' ? 'release' : 'trial';
let _data, patHost, currHost
let naviToMed = options => {
  console.log('>>> naviToMed:', options)
  initHost()
  _data = {
    basePath: options.basePath,
    redirectPage: options.redirectPage || '',
    openId: options.openId,
    userToken: options.userToken,
    sdkProductId: options.sdkProductId,
    drugCount: options.drugCount || '',
    orderId: options.data.orderId,
    drugId: options.data.drugId,
    nickname: options.name || '',
    userphone: options.phoneNum || '',
    isAuth: options.isAuth,
    hasRx: options.hasRx,
    informationId: options.data.id,
    memberUserToken: options.memberUserToken,
    //status: _data.status,
    medicRecordId: options.data.medicRecordId,
    buttonName: options.buttonName,
    source: options.data.source,
    pageUrl: options.pageUrl || '',
    token: options.token || '',//xiaoyaoyao
    carturl: options.data.carturl,
    medicationList: options.medicationList || []
  }
  if (options.data.carturl) {
    jumpMedicCartUrlH5(options.data.carturl)
    return
  }
  switch (options.data.source) {
    case 'eleme':
    case 'elemeB2C':
      console.log('isEleJumpHh', options.data)
      if (options.data.isEleJumpHh) {
        jumpBuyMedicH5();
        return
      }
      jumpEleme()
      break
    case 'yishu':
      jumpYiShu()
      break
    case 'xiaoyaoyao':
      jumpXiaoYaoYao()
      break
    // case 'miao':
    //   jumpMedicMiaoH5(options.data.carturl)
    //   break
    default:
      jumpBuyMedicH5();
      break
  }
}

let saveIdCard = (data, userToken, scene) => {
  return new Promise((resolve, reject) => {
    if (!data) return reject({ message: '无实名数据' })
    initHost()
    uiUtil.loading('保存中...')
    // name={0}&idCard={1}&phoneNum={2}&guardianName={3}&guardianCardInfo={4}&memberUserToken={5}&informationId={6}
    if (!scene) scene = 'default'
    let result = [data['username'], data['idcard'], data['phone'] || data['guardian_phone'], data['guardian_username'] || '', data['guardian_idcard'] || '', userToken, data['informationId'] || '', 'ID_CARD', 'ID_CARD', scene]
    console.log('>>> result:', result)
    customApis.REQUESTPOSTCUS(currHost, customApis.APIURLS.saveIdCard, ...result)
      .then(res => {
        uiUtil.toast('实名认证成功')
        setTimeout(() => resolve(res), 1500);
      }).catch(err => reject(err))
  })
}

let initHost = () => {
  if (!patHost || !currHost) {
    let host = require('./hostUtil'), profileName = getApp().globalData._hhSdkOptions._profileName, subDomain = getApp().globalData._hhSdkOptions._subDomain
    patHost = host.getHost(profileName, subDomain).patHost
    currHost = host.getHost(profileName, subDomain).wmpHost
  }
}
let jumpBuyMedicH5 = () => {
  getApp().globalData._hhSdkOptions.drugOrderId = _data.drugId;
  getApp().globalData._hhSdkOptions.redirectPage = _data.redirectPage;
  let url = `${patHost}drug/order.html?` +
    `drugOrderId=${_data.drugId}` +
    `&sdkProductId=${_data.sdkProductId}` +
    `&openId=${_data.openId}` +
    `&userToken=${_data.userToken}` +
    `&payPage=${encodeURIComponent(_data.basePath + 'innerpages/pay/pay')}` +
    `&redirectPage=${_data.redirectPage}` +
    `&source=wmpSdk` +
    `&_=${new Date().getTime()}`
  let page = _data.basePath + 'innerpages/view/view?url=' + encodeURIComponent(url)
  console.log(page)
  wx.navigateTo({ url: page })
}

let jumpMedicCartUrlH5 = cartUrl => {
  cartUrl += `&openId=${_data.openId}` +
    `&payPage=${encodeURIComponent(_data.basePath + 'innerpages/pay/pay')}` +
    `&redirectPage=${_data.redirectPage}` +
    `&source=wmpSdk` +
    `&_=${new Date().getTime()}`
  if (cartUrl.includes('miao')) {
    cartUrl += `&thirdId=${_data.openId}`
  }
  let url = `${_data.basePath}innerpages/view/view?url=${encodeURIComponent(cartUrl)}`
  wx.navigateTo({ url })
}
//跳转饿了么
let jumpEleme = () => {
  let test = encodeURIComponent(`https://h5.alta.elenet.me/newretail/feat-test1/hehuan/?drug=${getParams()}`)
  let prod = encodeURIComponent(`https://h5.ele.me/newretail/p/hehuan/?drug=${getParams()}`)
  let path = `/pages/container/index?href=${prod}`;
  navigateToMiniOrderList('eleme', path)
}
let jumpYiShu = () => {
  //壹树-跳转壹安康小程序
  let path = `pages/webview/hh/index?orderId=${_data.orderId}`;
  navigateToMiniOrderList('yiShu', path, envVersion)
}
let jumpXiaoYaoYao = () => {
  //荷叶健康-跳转小程序
  let path = `pages/channelDocking/channelDocking`
  path += `?token=${_data.memberUserToken}&orderId=${_data.drugId}&tel=${_data.userphone}&source=hehuan&status=0`
  console.log(path)
  navigateToMiniOrderList('xiaoYaoYao', path, envVersion)
}
//饿了么传入参数
let getParams = () => {
  let drug = {}
  let drugList = [];
  drug['outId'] = 100001 + '_' + _data.drugId;
  drug['storeId'] = _data.medicationList[0].storeId;
  drug['partnerId'] = 100001;
  _data.medicationList.map((item, index) => {
    drugList.push([item.drugThirdId, item.count])
  })
  drug['drugList'] = drugList;
  return encodeURIComponent(JSON.stringify(drug))
}


// 跳转不同小程序-根据小程序名称,path,小程序版本环境
function navigateToMiniOrderList(appName, path, env) {
  return new Promise((resolve, reject) => {
    console.log('path--->', path)
    let appIdList = {
      yiYao: 'wxa090add7f8c97f94',
      eleme: 'wxece3a9a4c82f58c9',
      //yiShu: (env != 'release' && getApp().globalData.profile=='test')?'wx56923640462b4e69':'wxd4e5d6c3d86f9760',//测试'wx56923640462b4e69',//生产'wxd4e5d6c3d86f9760',
      yiShu: 'wx56923640462b4e69',
      xiaoYaoYao: 'wx776afedbfae3a228'
    }
    wx.navigateToMiniProgram({
      appId: appIdList[appName],
      path,
      envVersion: env || 'release',//'trial'
      complete() {
        resolve()
      }
    })
  })
}


module.exports = {
  naviToMed,
  saveIdCard,
  navigateToMiniOrderList
}