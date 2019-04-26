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
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = Behavior({
  behaviors: [],
  properties: {
    profileName: {
      type: String,
      value: 'prod'
    },

    sdkProductId: {
      type: String,
      observer: function observer(newVal, oldVal, changedPath) {
        this.propertyChanged(newVal, oldVal, changedPath);
      }
    },
    appKey: {
      type: String,
      value: ''
    },
    userUuid: {
      type: String,
      observer: function observer(newVal, oldVal, changedPath) {
        this.propertyChanged(newVal, oldVal, changedPath);
      }
    },
    userToken: {
      type: String,
      observer: function observer(newVal, oldVal, changedPath) {
        this.propertyChanged(newVal, oldVal, changedPath);
      }
    },
    openId: {
      type: String,
      observer: function observer(newVal, oldVal, changedPath) {
        this.propertyChanged(newVal, oldVal, changedPath);
      }
    }
  },
  data: {},
  attached: function attached() {},

  methods: {
    propertyChanged: function propertyChanged(newVal, oldVal, changedPath) {},
    getHost: function getHost() {
      //wsServer: 'wss://wmp.hh-medic.com/wmp/websocket',
      //fileServer: 'https://dev.hh-medic.com/miniprogramweb_master/wmp/im/upload/'
      var host = {};
      switch (this.data.profileName) {
        case 'prod':
          host.wmpHost = 'https://wmp.hh-medic.com/wmp/';
          host.ehrHost = 'https://e.hh-medic.com/ehrweb/';
          host.wsServer = 'wss://wmp.hh-medic.com/wmp/websocket';
          break;
        case 'test':
          host.wmpHost = 'https://test.hh-medic.com/wmp/';
          host.ehrHost = 'https://test.hh-medic.com/ehrweb/';
          host.wsServer = 'wss://test.hh-medic.com/wmp/websocket';
          break;
        default:
          break;
      }
      return host;
    }
  }
});

/***/ }),

/***/ 5:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// components/hh-im.js
var hhBehaviors = __webpack_require__(0);
var that;
var waitInterval;

Component({
  behaviors: [hhBehaviors],
  /**
   * 组件的属性列表
   */
  properties: {
    callPage: {
      type: String,
      value: ''
    },

    viewTarget: {
      type: String
    },

    viewModule: {
      type: String,
      value: 'memberList'
    },

    appointedDoctorId: {
      type: String,
      value: ''
    },
    appointedOrderId: {
      type: String,
      value: ''
    },

    addMember: {
      type: String,
      value: 'true'
    },

    patient: {
      type: String,
      value: ''
    },

    medicRecordId: {
      type: String,
      value: ''
    }
  },

  lifetimes: {
    attached: function attached() {
      that = this;
    },
    ready: function ready() {
      this.setData({
        host: this.getHost()
      });

      waitInterval = setInterval(function () {
        that._waitforParams();
      }, 100);
    },
    detached: function detached() {
      if (waitInterval) {
        clearInterval(waitInterval);
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    url: '',
    host: {}
  },

  /**
   * 组件的方法列表
   */
  methods: {
    propertyChanged: function propertyChanged(newVal, oldVal, changedPath) {
      //this._viewIm();
    },
    onWebLoad: function onWebLoad() {
      console.log('onWebLoad');
    },
    _waitforParams: function _waitforParams() {
      if (!this.data.userUuid || !this.data.userToken || !this.data.sdkProductId || !this.data.openId) {
        return;
      }
      if (waitInterval) {
        clearInterval(waitInterval);
      }

      switch (that.data.viewTarget.toLowerCase()) {
        case 'im':
          that._viewIm();
          break;
        case 'ehr':
          that._viewEhr();
          break;
        default:
          break;
      }
    },
    _viewIm: function _viewIm() {
      if (!this.data.userUuid || !this.data.userToken || !this.data.sdkProductId || !this.data.openId) {
        return;
      }
      var vParam = 'module=im' + '&appId=' + this.data.sdkProductId +
      //'&appKey=' + this.data.appKey +
      '&uuid=' + this.data.userUuid + '&token=' + this.data.userToken + '&openId=' + this.data.openId + '&version=3';

      if (this.data.callPage) {
        vParam += '&callPage=' + encodeURIComponent(this.data.callPage);
      }

      if (this.data.appointedOrderId) {
        vParam += '&orderId=' + this.data.appointedOrderId;
      }
      if (this.data.appointedDoctorId) {
        vParam += '&doctorId=' + this.data.appointedDoctorId;
      }
      var s = that.data.host.wmpHost + 'view/?' + vParam;
      this.setData({
        url: s
      });
    },
    _viewEhr: function _viewEhr() {
      if (!this.data.userUuid || !this.data.userToken || !this.data.sdkProductId || !this.data.openId) {
        return;
      }
      var vParam = 'module=' + this.data.viewModule + '&appId=' + this.data.sdkProductId + '&uuid=' + this.data.userUuid + '&token=' + this.data.userToken + '&openId=' + this.data.openId;
      if (this.data.appointedOrderId) {
        vParam += '&orderId=' + this.data.appointedOrderId;
      }
      if (this.data.appointedDoctorId) {
        vParam += '&doctorId=' + this.data.appointedDoctorId;
      }
      if ('false' == this.data.addMember) {
        vParam += '&hideAddBtn=true';
      }

      if (this.data.patient) {
        var p = Number(this.data.patient);
        if (isNaN(p)) {
          vParam += '&patientUserToken=';
        } else {
          vParam += '&patient=';
        }
        vParam += this.data.patient;
      }
      if (this.data.medicRecordId) {
        vParam += '&mrid=' + this.data.medicRecordId;
      }

      var s = that.data.host.ehrHost + 'view/?' + vParam;
      this.setData({
        url: s
      });
    }
  }
});

/***/ })

/******/ });