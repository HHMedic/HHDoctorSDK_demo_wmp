# 和缓视频医生微信小程序SDK升级指南（1->2）


## 和缓视频医生微信小程序SDK v2.0.0主要升级点：

1.增加hhDoctor.js，统一处理用户登录；

2.使用hh-rtc组件替换hh-call组件，底层使用腾讯TRTC，更低时延；

3.支持医生回拨；

## 如何升级：
1. **npm更新**

SDK从1.\*升级到2.\*，直接使用`npm i hhdoctor-wmp-sdk --production`命令更新会导致无法更新到最新版本，或更新后缺少文件，请依照以下方式更新SDK：
* 进入项目目录，将node_modules和miniprogram_npm目录下的hhdoctor-wmp-sdk目录分别删除；
* 使用小程序IDE打开项目，编辑package.json文件，将dependencies下的hhdoctor-wmp-sdk版本号手工修改为："^2.0.0"；
* 打开命令提示符或终端工具，进入项目目录，执行`npm i hhdoctor-wmp-sdk --production`命令更新SDK；
* 使用小程序IDE的“工具”-“构建npm”，重新执行构建；

2. **代码中引入hhDoctor，并在获取到当前登录用户信息(sdkProduct,userToken,openId)后调用登录方法**，代码参考如下：
```
const hhDoctor = require('./miniprogram_npm/hhdoctor-wmp-sdk/hhDoctor.js')

hhDoctorLogin() {
    hhDoctor.logout();
    return hhDoctor.login({
      profileName: profileName,     //test:测试环境   prod:生产环境
      subDomain: '',                //根据实际情况填写
      sdkProductId: sdkProductId,   //和缓分配的sdkProductId
      userToken: userToken,         //调用和缓服务器接口注册用户后得到的userToken
      openId: openId,               //当前用户openId
      callPage: '/pages/call/call'  //呼叫页面，在此注册页面后可支持医生回拨
    })
}

```
**注意：在使用视频医生SDK任意组件(hh-im,hh-rtc等)之前，必须首先执行登录方法，登录成功后方可使用视频医生组件，否则用户信息未登录会导致使用报错。登录方法全局执行一次即可。**

3. **将hh-call组件替换为hh-rtc组件**

打开当前呼叫页面的json配置文件，替换组件地址，如下：
```
"hhCall": "hhdoctor-wmp-sdk/hh-rtc/hh-rtc"
```

4. **微信小程序管理后台增加相应域名**

在浏览器打开[微信公众号后台](https://mp.weixin.qq.com/)，依次点击【开发】-【开发设置】，找到“服务器域名”，在“request合法域名”下添加以下域名：
```
https://pingtas.qq.com
https://yun.tim.qq.com
https://official.opensso.tencent-cloud.com
https://cloud.tencent.com
https://webim.tim.qq.com
```

5. **将基础库最低版本设置修改为2.9.4**

进入微信公众号后台，依次点击【设置】-【基本设置】，找到“基础库最低版本设置”，修改为2.9.4


[<<<返回SDK文档](https://github.com/HHMedic/HHDoctorSDK_demo_wmp)
