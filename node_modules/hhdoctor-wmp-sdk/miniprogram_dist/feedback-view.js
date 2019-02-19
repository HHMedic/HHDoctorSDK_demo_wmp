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
/******/ 	return __webpack_require__(__webpack_require__.s = 6);
/******/ })
/************************************************************************/
/******/ ({

/***/ 6:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var that;
var evaMap = [];
var eventOption = {};
Component({
  //behaviors: [require('./hhBehaviors.js')],
  /**
   * 组件的属性列表
   */
  properties: {
    question: {
      type: Object,
      observer: function observer(newVal, oldVal, changedPath) {}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    status: 0, //0:问题；1：问题结果；2：满意度；3：满意度结果,
    evaStarVisible: 'hidden',
    evaValue: 5,
    evaTip: '非常满意',
    evaText: ''
  },
  lifetimes: {
    attached: function attached() {
      that = this;
      evaMap[1] = '极度不满意';
      evaMap[2] = '非常不满意';
      evaMap[3] = '不满意';
      evaMap[4] = '一般';
      evaMap[5] = '非常满意';
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    _close: function _close() {
      that._triggerEvent('close', {});
    },

    _triggerEvent: function _triggerEvent(name, detail) {
      that.triggerEvent(name, detail, eventOption);
    },
    _answerQuestion: function _answerQuestion(e) {
      var id = parseInt(e.currentTarget.dataset.answerId);
      that._triggerEvent('ask', {
        answerId: id,
        answerText: 1 == id ? that.data.question.answerOne : that.data.question.answerOne
      });

      that.setData({
        status: 1,
        evaStarVisible: ''
      });
    },
    _viewEva: function _viewEva() {
      this.setData({
        status: 2
      });
    },
    _setEvaVal: function _setEvaVal(e) {
      var v = parseInt(e.currentTarget.dataset.evaVal);
      this.setData({
        evaValue: v,
        evaTip: evaMap[v]
      });
    },
    _setEvaText: function _setEvaText(e) {
      this.setData({
        evaText: e.detail.value
      });
    },
    _commitEvaluation: function _commitEvaluation() {
      that._triggerEvent('evaluate', {
        evaValue: that.data.evaValue,
        evaText: that.data.evaText
      });
      this.setData({
        status: 3
      });
      setTimeout(function () {
        that._triggerEvent('close', {});
      }, 2000);
    }
  }
});

/***/ })

/******/ });