const app = getApp();
var APIURLs = {
  getMembers: "ehr/v2/api/getMemberList", // 获取家庭成员
  addUserMember: "ehr/v2/api/addUserMember", //添加家庭成员
  updateUserMember: 'ehr/v2/api/updateUserMember', //更新成员信息
  completeUserInfo: 'ehr/v2/api/completeUserInfo', //完善成员信息
  deleteMember: "ehr/v2/api/delUserMember", //删除家庭成员
  addEhr: "/ehr/v2/api/addEhr", //添加档案
  getAuthCode: "/ehr/v2/api/getAuthCode",//获取授权码
  getEhrList: "ehr/v2/api/getEhrList", //获取档案list
  getEhrDetail: "ehr/v2/api/getEhrDetail", //获取档案详情,
  createFamOrder: 'trtc/createFamOrder', //trtc-begin 创建订单
  hangup: 'trtc/hangup', //rtc-挂断呼叫
  transfer: 'wmp/transferCall', //rtc-获取转呼医生信息
  addAttatch: 'trtc/addAttatch', //trc-上传图片成功后上传附件
  callResponse: 'trtc/callResponse', //rtc-回拨接听调取的接口
  sendMessage: 'trtc/sendMessage',
  getOrderStatus: 'trtc/getOrderStatus',//rtc-检测订单消息状态
  commitQuestion: 'trtc/commitQuestion',//rtc-评价提交问题
  commitFeedback: 'trtc/commitFeedback',//rtc-星级评价 匿名提交
  changeDoctor: 'trtc/changeDoctor',//rtc-换个医生问问
  reportLocation: 'trtc/reportLocation',  //上报实时位置
  saveIdCard: 'trtc/saveIdCard',        //保存真实姓名、身份证信息并实名认证
  createRx: 'trtc/createRx',              //创建处方
  getRxPatientInfo: 'trtc/getRxDrugOrderPatientInfo',  //获取处方患者信息 
  updateDrugCount: 'trtc/updateDrugCount',  //更新药卡中的药品数量 
  sendCustomerMessage: 'trtc/sendCustomerMessage',
  getCardInfo: 'trtc/getCardInfo',//获取药卡信息
  getDoctorsTeam: 'yangguang/getDoctorsTeam',//阳光-获取私人医生团队列表
  deleteDoctorFromTeam: 'yangguang/deleteDoctorFromTeam',//删除私人医生
  requestAddDoctorToTeam: "yangguang/addDoctorToTeam",//添加医生到私人医生
  requestGetUserInfo: "trtc/getUserInfo",//获取用户相关信息
  getPsycholMed: 'trtc/getPsycholMed', //获取心理测评链接
  viewWhiteboard: 'trtc/whiteboard',  //白板地址
};



function getEhrUrl(url) {
  return getApp().globalData._hhSdkOptions._host.ehrHost + url;
}
// ehr
function getUploadUrl() {
  return getApp().globalData._hhSdkOptions._host.ehrHost + 'ehr/v2/api/uploadFile';
}

function getRtcUrl(url) {
  return getApp().globalData._hhSdkOptions._host.wmpHost + url;
}

function getRtcUploadUrl() {
  return getApp().globalData._hhSdkOptions._host.wmpHost + `im/upload?sdkProductId=${getApp().globalData._hhSdkOptions._sdkProductId}&userToken=${getApp().globalData._hhSdkOptions._userToken}`;
}




function request(url, data) {
  return new Promise(function (resolve, reject) {
    data['sdkProductId'] = getApp().globalData._hhSdkOptions._sdkProductId;
    data['userToken'] = getApp().globalData._hhSdkOptions._userToken
    wx.request({
      url: getEhrUrl(url),
      data: data,
      method: "POST",
      success(res) {
        if (res.statusCode == 200) {
          resolve(res.data);
        } else {
          reject(res);
        }
      },
      fail(res) {
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
function requestCompleteMember(member, memberUuid) {
  return request(APIURLs.completeUserInfo, {
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
//获取授权码
function requestGetAuthCode() {
  let url = `${APIURLs.getAuthCode}?appId=${getApp().globalData._hhSdkOptions._sdkProductId}&userToken=${getApp().globalData._hhSdkOptions._userToken}`
  return request(url, {})
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
  return new Promise(function (resolve, reject) {
    wx.request({
      url: getRtcUrl(url),
      data: data,
      method: "POST",
      success(res) {
        if (res.statusCode == 200) {
          resolve(res.data);
        } else {
          reject(res);
        }
      },
      fail(res) {
        reject(res);
      }
    });
  });
}

//rtc-1.创建订单
// ?dept = ${ this.data._request.dept }`

function requestCreateFamOrder(dept, famOrderId, orderType, platform, sdkVersion, hhDoctorSdkVersion, realPatientUuid, realPatientUserToken, appointedDoctorId, appointedOrderId, mrId, hospitalId, ext) {
  console.log('orderType', orderType)
  let obj = {};
  obj['sdkProductId'] = getApp().globalData._hhSdkOptions._sdkProductId;
  obj['userToken'] = getApp().globalData._hhSdkOptions._userToken;
  obj['callType'] = getApp().globalData.callType || '';
  obj['dept'] = dept;
  obj['famOrderId'] = famOrderId;
  obj['orderType'] = orderType || '';
  obj['platform'] = platform;
  obj['sdkVersion'] = sdkVersion;
  obj['hhDoctorSdkVersion'] = hhDoctorSdkVersion;
  obj['realPatientUuid'] = realPatientUuid;
  obj['realPatientUserToken'] = realPatientUserToken || '';
  obj['appointedDoctorId'] = appointedDoctorId || '';
  obj['appointedOrderId'] = appointedOrderId || '';
  obj['mrId'] = mrId || '';
  obj['hospitalId'] = hospitalId || '';
  obj['ext'] = ext || '';
  let url = '';
  Object.keys(obj).forEach(function (key) {
    if (obj[key] && key) {
      url += `${key}=${obj[key]}&`;
    }
  });
  return requestRtc(APIURLs.createFamOrder + '?' + url, {})

}
function sendCustomerMessage(fromUser, toUser, command, famOrderId, data) {
  let query = `sdkProductId=${getApp().globalData._hhSdkOptions._sdkProductId}&userToken=${getApp().globalData._hhSdkOptions._userToken}`
  let msg = `&fromUser=${fromUser}&toUser=${toUser}&command=${command}&famOrderId=${famOrderId}`
  return requestRtc(APIURLs.sendCustomerMessage + '?' + query + msg, {})

}
//rtc-2.挂断呼叫
function requestHangUp(params) {
  let query = `sdkProductId=${getApp().globalData._hhSdkOptions._sdkProductId}&userToken=${getApp().globalData._hhSdkOptions._userToken}`
  return requestRtc(APIURLs.hangup + params + '&' + query, {})
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
  let callType = getApp().globalData.callType ? `&callType=${getApp().globalData.callType}` : '';
  let query = `sdkProductId=${getApp().globalData._hhSdkOptions._sdkProductId}&userToken=${getApp().globalData._hhSdkOptions._userToken}${callType}`
  let url = `?response=accept&famOrderId=${orderid}&${query}`;
  return requestRtc(APIURLs.callResponse + url, {})
}

//rtc-7. 发送消息接口
function requestSendMessage(toUser, msgData, orderId) {
  let url = `?sdkProductId=${getApp().globalData._hhSdkOptions._sdkProductId}&userToken=${getApp().globalData._hhSdkOptions._userToken}&toUser=${toUser}&famOrderId=${orderId}`;

  return requestRtc(APIURLs.sendMessage + url, msgData)
}

//rtc-8 检测订单消息状态
function requestGetOrderStatus(orderId) {
  let url = `?sdkProductId=${getApp().globalData._hhSdkOptions._sdkProductId}&userToken=${getApp().globalData._hhSdkOptions._userToken}&famOrderId=${orderId}`;
  return requestRtc(APIURLs.getOrderStatus + url, {})
}
//evaluate-1 提交问题
function requestCommitQuestion(questionId, answer, famOrderId) {
  let url = `?sdkProductId=${getApp().globalData._hhSdkOptions._sdkProductId}&userToken=${getApp().globalData._hhSdkOptions._userToken}&famOrderId=${famOrderId}&questionId=${questionId}&answer=${answer}`;
  return requestRtc(APIURLs.commitQuestion + url, {})
}
//evaluate-2 星级评价 匿名提交
function requestCommitFeedback(params) {
  let url = `?sdkProductId=${getApp().globalData._hhSdkOptions._sdkProductId}&userToken=${getApp().globalData._hhSdkOptions._userToken}`;
  return requestRtc(APIURLs.commitFeedback + url + params, {})
}
function requestChangeDoctor(famOrderId) {
  let callType = getApp().globalData.callType ? `&callType=${getApp().globalData.callType}` : '';
  let url = `?sdkProductId=${getApp().globalData._hhSdkOptions._sdkProductId}&userToken=${getApp().globalData._hhSdkOptions._userToken}&famOrderId=${famOrderId}${callType}`;
  return requestRtc(APIURLs.changeDoctor + url, {})

}
function requestReportLocation(latitude, longitude) {
  latitude = latitude.toFixed(6), longitude = longitude.toFixed(6)
  let url = `?sdkProductId=${getApp().globalData._hhSdkOptions._sdkProductId}&userToken=${getApp().globalData._hhSdkOptions._userToken}&latitude=${latitude}&longitude=${longitude}`;
  return requestRtc(APIURLs.reportLocation + url, {})
}

function requestSaveIdCard(memberUserToken, name, idCard, informationId, phoneNum) {
  let url = `?sdkProductId=${getApp().globalData._hhSdkOptions._sdkProductId}&userToken=${getApp().globalData._hhSdkOptions._userToken}&memberUserToken=${memberUserToken}&name=${name}&idCard=${idCard}&phoneNum=${phoneNum}&informationId=${informationId}`;
  return requestRtc(APIURLs.saveIdCard + url, {})
}
function requestCreateRx(orderId, medicRecordId) {
  let url = `?sdkProductId=${getApp().globalData._hhSdkOptions._sdkProductId}&userToken=${getApp().globalData._hhSdkOptions._userToken}&orderId=${orderId}&medicRecordId=${medicRecordId}`;
  return requestRtc(APIURLs.createRx + url, {})
}

function requestGetRxPatientInfo(patientUserToken, patientUuid, hasRx) {
  let url = `?sdkProductId=${getApp().globalData._hhSdkOptions._sdkProductId}&userToken=${getApp().globalData._hhSdkOptions._userToken}&patientUserToken=${patientUserToken || ''}&patientUuid=${patientUuid || ''}&hasRx=${hasRx}`;
  return requestRtc(APIURLs.getRxPatientInfo + url, {})
}
/** 更新药卡中药品数量 */
function requestUpdateDrugCount(informationId, drugId, drugCount) {
  let url = `?sdkProductId=${getApp().globalData._hhSdkOptions._sdkProductId}&userToken=${getApp().globalData._hhSdkOptions._userToken}&informationId=${informationId}&drugId=${drugId}&drugCount=${drugCount}`;
  return requestRtc(APIURLs.updateDrugCount + url, {})
}
/** 获取卡片信息 */
function requestGetCardInfo(id) {
  let url = `?sdkProductId=${getApp().globalData._hhSdkOptions._sdkProductId}&userToken=${getApp().globalData._hhSdkOptions._userToken}&id=${id}`;
  return requestRtc(APIURLs.getCardInfo + url, {})
}
function requestGetDoctorsTeam() {
  let url = `?sdkProductId=${getApp().globalData._hhSdkOptions._sdkProductId}&userToken=${getApp().globalData._hhSdkOptions._userToken}`;
  return requestRtc(APIURLs.getDoctorsTeam + url, {})
}
function requestDeleteDoctorFromTeam(doctorId) {
  let url = `?sdkProductId=${getApp().globalData._hhSdkOptions._sdkProductId}&userToken=${getApp().globalData._hhSdkOptions._userToken}&doctorId=${doctorId}`;
  return requestRtc(APIURLs.deleteDoctorFromTeam + url, {})

}
function requestAddDoctorToTeam(doctorId) {
  let url = `?sdkProductId=${getApp().globalData._hhSdkOptions._sdkProductId}&userToken=${getApp().globalData._hhSdkOptions._userToken}&doctorId=${doctorId}`;
  return requestRtc(APIURLs.requestAddDoctorToTeam + url, {})
}
function requestGetUserInfo() {
  let url = `?sdkProductId=${getApp().globalData._hhSdkOptions._sdkProductId}&userToken=${getApp().globalData._hhSdkOptions._userToken}`;
  return requestRtc(APIURLs.requestGetUserInfo + url, {})
}
function requestGetPsycholMed() {
  let url = `?sdkProductId=${getApp().globalData._hhSdkOptions._sdkProductId}&userToken=${getApp().globalData._hhSdkOptions._userToken}`;
  return requestRtc(APIURLs.getPsycholMed + url, {})
}

function getWhiteboardUrl(classId, orderId, videoStartTime) {
  let url = `?sdkProductId=${getApp().globalData._hhSdkOptions._sdkProductId}&userToken=${getApp().globalData._hhSdkOptions._userToken}&classId=${classId}&famOrderId=${orderId}&videoStartTime=${videoStartTime}`;
  return getRtcUrl(APIURLs.viewWhiteboard) + url
}

module.exports = {
  getUploadUrl,
  requestGetMember,
  requestAddUserMember,
  requestDeleteMember,
  requestAddEhr,
  requestGetAuthCode,
  requestGetEhrList,
  requestGetEhrDetail,
  requestUpdateMember,
  requestCompleteMember,
  requestCreateFamOrder,
  requestHangUp,
  requestDoctor,
  getRtcUploadUrl,
  requestAddAttatch,
  requestCallResponse,
  requestSendMessage,
  requestGetOrderStatus,
  requestCommitQuestion,
  requestCommitFeedback,
  requestChangeDoctor,
  requestReportLocation,
  requestSaveIdCard,
  requestCreateRx,
  requestGetRxPatientInfo,
  requestUpdateDrugCount,
  sendCustomerMessage,
  requestGetCardInfo,
  requestGetDoctorsTeam,
  requestDeleteDoctorFromTeam,
  requestAddDoctorToTeam,
  requestGetUserInfo,
  requestGetPsycholMed,
  getWhiteboardUrl
}