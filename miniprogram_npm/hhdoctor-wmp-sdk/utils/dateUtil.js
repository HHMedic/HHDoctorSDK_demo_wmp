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
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ({

/***/ 3:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function getHommizationTime(time) {
  //var d = new Date(time);
  if (!time) return '';
  var timeText = getTimeRegion(time) + ' ' + getHourMinute(time);

  if (isToday(time)) {

    return timeText;
  } else if (isYestoday(time)) {
    return '昨天' + timeText;
  } else {
    return getYearMonthDate(time) + timeText;
  }
};

function isToday(time) {
  var d = getDayStart();
  return time >= d;
};

function isYestoday(time) {
  var d = getDayStart();
  var y = getDayStart() - 24 * 3600 * 1000;
  return time >= y && time < d;
};

function getTimeRegion(time) {
  var date = new Date(time);
  var hour = date.getHours();
  if (hour < 6) {
    return '凌晨';
  } else if (hour >= 6 && hour < 11) {
    return '上午';
  } else if (hour >= 11 && hour < 13) {
    return '中午';
  } else if (hour >= 13 && hour < 18) {
    return '下午';
  } else {
    return '晚上';
  }
};

function getHourMinute(time) {
  var date = new Date(time);
  var hour = date.getHours();
  var minute = date.getMinutes();
  if (hour >= 13) {
    hour -= 12;
  }
  return hour + ':' + formatNumber(minute);
}

function getYearMonthDate(time) {
  var date = new Date(time);
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  return year + '-' + month + '-' + day;
}

function getDayStart(date) {
  if (!date) {
    date = new Date();
  }
  var year = date.getFullYear();
  var month = date.getMonth();
  var day = date.getDate();
  var start = new Date(year, month, day, 0, 0, 0);
  return start.getTime();
};

function formatNumber(n) {
  n = n.toString();
  return n[1] ? n : '0' + n;
};

function formatTimeLength(s) {
  var h = parseInt(s / 3600);
  var m1 = s % 3600;
  var m = parseInt(m1 / 60);
  s = m1 % 60;
  if (h > 0) {
    return formatNumber(h) + ':' + formatNumber(m) + ':' + formatNumber(s);
  } else {
    return formatNumber(m) + ':' + formatNumber(s);
  }
};

function format(d, fmt) {
  var o = {
    "M+": d.getMonth() + 1, //月份 
    "d+": d.getDate(), //日 
    "h+": d.getHours(), //小时 
    "m+": d.getMinutes(), //分 
    "s+": d.getSeconds(), //秒 
    "q+": Math.floor((d.getMonth() + 3) / 3), //季度 
    "S": d.getMilliseconds() //毫秒 
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (d.getFullYear() + "").substr(4 - RegExp.$1.length));
  }
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
  }return fmt;
};

//对外公开接口
module.exports = {
  getHommizationTime: getHommizationTime,
  getDayStart: getDayStart,
  formatTimeLength: formatTimeLength,
  format: format
};

/***/ })

/******/ });