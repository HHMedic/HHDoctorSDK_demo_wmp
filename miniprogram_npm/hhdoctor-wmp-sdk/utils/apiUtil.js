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
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ({

/***/ 4:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var app = getApp();
var wmpHost = app.globalData._hhSdkOptions._host.wmpHost;
var urls = {
  videoReportTrace: wmpHost + 'video/reportTrace?targetId={0}&traceType={1}&traceCode={2}',
  videoLeaveLive: wmpHost + 'video/leaveLive?id={0}',
  videoAddComment: wmpHost + 'video/addComment',
  videoList: wmpHost + 'video/list?channelType={0}',
  videoComment: wmpHost + 'video/comments?videoId={0}&lastCommentId={1}&channelType={2}',
  getHistoryMsg: wmpHost + 'trtc/getHistoryMsg?asstUuid={0}'
};
var requestHeader = {};

String.prototype.format = function () {
  if (arguments.length == 0) return this;
  for (var s = this, i = 0; i < arguments.length; i++) {
    s = s.replace(new RegExp("\\{" + i + "\\}", "g"), arguments[i]);
  }return s;
};

function doRequest(url, method, data) {
  return new Promise(function (resolve, reject) {
    url = addPubVars(url);
    console.log('>>>>' + url);
    wx.request({
      url: url,
      data: data,
      method: method ? method.toUpperCase() : 'POST',
      header: requestHeader,
      success: function success(res) {
        if (200 == res.statusCode && res.data && res.data.status && 200 == res.data.status) {
          resolve(res.data);
        } else {
          reject(res.data);
        }
      },
      fail: function fail(res) {
        wx.showModal({
          title: '提示',
          content: res && res.data && res.data.error || "网络请求错误",
          showCancel: false
        });
        reject();
      }
    });
  });
}

function addPubVars(url) {
  url = addParam(url, 'sdkProductId', app.globalData._hhSdkOptions._sdkProductId);
  url = addParam(url, 'userToken', app.globalData._hhSdkOptions._userToken);
  url = addParam(url, 'openId', app.globalData._hhSdkOptions._openId);
  url = addParam(url, '_', new Date().getTime());
  return url;
}

function addParam(url, key, value) {
  if (url.indexOf(key + '=') < 0 && value) {
    url += (url.indexOf('?') >= 0 ? '&' : '?') + key + '=' + value;
  }
  return url;
}

/** 上报小程序直播埋点数据 */
function reportTrace(targetId, traceType, traceCode) {
  var url = urls.videoReportTrace.format(targetId, traceType, traceCode);
  return doRequest(url, '', {});
}

/** 离开直播 */
function leaveLive(id) {
  var url = urls.videoLeaveLive.format(id);
  return doRequest(url, '', {});
}

/** 添加评论 */
function addComment(comment) {
  var url = urls.videoAddComment;
  return doRequest(url, '', comment);
}

/** 获取评论列表 */
function getComment(videoId, lastCommentId, channelType) {
  var url = urls.videoComment.format(videoId, lastCommentId, channelType);
  return doRequest(url, '', {});
}

/** 获取视频列表 */
function getVideoList(channelType) {
  var url = urls.videoList.format(channelType);
  return doRequest(url, '', {});
}

/** 获取历史IM消息 */
function getHistoryMsg(asstUuid) {
  var url = urls.getHistoryMsg.format(asstUuid);
  return doRequest(url, '', {});
}

module.exports = {
  reportTrace: reportTrace,
  leaveLive: leaveLive,
  addComment: addComment,
  getComment: getComment,
  getVideoList: getVideoList,
  getHistoryMsg: getHistoryMsg
};

/***/ })

/******/ });