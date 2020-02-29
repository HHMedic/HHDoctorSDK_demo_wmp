const app = getApp();
var APIURLs = {
  getMembers: "ehr/v2/api/getMemberList", // 获取家庭成员
  addUserMember: "ehr/v2/api/addUserMember", //添加家庭成员
  updateUserMember: 'ehr/v2/api/updateUserMember', //更新成员信息
  deleteMember: "ehr/v2/api/delUserMember", //删除家庭成员
  addEhr: "/ehr/v2/api/addEhr", //添加档案
  getEhrList: "ehr/v2/api/getEhrList", //获取档案list
  getEhrDetail: "ehr/v2/api/getEhrDetail", //获取档案详情,
  createFamOrder: 'trtc/createFamOrder', //trtc-begin 创建订单
  hangup: 'trtc/hangup', //挂断呼叫
  rtcLog: 'trtc/log', //上报日志
  transfer: 'wmp/transferCall', //获取转呼医生信息
  addAttatch: 'trtc/addAttatch', //上传图片成功后上传附件
  callResponse: 'trtc/callResponse', //回拨接听调取的接口
  sendMessage: 'trtc/sendMessage',
  getOrderStatus: 'trtc/getOrderStatus'//检测订单消息状态
};

function getEhrUrl(url) {
  return app.globalData._hhSdkOptions._host.ehrHost + url;
}
// ehr
function getUploadUrl() {
  return app.globalData._hhSdkOptions._host.ehrHost + 'ehr/v2/api/uploadFile';
}

function getRtcUrl(url) {
  return getApp().globalData._hhSdkOptions._host.wmpHost + url;
}

function getRtcUploadUrl() {
  return getApp().globalData._hhSdkOptions._host.wmpHost + 'im/upload';
}




function request(url, data) {
  return new Promise(function(resolve, reject) {
    data['sdkProductId'] = app.globalData._hhSdkOptions._sdkProductId;
    data['userToken'] = app.globalData._hhSdkOptions._userToken
    wx.request({
      url: getRealUrl(url),
      data: data,
      method: "POST",
      success(res) {
        if (res.statusCode == 200) {
          resolve(res.data);
        } else {
          wx.showModal({
            title: '提示',
            content: res && res.data && res.data.error || "网络请求错误",
            showCancel: false
          });
          reject(res);
        }
      },
      fail(res) {
        wx.showModal({
          title: '提示',
          content: res && res.data && res.data.error || "网络请求错误",
          showCancel: false
        });
        reject(res);
      }
    });
  });
}

//1.获取家庭成员
function requestGetMember() {
  return request(APIURLs.getMembers, {});
}
//2.添加家庭成员
function requestAddUserMember(member) {
  return request(APIURLs.addUserMember, {
    member
  })
}
//3.更新成员信息
function requestUpdateMember(member, memberUuid) {
  return request(APIURLs.updateUserMember, {
    member,
    memberUuid
  })
}
//4.删除家庭成员
function requestDeleteMember(memberUuid) {
  return request(APIURLs.deleteMember, {
    memberUuid
  })
}
//5.添加档案
function requestAddEhr(data) {
  return request(APIURLs.addEhr, data)
}
//6.获取指定用户的档案列表
function requestGetEhrList(memberUuid, memberUserToken) {
  return request(APIURLs.getEhrList, {
    memberUuid,
    memberUserToken
  })
}

//7.获取指定用户的档案详情
function requestGetEhrDetail(medicRecordId, memberUuid, memberUserToken) {
  return request(APIURLs.getEhrDetail, {
    medicRecordId,
    memberUuid,
    memberUserToken
  })
}

/** -------以下是trtc模块分割线------- **/
//rtc
function requestRtc(url, data, isLog) {
  return new Promise(function(resolve, reject) {
    wx.request({
      url: getRtcUrl(url),
      data: data,
      method: "POST",
      success(res) {
        if (res.statusCode == 200) {
          resolve(res.data);
        } else {
          if (!isLog) {
            wx.showModal({
              title: '提示',
              content: res && res.data && res.data.error || "网络请求错误",
              showCancel: false
            });
          }
          reject(res);
        }
      },
      fail(res) {
        if (!isLog) {
          wx.showModal({
            title: '提示',
            content: res && res.data && res.data.error || "网络请求错误",
            showCancel: false
          });
        }
        reject(res);
      }
    });
  });
}

//rtc-1.创建订单
// ?dept = ${ this.data._request.dept }`
function requestCreateFamOrder(dept, famOrderId, platform, sdkVersion) {
  let query = `sdkProductId=${getApp().globalData._hhSdkOptions._sdkProductId}&userToken=${getApp().globalData._hhSdkOptions._userToken}`

  let orderid = famOrderId ? `&famOrderId=${famOrderId}` : ''
  let url = `?dept=${dept}&platform=${platform}&sdkVersion=${sdkVersion}+&${query}`
  return requestRtc(APIURLs.createFamOrder + url + orderid, {})
}
//rtc-2.挂断呼叫
function requestHangUp(params) {
  let query = `sdkProductId=${getApp().globalData._hhSdkOptions._sdkProductId}&userToken=${getApp().globalData._hhSdkOptions._userToken}`
  return requestRtc(APIURLs.hangup + params + '&' + query, {})
}
//rtc-3. 上报日志
function requestRtcLog(type, content, orderId) {
  let query = `sdkProductId=${getApp().globalData._hhSdkOptions._sdkProductId}&userToken=${getApp().globalData._hhSdkOptions._userToken}`
  let orderid = orderId ? orderId : getApp().globalData.orderId ? getApp().globalData.orderId : '';
  return requestRtc(APIURLs.rtcLog + '?' + query, {
    type,
    content: content || '',
    orderId: orderid
  }, true)
}

//rtc-4. 获取医生资源
function requestDoctor(data) {
  return requestRtc(APIURLs.transfer, data)
}
//rtc-5. 图片上传后需要上传附件
function requestAddAttatch(params) {
  let query = `sdkProductId=${getApp().globalData._hhSdkOptions._sdkProductId}&userToken=${getApp().globalData._hhSdkOptions._userToken}`
  return requestRtc(APIURLs.addAttatch + params + '&' + query, {})

}

//rtc-6. 回拨接听调取的接口
function requestCallResponse(orderid) {
  let query = `sdkProductId=${getApp().globalData._hhSdkOptions._sdkProductId}&userToken=${getApp().globalData._hhSdkOptions._userToken}`
  let url = `?response=accept&famOrderId=${orderid}&${query}`;
  return requestRtc(APIURLs.callResponse + url, {})
}

//rtc-7. 发送消息接口
function requestSendMessage(toUser, msgData, orderId) {
  let url = `?sdkProductId=${getApp().globalData._hhSdkOptions._sdkProductId}&userToken=${getApp().globalData._hhSdkOptions._userToken}&toUser=${toUser}&famOrderId=${orderId}`;

  return requestRtc(APIURLs.sendMessage + url, msgData)
}

//rtc-8 检测订单消息状态
function requestGetOrderStatus(orderId){
  let url = `?sdkProductId=${getApp().globalData._hhSdkOptions._sdkProductId}&userToken=${getApp().globalData._hhSdkOptions._userToken}&famOrderId=${orderId}`;
  return requestRtc(APIURLs.getOrderStatus + url, {})
}

module.exports = {
  getUploadUrl,
  requestGetMember,
  requestAddUserMember,
  requestDeleteMember,
  requestAddEhr,
  requestGetEhrList,
  requestGetEhrDetail,
  requestUpdateMember,
  requestCreateFamOrder,
  requestHangUp,
  requestRtcLog,
  requestDoctor,
  getRtcUploadUrl,
  requestAddAttatch,
  requestCallResponse,
  requestSendMessage,
  requestGetOrderStatus
}