# 和缓视频医生微信小程序使用指南（H5唤起小程序）


## 1、(**重要**)适用范围和兼容性说明

* 本方案适用于移动端H5唤起和缓视频医生小程序，支持微信内和微信外的H5运行环境：

* 本方案**不适用**于移动端以外的H5运行环境，如MAC/PC；

* 本方案的运行环境如为微信小程序的web-view组件，会显示小程序码图片并提示用户长按识别，同时需将"https://wmp.hh-medic.com"添加到小程序业务域名中，如需帮助请联系您的和缓接口人；**特别提示**：在此场景下，只支持唤起小程序首页，不支持直接呼叫医生。只有生产环境下显示的小程序码可正常唤起，测试环境下生成的小程序码无法正常唤起，仅供演示。

* 本方案对iOS系统兼容性较好，对大部分Android系统兼容性良好，个别Android系统可能会因浏览器拦截导致唤起小程序失败；

---

## 2、使用指南

测试环境下将H5页面导航至:*https://test.hh-medic.com/wmp/launch?sdkProductId={}&userToken={}*

生产环境下将H5页面导航至:*https://wmp.hh-medic.com/wmp/launch?sdkProductId={}&userToken={}*

---

## 3、参数说明

**所有参数均以QueryString的形式放入URL中，如参数值中含URL保留字符或中文，需使用encodeURIComponent()对其进行URL编码**

### 3.1、通用参数

***sdkProductId***: **必填参数**。和缓分配的产品id，一般是一个数字，例如：56789。

***userToken***: **必填参数**。调用和缓服务器用户注册接口后获取到的用户唯一标识，须传入主账号userToken或者独立子账号的userToken。**特别提示：测试环境、生产环境的userToken不通用**，访问test.hh-medic.com时需传入测试环境userToken，访问wmp.hh-medic.com时需传入生产环境userToken。

***page***: 可选参数。要跳转的小程序页面，需使用encodeURIComponent()对参数值进行URL编码，取值范围如下：

* 视频医生首页信息流(**默认值**)：pages/newIndex/newIndex

* 直接呼叫医生：pages/room/room


### 3.2、呼叫医生参数

***realPatientUserToken***: 实际需要咨询医生的用户userToken，可以跟前面的userToken相同，也可以是主账号家庭成员内部的其他用户userToken。

---

## 4、代码示例

### 示例1:使用a标签唤起生产环境小程序首页

```html
<!--需传入生产环境的userToken-->
<a href="https://wmp.hh-medic.com/wmp/launch?sdkProductId=9003&userToken=AE87BF75164F200D227EB6312C432825CCCB578FFE9820E7F43A1807648A85D9">点击打开小程序</a>
```

### 示例2:使用js唤起测试环境小程序并直接呼叫医生

```javascript
//需传入测试环境的userToken
location.href="https://test.hh-medic.com/wmp/launch?sdkProductId=9003&userToken=E6E6E880BB3AD4A1D8B31FE763B6ADEB3F0D04F68EA2608F6783B874E4F50EEF&page=pages%2Froom%2Froom"
```

---

## 5、其他参考文档

#### 请[点击此处](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_Open_Tag.html)参考微信官网文档

#### 请[点击此处](https://github.com/HHMedic/HHDoctorSDK_demo_wmp/blob/master/README_H5Call_Obsolete.md)查看旧版本H5唤起小程序使用指南
