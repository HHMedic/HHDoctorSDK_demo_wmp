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
      if ('summaryByFam' != content.command &&
        'buyDrugInformation' != content.command &&
        'buyService' != content.command &&
        'commandProductTips' != content.command) {
        return;
      }

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
        if ('summaryByFam' == content.command ||
          'buyDrugInformation' == content.command ||
          'buyService' == content.command ||
          'commandProductTips' == content.command) {
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
        }
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

module.exports = {
  parseMsgReceive,
  parseMsgHistory
}