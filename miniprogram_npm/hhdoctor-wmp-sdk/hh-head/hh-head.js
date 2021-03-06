const eventOption = {};
var that;
var movePoint;

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  lifetimes: {
    attached() {
      // 在组件实例进入页面节点树时执行
      that = this;
      that._selectImage();
    },
    detached() {
      // 在组件实例被从页面节点树移除时执行
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    _name: 'hh-head',
    sysInfo: null,
    imageDispInfo: null,
    imageSelected: false,
    imagePath: '',
    imageInfo: null,
    minScale: 10
  },

  /**
   * 组件的方法列表
   */
  methods: {

    _triggerEvent(name, detail) {
      that.triggerEvent(name, detail, eventOption)
    },


    _workCancel() {
      console.log('_workCancel');
      that._triggerEvent('selected', {
        success: false,
        message: 'user cancel',
        path: ''
      });
    },
    _workFinish() {
      console.log('_workFinish');
      that._getImage();
    },

    _selectImage() {
      if (!that.data.sysInfo) {
        var res = wx.getSystemInfoSync();
        that.setData({
          sysInfo: res,
          imageDispInfo: {
            width: res.windowWidth,
            height: res.windowHeight - 50,
            left: 0,
            top: 0,
            scale: 100
          }
        })
      }

      wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: function(res) {
          that.setData({
            imageSelected: true,
            imagePath: res.tempFilePaths[0]
          })
          wx.getImageInfo({
            src: res.tempFilePaths[0],
            success: function(e) {
              var _scaleW = that.data.sysInfo.windowWidth * 100 / e.width,
                _scaleH = that.data.sysInfo.windowHeight * 100 / e.height;
              var _scaleMw = 20000 / e.width,
                _scaleMh = 20000 / e.height;

              var _info = that.data.imageDispInfo;
              _info.scale = _scaleW;
              that.setData({
                imageDispInfo: _info,
                imageInfo: e,
                minScale: Math.max(_scaleMh, _scaleMw)
              })
            }
          })
        },
        fail: function() {
          that._triggerEvent('selected', null);
        }
      })
    },

    _moveImageStart(e) {
      if (0 == e.touches.length) {
        return;
      }
      movePoint = {
        x: e.touches[0].pageX,
        y: e.touches[0].pageY
      }
    },

    _moveImageEnd(e) {
      movePoint = null;
      //检查是否超出焦点边框
      var _disp = that.data.imageDispInfo;
      if (_disp.top > 150) {
        _disp.top = 150;
      }
      if (_disp.top + _disp.height < 350) {
        _disp.top = 350 - _disp.height;
      }
      var _border = (that.data.sysInfo.windowWidth - 200) / 2;
      if (_disp.left > _border) {
        _disp.left = _border;
      }
      if (_disp.left + _disp.width < (that.data.sysInfo.windowWidth - _border)) {
        _disp.left = that.data.sysInfo.windowWidth - _border - _disp.width;
      }

      that.setData({
        imageDispInfo: _disp
      })
    },

    _moveImage(e) {

      if (!movePoint || 0 == e.touches.length) {
        return;
      }

      var _deltaX = e.touches[0].pageX - movePoint.x,
        _deltaY = e.touches[0].pageY - movePoint.y;
      var _disp = that.data.imageDispInfo;
      _disp.left += _deltaX;
      _disp.top += _deltaY;

      that.setData({
        imageDispInfo: _disp
      })

      movePoint = {
        x: e.touches[0].pageX,
        y: e.touches[0].pageY
      }
    },

    _zoomImage(e) {
      var _scale = e.detail.value;
      //console.log(_scale);
      var _center = {
        x: that.data.sysInfo.windowWidth / 2,
        y: 250
      };
      if (_scale == that.data.imageDispInfo.scale) {
        return;
      }

      var _realCenter = {
        x: _center.x - that.data.imageDispInfo.left,
        y: _center.y - that.data.imageDispInfo.top
      }

      var _disp = that.data.imageDispInfo;
      var _deltaX = _realCenter.x * (1 - _scale / _disp.scale);
      var _deltaY = _realCenter.y * (1 - _scale / _disp.scale);

      that.setData({
        imageDispInfo: {
          width: that.data.imageInfo.width * _scale / 100,
          height: that.data.imageInfo.height * _scale / 100,
          left: _disp.left + _deltaX,
          top: _disp.top + _deltaY,
          scale: _scale
        }
      })

    },

    _getImage() {
      var ctx = wx.createCanvasContext('getImage', that);
      var _disp = that.data.imageDispInfo;
      var _border = (that.data.sysInfo.windowWidth - 200) / 2;
      ctx.clearRect(0, 0, 200, 200);
      ctx.drawImage(that.data.imagePath, _disp.left - _border, _disp.top - 150, _disp.width, _disp.height);
      ctx.draw(true, function() {
        wx.canvasToTempFilePath({
          x: 0,
          y: 0,
          width: 200,
          height: 200,
          canvasId: 'getImage',
          success(res) {
            console.log(res.tempFilePath);
            that._triggerEvent('selected', {
              success: true,
              message: 'success',
              path: res.tempFilePath
            });
          },
          fail: function(e) {
            that._triggerEvent('selected', {
              success: false,
              message: 'select exception',
              path: ''
            });
          }
        }, that)
      });
    }
  }
})