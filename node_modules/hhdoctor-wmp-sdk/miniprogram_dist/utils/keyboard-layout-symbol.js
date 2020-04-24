let layout = {
  keyboard: [
    [{
      text: '['
    }, {
      text: ']'
    }, {
      text: '{'
    }, {
      text: '}'
    }, {
      text: '#'
    }, {
      text: '%'
    }, {
      text: '^'
    }, {
      text: '*'
    }, {
      text: '+'
    }, {
      text: '='
    }],
    [{
      text: '_'
    }, {
      text: '\\'
    }, {
      text: '|'
    }, {
      text: '~'
    }, {
      text: '<'
    }, {
      text: '>'
    }, {
      text: '€'
    }, {
      text: '￡'
    }, {
      text: '¥'
    }, {
      text: '·'
    }],
    [{
      text: '-'
    }, {
      text: '/'
    }, {
      text: ':'
    }, {
      text: ';'
    }, {
      text: '('
    }, {
      text: ')'
    }, {
      text: '$'
    }, {
      text: '&'
    }, {
      text: '@'
    }, {
      text: '"'
    }],
    [{
      text: '',
      control: 'SHIFTLOWER',
      style: 'big',
      disabled: true
    }, {
      text: '.',
      style: 'big'
    }, {
      text: ',',
      style: 'big'
    }, {
      text: '?',
      style: 'big'
    }, {
      text: '!',
      style: 'big'
    }, {
      text: '\'',
      style: 'big'
    }, {
      text: '',
      control: 'BACKSPACE',
      style: 'big'
    }],
    [{
      text: '',
      control: 'CHAR',
      style: 'big'
    }, {
      text: '',
      control: 'SPACEBAR',
      style: 'super'
    }, {
      text: '',
      control: 'ENTER',
      style: 'big'
    }]
  ]
}

module.exports = {
  layout
}