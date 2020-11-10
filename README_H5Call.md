# 和缓视频医生微信小程序使用指南（H5唤起小程序）


## 前置条件

* H5页面是使用小程序云开发静态网站托管的小程序网页,或者：
* H5页面部署的域名已经绑定在微信公众号的JS接口安全域名中；
* 在微信中访问H5页面；

---

## H5页面开发指南

#### 请[点击此处](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_Open_Tag.html)参考微信官网文档

---

## 相关参数

***username***: `gh_95e7300edf4c`

***path-视频医生首页***: `pages/newIndex/newIndex.html?sdkProductId={sdkProductId}&userToken={userToken}`

***path-呼叫视频医生***: `pages/room/room.html?profileName=prod&subDomain=mp&dept=600002&sdkProductId={sdkProductId}&userToken={userToken}&openId={openId}`

***path-选择成员呼叫视频医生***: `pages/room/room.html?profileName=prod&subDomain=mp&dept=600002&sdkProductId={sdkProductId}&userToken={userToken}&openId={openId}&realPatientUserToken={realPatientUserToken}`

---

## 代码示例

#### 视频医生首页 
```html
<wx-open-launch-weapp
            id="launch-btn"
            username="gh_95e7300edf4c"
            path="pages/newIndex/newIndex.html?sdkProductId={}&userToken={}">
  <template>
      <style>.btn {
          width: 300px;
          height: 50px;
          line-height: 50px;
          background-color: #0592f5;
          color: #FFFFFF;
          font-size: 20px;
          border-radius: 10px;
          text-align: center;
          border: none;
      }</style>
    <button class="btn">视频医生首页</button>
  </template>
</wx-open-launch-weapp>
```

#### 呼叫视频医生
```html
<wx-open-launch-weapp
            class="wx-open"
            id="launch-btn"
            username="gh_95e7300edf4c"
            path="pages/room/room.html?profileName=prod&subDomain=mp&dept=600002&sdkProductId={}&userToken={}&openId={}">
  <template>
      <style>.btn {
          width: 300px;
          height: 50px;
          line-height: 50px;
          background-color: #0592f5;
          color: #FFFFFF;
          font-size: 20px;
          border-radius: 10px;
          text-align: center;
          border: none;
      }</style>
    <button class="btn">呼叫视频医生</button>
  </template>
</wx-open-launch-weapp>
```

#### 选择成员呼叫视频医生
```html
<wx-open-launch-weapp
            class="wx-open"
            id="launch-btn"
            username="gh_95e7300edf4c"
            path="pages/room/room.html?profileName=prod&subDomain=mp&dept=600002&sdkProductId={}&userToken={}&openId={}&realPatientUserToken={}">
  <template>
      <style>.btn {
          width: 300px;
          height: 50px;
          line-height: 50px;
          background-color: #0592f5;
          color: #FFFFFF;
          font-size: 20px;
          border-radius: 10px;
          text-align: center;
          border: none;
      }</style>
    <button class="btn">选择成员呼叫视频医生</button>
  </template>
</wx-open-launch-weapp>
```

---

## 常见问题

* 使用浏览器访问H5页面无法显示`<wx-open-launch-weapp />`开放标签
***解决方法***:使用微信访问相应的H5页面，方可正常显示开放标签，并唤起小程序.

* 使用iOS设备使用微信访问H5页面可以显示`<wx-open-launch-weapp />`开放标签，但Android设备无法显示
***解决方法***:H5页面的js代码执行`wx.config()`时，`jsApiList`参数必须传入至少一个api名称，如为空（`jsApiList: []`），则Android设备微信浏览器初始化jsapi会失败，进入`wx.error()`，无法显示开放标签。

* 可以唤起小程序，但登录用户不是path参数中传入的userToken对应的用户
***解决方法***:`<wx-open-launch-weapp />`开放标签的`path`参数值不可手工回车换行。如`path`参数值中存在回车换行符，首个回车换行符后的数据无法正常传入小程序，导致小程序无法获取正确的参数。

---

## DEMO演示

![](https://imgs.hh-medic.com/icon/wmp/sdk/WX20201106-165055.png)

请使用微信扫一扫
