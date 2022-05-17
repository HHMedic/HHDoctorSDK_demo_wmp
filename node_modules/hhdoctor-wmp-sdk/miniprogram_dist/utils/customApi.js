const APIURLS = {
  getDiagnosis: 'proxy/familyapp/drug/order/visit/getDiagnosis?drugOrderId={0}',
  saveIdCard: `proxy/familyapp/user/saveIdCard?name={0}&idCard={1}&phoneNum={2}&guardianName={3}&guardianCardInfo={4}&memberUserToken={5}&informationId={6}&scene={7}`,
  saveFaceIdCard: `proxy/familyapp/user/saveIdCard?name={0}&idCard={1}&phoneNum={2}&memberUserToken={3}`,
  getJumpGHParam: `proxy/familyapp/patientweb/coop/order/params?productRightsEnum={0}`,
  informationFlow: `proxy/familyapp/informationFlow/openCard?informationId={0}`,//获取服务端返回url
  delInformationFlow: `proxy/familyapp/informationFlow/del?id={0}&uuid={1}&pid={2}&app_version=5.0.0`,  //删除信息流中的卡片
}

//queryPost
function REQUESTPOSTCUS(host, url, ...args) {
  if (args) url = host + formatUrl(url, ...args)
  return request(url, 'post')
}
function request(url, method, data) {
  let _options = getApp().globalData._hhSdkOptions;
  let param = `sdkProductId=${_options._sdkProductId}&userToken=${_options._userToken}&hhDoctorSdkVersion=${wx.getStorageSync('SdkVersion')}`
  url += url.indexOf('?') == -1 ? `?${param}` : `&${param}`
  console.log('>>> ', url)
  return new Promise(function (resolve, reject) {
    wx.request({
      url: url,
      data: data || {},
      method: method ? method.toUpperCase() : 'POST',
      timeout: 10000,
      success(res) {
        if (200 == res.statusCode && res.data &&
          res.data.status && 200 == res.data.status) {
          resolve(res.data);
        } else {
          reject(res.data);
        }
      },
      fail(err) {
        console.log(err)
        reject(err);
      }
    });
  });
}
function formatUrl(url) {
  if (1 == arguments.length) return url
  let args
  if (2 == arguments.length && "object" == typeof arguments[1]) {
    args = arguments[1]
  } else {
    args = new Array(arguments.length - 1)
    for (let i = 1; i < arguments.length; i++) {
      args[i - 1] = arguments[i]
    }
  }
  for (var s = url, i = 0; i < args.length; i++)
    s = s.replace(new RegExp("\\{" + i + "\\}", "g"), encodeURIComponent(args[i]))
  return s
}
module.exports = {
  APIURLS,
  REQUESTPOSTCUS
}