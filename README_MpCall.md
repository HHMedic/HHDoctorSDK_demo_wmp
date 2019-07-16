# 和缓视频医生微信小程序使用指南（小程序唤起小程序）

## 调用步骤

### 1.在小程序页面中加入navigator组件，组件说明文档：https://developers.weixin.qq.com/miniprogram/dev/component/navigator.html。

请务必在app.json中增加要跳转的目的小程序appId（wx4cb4b02322574f52），文档参考：https://developers.weixin.qq.com/miniprogram/dev/framework/config.html#全局配置

### 2.navigator组件参数：
```
      <navigator target="miniProgram" open-type="navigate" app-id="wx4cb4b02322574f52" path="pages/newIndex/newIndex?sdkProductId={{sdkProductId}}&userToken={{userToken}}" extra-data="" version="release">
        呼叫视频医生
      </navigator>
```

### 3.步骤2中的参数说明如下：
 - ***`sdkProductId`*** :和缓分配的sdkProductId。
 - ***`userToken`*** :服务端注册用户接口返回的userToken。
 

  
