function getHost(profileName, subDomain) {
  var host = {};
  switch (profileName) {
    case 'prod':
      if (subDomain) {
        host.wmpHost = 'https://' + subDomain + '.hh-medic.com/wmp/';
        host.ehrHost = 'https://' + subDomain + '.hh-medic.com/ehrweb/';
        host.patHost = 'https://' + subDomain + '.hh-medic.com/patient_web/';
        host.secHost = 'https://' + subDomain + '.hh-medic.com/';
        host.wsServer = 'wss://' + subDomain + '.hh-medic.com/wmp/websocket';
      } else {
        host.wmpHost = 'https://wmp.hh-medic.com/wmp/';
        host.ehrHost = 'https://e.hh-medic.com/ehrweb/';
        host.patHost = 'https://sec.hh-medic.com/patient_web/';
        host.secHost = 'https://sec.hh-medic.com/';
        host.wsServer = 'wss://wmp.hh-medic.com/wmp/websocket';
      }
      break;
    case 'test':
      host.wmpHost = 'https://test.hh-medic.com/wmp/';
      host.ehrHost = 'https://test.hh-medic.com/ehrweb/';
      host.patHost = 'https://test.hh-medic.com/patient_web/';
      host.secHost = 'https://test.hh-medic.com/';
      host.wsServer = 'wss://test.hh-medic.com/wmp/websocket';
      break;
    case 'dev':
      host.wmpHost = 'http://192.168.8.180:8080/wmp/';
      host.ehrHost = 'https://test.hh-medic.com/ehrweb/';
      host.patHost = 'https://test.hh-medic.com/patient_web/';
      host.secHost = 'https://test.hh-medic.com/';
      host.wsServer = 'ws://192.168.8.180:8080/wmp/websocket';
      break;
    default:
      break;
  }
  return host;
}

module.exports = {
  getHost: getHost
}