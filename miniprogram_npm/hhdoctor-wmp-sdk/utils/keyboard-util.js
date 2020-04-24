let crlKeyCodeMap = [],
  crlKeyTextMap = [],
  confirmText = '确定';

crlKeyCodeMap['BACKSPACE'] = 8;
crlKeyTextMap['BACKSPACE'] = '删除';

crlKeyCodeMap['TAB'] = 9;

crlKeyCodeMap['CLEAR'] = 12;

crlKeyCodeMap['ENTER'] = 13;
crlKeyTextMap['ENTER'] = confirmText;

crlKeyCodeMap['SHIFTUPPER'] = -3;
crlKeyTextMap['SHIFTUPPER'] = '大写';

crlKeyCodeMap['SHIFTLOWER'] = -4;
crlKeyTextMap['SHIFTLOWER'] = '小写';

crlKeyCodeMap['SPACEBAR'] = 32;
crlKeyTextMap['SPACEBAR'] = '空格';

crlKeyCodeMap['SYMBOL'] = -1;
crlKeyTextMap['SYMBOL'] = '@/#';

crlKeyCodeMap['CHAR'] = -2;
crlKeyTextMap['CHAR'] = 'ABC';

function getControlKeyCode(controlKey) {
  return crlKeyCodeMap[controlKey] || null;
}

function getControlKeyText(controlKey) {
  if ('ENTER' == controlKey) return confirmText;
  return crlKeyTextMap[controlKey] || null;
}

function setConfirmText(text) {
  confirmText = text;
}

module.exports = {
  getControlKeyCode,
  getControlKeyText,
  setConfirmText
}