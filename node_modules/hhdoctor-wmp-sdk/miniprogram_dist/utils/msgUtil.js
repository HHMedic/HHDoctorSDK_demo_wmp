let accessCardCommand = [];

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
    accessCardCommand['haoForm'] = 1                    //挂号表单
    accessCardCommand['nurseReport'] = 1                  //护理报告
    accessCardCommand['nurseDetail'] = 1                  //护理服务详情
  }
  return accessCardCommand[command] && 1 == accessCardCommand[command]
}

function parseMsgReceive(msg) {
  let data, attach, content;
  console.log('<<<', msg);
  switch (msg.data.msgType) {
    case 'PICTURE': //图片消息
      let attach = JSON.parse(msg.data.attach);
      data = {
        id: msg.data.msgidServer,
        type: 'image',
        from: 'd',
        text: '',
        url: attach.url,
        thumbnail: attach.url + '?x-oss-process=image/resize,m_fixed,w_200',
        head: '',
        name: '',
        time: msg.data.msgTimestamp
      };
      break;
    case 'AUDIO': //音频消息
      attach = JSON.parse(msg.data.attach);
      data = {
        id: msg.data.msgidServer,
        type: 'audio',
        from: 'd',
        text: '',
        url: getAudioMsgUrl(attach.ext, msg.data.fromAccount, msg.data.msgidServer, attach.url),
        dur: attach.dur,
        head: '',
        name: '',
        time: msg.data.msgTimestamp
      };
      break;
    case 'CARD': //卡片消息
      attach = JSON.parse(msg.data.attach);
      content = JSON.parse(attach.content);
      content = processDrugCard(attach, content)
      if (!isAccessCardCommand(content.command)) break
      data = {
        id: msg.data.msgidServer,
        from: 'd',
        type: 'card',
        from: attach.talkUuid,
        head: attach.talkUserPic,
        name: attach.talkName,
        time: attach.createTime,
        patient: attach.patientUuid,
        body: attach,
        bodyContent: content
      };
      break;
    default: //默认是文本
      data = {
        id: msg.data.msgidServer,
        type: 'text',
        from: 'd',
        text: msg.data.body,
        head: '',
        name: '',
        time: msg.data.msgTimestamp
      };
      break;
  }
  return data;
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
        content.tipsClass = 'warn'
      }
      break;
  }
  return content
}

function checkSystemTips(body, content) {
  if ('buyDrugInformation' != body.command || (!body.systemTips && !content.systemTips)) return content;
  content.trans = false
  content.tips = body.systemTips || content.systemTips
  content.tipsClass = 'warn'
  return content
}

module.exports = {
  parseMsgReceive,
  parseMsgHistory
}