const api = require('./api');

let accessCardCommand = [];
let findLinkFromText = require('./commonUtil').findLinkFromText
let apiUtil

function isAccessCardCommand(command) {
  if (0 == accessCardCommand.length) {
    accessCardCommand['summaryByFam'] = 1               //
    accessCardCommand['buyDrugInformation'] = 1         //
    accessCardCommand['buyService'] = 1                 //
    accessCardCommand['commandProductTips'] = 1         //
    accessCardCommand['command_recomment_doctor'] = 1   //推荐专家卡片
    accessCardCommand['appointmentExpertSuccess'] = 1   //专家设置时间卡片
    accessCardCommand['psycholForm'] = 1                //心理表单卡片
    accessCardCommand['psycholFeedback'] = 1            //心理表反馈
    accessCardCommand['appointmentExpertSuccess'] = 1   //专家设置预约时间成功卡片
    accessCardCommand['psycholTips'] = 1                //心理介绍说明
    accessCardCommand['nurseReport'] = 1                //护理报告
    accessCardCommand['nurseDetail'] = 1                //护理服务详情
    accessCardCommand['drugProductUser'] = 1            //药卡活动有套餐老用户推送卡片
    accessCardCommand['drugNoProductUser'] = 1          //药卡活动无套餐用户推送卡片
    accessCardCommand['drugOrderHangUp'] = 1            //药卡活动挂断卡片
    accessCardCommand['commandNetHospitalRx'] = 1       //处方笺卡片(互联网医院)
    accessCardCommand['welcomeTips'] = 1                //欢迎卡片
    accessCardCommand['fastchannel'] = 1                //重疾通道
    accessCardCommand['nurse_home'] = 1                 //医护到家
    accessCardCommand['hao'] = 1                        //挂号表单
    accessCardCommand['fastchannel_detail'] = 1         //重疾通道
    accessCardCommand['nurse_home_detail'] = 1          //医护到家
    accessCardCommand['hao_detail'] = 1                 //挂号表单

  }
  return accessCardCommand[command] && 1 == accessCardCommand[command]
}

/** 解析服务器推送的历史消息 */
function parseMsgHistory(msgHis, uuid) {
  if (!msgHis.data) return;
  if (0 >= msgHis.data.length) return;
  let msgs = [];
  for (let i = 0; i < msgHis.data.length; i++) {
    let msg = msgHis.data[i];
    switch (msg.type) {
      case 0: //文本消息
        msgs.push({
          id: msg.msgid,
          type: 'text',
          from: msg.from,
          head: '',
          name: '',
          time: msg.sendtime,
          text: msg.body.msg,
          textArr: findLinkFromText(msg.body.msg),
        });
        break;
      case 1: //图片消息
        msgs.push({
          id: msg.msgid,
          type: 'image',
          from: msg.from,
          head: '',
          name: '',
          time: msg.sendtime,
          url: msg.body.url,
          thumbnail: msg.body.url + '?x-oss-process=image/resize,m_fixed,w_200',
        });
        break;
      case 2: //音频消息
        msgs.push({
          id: msg.msgid,
          type: 'audio',
          from: msg.from,
          head: '',
          name: '',
          time: msg.sendtime,
          url: getAudioMsgUrl(msg.body.ext, msg.from, msg.msgid, msg.body.url),
          dur: msg.body.dur
        });
        break;
      case 9999: //卡片消息
        var content = JSON.parse(msg.body.content);
        content = processDrugCard(msg.body, content)
        if (!isAccessCardCommand(content.command)) break
        msgs.push({
          id: msg.msgid,
          type: 'card',
          from: msg.from,
          head: msg.body.talkUserPic,
          name: msg.body.talkName,
          patient: msg.body.patientUuid,
          time: msg.sendtime,
          body: msg.body,
          bodyContent: content
        });
        //}
        break;
      default:
        break;
    }
  }
  return msgs;
}

//获取音频类消息的实际音频文件地址
function getAudioMsgUrl(ext, from, msgId, url) {
  if ('amr' == ext) {
    url = 'https://imgfamily.hh-medic.com/family/' + from + '/audio/' + msgId + '.aac';
  }
  return url;
}

//处理药卡
function processDrugCard(body, content) {
  content = checkElemeDrugIsExpired(body, content)
  content = checkSystemTips(body, content)
  return content
}

//检查饿了么药卡是否已过期
function checkElemeDrugIsExpired(body, content) {
  if ('buyDrugInformation' != body.command || 'eleme' != content.source) return content;
  switch (body.isSuccess) {
    case -1:
      //不可购药
      content.trans = false
      break;
    case 1:
      //购药成功
      content.buttonName = '查看详情';
      break;
    default:
      let ts = new Date().getTime() - body.createTime
      if (ts > 86400000) {
        //超过24小时
        content.trans = false
        content.tips = '该药品订单已超24小时，请呼叫医生重新获取药卡'
        // content.tipsClass = 'warn'
      }
      break;
  }
  return content
}

function checkSystemTips(body, content) {
  if ('buyDrugInformation' != body.command || (!body.systemTips && !content.systemTips)) return content;
  content.trans = false
  content.tips = body.systemTips || content.systemTips
  content.tipsClass = content.tips == '该药品订单已超24小时，请呼叫医生重新获取药卡' ? '' : 'warn'
  return content
}

function generateId() {
  let app = getApp()
  let sdkProductId = app.globalData._hhSdkOptions && app.globalData._hhSdkOptions._sdkProductId || 3009
  let id = 'sdk' + sdkProductId + '_' + new Date().getTime()
  return id
}
/** 获取图片或音频文件信息 */
function getFileInfo(file, fileType) {
  return new Promise((resolve, reject) => {
    wx.getFileInfo({
      filePath: file,
      digestAlgorithm: 'md5',
      success: fileResult => {
        if ('image' == fileType) {
          wx.getImageInfo({
            src: file,
            success: imageResult => {
              resolve({
                size: fileResult.size,
                digest: fileResult.digest,
                height: imageResult.height,
                width: imageResult.width
              })
            },
            fail: errImg => reject()
          })
        } else {
          resolve({
            size: fileResult.size,
            digest: fileResult.digest,
            height: 0,
            width: 0
          })
        }
      },
      fail: err => reject()
    })
  })
}

/** 发送文字消息 */
function sendText(from, to, text, appointedOrderId) {
  var msg = {
    id: generateId(),
    type: 'text',
    text,
    to,
    from
  }
  if (appointedOrderId) msg.data.appointedOrderId = appointedOrderId
  return sendMsg(msg)
}

/** 发送音频或图片文件 */
function sendFile(from, to, fileType, file, duration, appointedOrderId) {
  return new Promise((resolve, reject) => {
    getFileInfo(file, fileType)
      .then(resFile => {
        if (!apiUtil) apiUtil = require('./apiUtil')
        apiUtil.uploadFile(file, fileType)
          .then(res => {
            let fileUrl = res
            let msg = {
              id: generateId(),
              type: fileType,
              url: fileUrl,
              size: resFile.size,
              digest: resFile.digest,
              height: resFile.height,
              width: resFile.width,
              dur: duration,
              to,
              from
            }
            if (appointedOrderId) msg.appointedOrderId = appointedOrderId
            sendMsg(msg)
              .then(resSend => {
                resSend.url = fileUrl
                resolve(resSend)
              })
              .catch(() => reject())
          })
          .catch(err => reject())
      })
      .catch(err => reject())
  })

}

function sendMsg(msg) {
  if (!apiUtil) apiUtil = require('./apiUtil')
  return apiUtil.sendImMessage(msg)
}

function doReject(data) {
  return new Promise((resolve, reject) => reject(data))
}

module.exports = {
  sendText,
  sendFile,
  //parseMsgReceive,
  parseMsgHistory
}