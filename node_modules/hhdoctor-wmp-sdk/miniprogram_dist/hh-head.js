module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 8);
/******/ })
/************************************************************************/
/******/ ({

/***/ 8:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var eventOption = {};
var that;
var movePoint;

Component({
  /**
   * 组件的属性列表
   */
  properties: {},

  lifetimes: {
    attached: function attached() {
      // 在组件实例进入页面节点树时执行
      that = this;
      that._selectImage();
    },
    detached: function detached() {
      // 在组件实例被从页面节点树移除时执行
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
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
    _triggerEvent: function _triggerEvent(name, detail) {
      that.triggerEvent(name, detail, eventOption);
    },
    _workCancel: function _workCancel() {
      console.log('_workCancel');
      that._triggerEvent('selected', {
        success: false,
        message: 'user cancel',
        path: ''
      });
    },
    _workFinish: function _workFinish() {
      console.log('_workFinish');
      that._getImage();
    },
    _selectImage: function _selectImage() {
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
        });
      }

      wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: function success(res) {
          that.setData({
            imageSelected: true,
            imagePath: res.tempFilePaths[0]
          });
          wx.getImageInfo({
            src: res.tempFilePaths[0],
            success: function success(e) {
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
              });
            }
          });
        },
        fail: function fail() {
          that._triggerEvent('selected', null);
        }
      });
    },
    _moveImageStart: function _moveImageStart(e) {
      if (0 == e.touches.length) {
        return;
      }
      movePoint = {
        x: e.touches[0].pageX,
        y: e.touches[0].pageY
      };
    },
    _moveImageEnd: function _moveImageEnd(e) {
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
      if (_disp.left + _disp.width < that.data.sysInfo.windowWidth - _border) {
        _disp.left = that.data.sysInfo.windowWidth - _border - _disp.width;
      }

      that.setData({
        imageDispInfo: _disp
      });
    },
    _moveImage: function _moveImage(e) {

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
      });

      movePoint = {
        x: e.touches[0].pageX,
        y: e.touches[0].pageY
      };
    },
    _zoomImage: function _zoomImage(e) {
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
      };

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
      });
    },
    _getImage: function _getImage() {
      var ctx = wx.createCanvasContext('getImage', that);
      var _disp = that.data.imageDispInfo;
      var _border = (that.data.sysInfo.windowWidth - 200) / 2;
      ctx.clearRect(0, 0, 200, 200);
      ctx.drawImage(that.data.imagePath, _disp.left - _border, _disp.top - 150, _disp.width, _disp.height);
      ctx.draw(true, function () {
        wx.canvasToTempFilePath({
          x: 0,
          y: 0,
          width: 200,
          height: 200,
          canvasId: 'getImage',
          success: function success(res) {
            console.log(res.tempFilePath);
            that._triggerEvent('selected', {
              success: true,
              message: 'success',
              path: res.tempFilePath
            });
          },

          fail: function fail(e) {
            that._triggerEvent('selected', {
              success: false,
              message: 'select exception',
              path: ''
            });
          }
        }, that);
      });
    }
  }
});

/***/ })

/******/ });