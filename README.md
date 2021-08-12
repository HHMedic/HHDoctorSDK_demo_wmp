# 和缓视频医生微信小程序SDK使用指南（3.1.0）

和缓视频医生微信小程序SDK（**本SDK**）为小程序自定义组件形式，使用npm方式发布。本文引导开发者从零开始，一步一步搭建起和缓视频医生基本功能框架。如果开发者是在现有项目中集成本SDK，可直接从第2步开始阅读。

开发者也可直接克隆当前仓库，使用微信开发者工具导入本项目后，执行以下步骤，快速浏览相关功能：
*  点击IDE右上角的“详情”，修改AppID。
*  使用命令提示符或终端，进入当前项目所在本地目录，执行命令更新SDK：`npm i hhdoctor-wmp-sdk@latest --production`。
*  点击IDE菜单中的“工具”-“构建 npm”。

---

## 旧版本SDK文档

 如需查看旧版本文档，请：
 
 查看0.*版本文档请[点击此处](https://github.com/HHMedic/HHDoctorSDK_demo_wmp/blob/master/README_0.1.md) 

 查看1.*版本文档请[点击此处](https://github.com/HHMedic/HHDoctorSDK_demo_wmp/blob/master/README_1.0.md) 

 查看2.*版本文档请[点击此处](https://github.com/HHMedic/HHDoctorSDK_demo_wmp/blob/master/README_2.0.md) 
 
 ---

## 特别说明（重点关注事项）

1. 本项目所使用的AppId为接口测试号AppId，在终端上执行预览会提示错误信息，请更换为实际可用的AppId。

2. 本项目需要使用微信小程序的livePusher和livePlayer组件，请确保AppId归属的小程序已开启相应的权限。如不清楚如何开启权限，请咨询和缓接口人。

3. 微信小程序IDE模拟器不支持livePusher和livePlayer组件，因此无法体验视频呼叫功能，请在真机中预览或进行真机调试。

4. 本项目所使用userToken和sdkProductId为演示专用，无法应用到测试或生产环境。

5. 如使用购药功能，需提供小程序AppId及小程序的主体信息给和缓接口人，以绑定支付功能，绑定成功后方可正常使用。详细绑定步骤请咨询和缓接口人。

6. 小程序开发完成后，需提交微信审核，审核通过后方可正式上线。如贵方小程序属首次提交审核，请务必预留充足的审核时间（至少预留1周审核时间，特殊情况下可能需要2周）。如在上线审核过程中遇到问题，可咨询和缓接口人寻求更多建议。

7. 在小程序后台“设置”-“基本设置”下，<u>将“基础库最低版本设置”设置为2.10.0或更高版本</u>。

8. 生产环境与测试环境的sdkProductId可以通用，但用户数据是完全隔离的，请勿将测试环境的userToken数据应用到生产环境，反之亦然。

9. 本SDK从3.0.3版本开始，呼叫时需要调用wx.getLocation()获取用户位置，<u>因此请在项目的app.json文件中增加获取位置相关权限说明</u>，请[点击此处](https://developers.weixin.qq.com/miniprogram/dev/reference/configuration/app.html#permission)查看说明

10. 本SDK从3.1.0版本开始，移除了hh-sdkcontext组件，其下的navigateTo()方法移到hhDoctor组件中，使用hhDoctor.navigateTo()可实现前述跳转功能，方法接口参数不变

11. 如果您是从 `1.*` 版本SDK升级到 `2.*` 版本SDK，请[点击此处](https://github.com/HHMedic/HHDoctorSDK_demo_wmp/blob/master/README_upgrade_1_to_2.md)查看升级指南。

12. 如果您是从 `2.*` 版本SDK升级到 `3.*` 版本SDK，请[点击此处](https://github.com/HHMedic/HHDoctorSDK_demo_wmp/blob/master/README_upgrade_2_to_3.md)查看升级指南。

---

通过本SDK可实现以下功能：
* 咨询医助
* 呼叫医生
* 查看健康档案

## 项目搭建

### 1. 新建项目

  - 启动IDE，选择小程序项目。

    ![](https://imgs.hh-medic.com/icon/wmp/sdk/WX20190103-170059.png)

  - 新建项目。

    ![](https://imgs.hh-medic.com/icon/wmp/sdk/WX20190103-170248.png)
  
  - 选择项目目录，输入AppID和项目名称，点击确定。

    ![](https://imgs.hh-medic.com/icon/wmp/sdk/WX20190103-170346.png)


### 2. 修改项目设置

  - 点击IDE右上角的“详情”，勾选“使用npm模块”和“不校验合法域名、web-view(业务域名)、TLS版本以及HTTPS证书”。

    ![](https://imgs.hh-medic.com/icon/wmp/sdk/WX20190103-170536.png)

### 3. 加载SDK

  - 使用命令提示符或终端，进入小程序项目所在根目录，执行命令初始化：`npm init --yes`

    ![](https://imgs.hh-medic.com/icon/wmp/sdk/WX20190107-181152.png)

  - 初始化成功后，执行命令加载SDK：`npm i hhdoctor-wmp-sdk@latest --production`

    ![](https://imgs.hh-medic.com/icon/wmp/sdk/WX20190107-182251.png)
    
  - 使用小程序IDE打开package.json文件，确保dependencies.hhdoctor-wmp-sdk为最新版本。如不确定是否为最新版本请联系和缓的技术支持人员。

### 4. npm构建

  - 点击IDE菜单中的“工具”-“构建 npm”，如果构建成功，会提示“完成构建”。

### 5. 使用SDK创建页面

  - 使用小程序IDE创建新的页面(以pages/index/index为例)，编辑index.json文件，声明要使用的SDK组件。

    ![](https://imgs.hh-medic.com/icon/wmp/sdk/WX20190612-162422.png)  
  
  - 编辑index.wxml文件，插入SDK组件标签。

    ![](https://imgs.hh-medic.com/icon/wmp/sdk/WX20190612-162217.png)  
  
  - 编辑index.js文件，通过setData()给相应的变量赋值。

### 6. 如何更新SDK

  - 使用命令提示符或终端，进入小程序项目所在根目录，执行命令更新：`npm i hhdoctor-wmp-sdk@latest --production`。
  
  - 打开小程序开发者IDE，点击IDE菜单中的“工具”-“构建 npm”。

## 小程序后台配置

### 1.登录微信小程序管理后台：https://mp.weixin.qq.com

### 2.点击【开发】-【开发设置】

### 3.在”服务器域名“中增加如下配置：

  - request合法域名:
  ```
    https://mp.hh-medic.com
    https://test.hh-medic.com
    https://pingtas.qq.com
    https://official.opensso.tencent-cloud.com
    https://yun.tim.qq.com
    https://cloud.tencent.com
    https://webim.tim.qq.com
  ```
  - socket合法域名:
  ```
    wss://mp.hh-medic.com
    wss://test.hh-medic.com
  ```
  - uploadFile合法域名:
  ```
    https://mp.hh-medic.com
    https://test.hh-medic.com
  ```
  - downloadFile合法域名:
  ```
    https://mp.hh-medic.com
    https://imgfamily.hh-medic.com
    https://imgs.hh-medic.com
    https://test.hh-medic.com
  ```

### 4.在"业务域名”下增加如下配置：
  ```
    https://mp.hh-medic.com
    https://sec.hh-medic.com
    https://test.hh-medic.com
  ```
### 5.在"开发"-"接口设置"下打开相应权限

 ![](https://imgs.hh-medic.com/icon/wmp/sdk/WX20190225-093837.png)  
    
### 6. 在“设置”-“基本设置”下，将“基础库最低版本设置”设置为2.10.0或更高版本。

---

## SDK说明

### 1. hhDoctor组件

使用视频医生小程序的第一步，需要初始化hhDoctor组件，并调用login()方法进行登录，登录成功后方可使用下方的hh-im、hh-rtc等组件。hhDoctor.login()方法全局调用一次即可，建议在获取到当前微信用户的userToken信息后执行。如执行hhDoctor.login()方法失败，建议给出提示信息。示例代码：

```
const hhDoctor = require('./miniprogram_npm/hhdoctor-wmp-sdk/hhDoctor.js')

hhDoctorLogin() {
    hhDoctor.logout();
    return hhDoctor.login({
      profileName: profileName,     //test:测试环境   prod:生产环境
      subDomain: 'mp',                //根据实际情况填写
      sdkProductId: sdkProductId,   //和缓分配的sdkProductId
      userToken: userToken,         //调用和缓服务器接口注册用户后得到的userToken
      openId: openId,               //当前用户openId
      callPage: '/pages/call/call'  //呼叫页面，在此注册页面后可支持医生回拨
    })
}

```

 - **方法** ：

   - ***`navigateTo(options)`*** :跳转至相应页面，使用方法可参考pages/index/custom页面。
    
     - ****`options`**** :Object，跳转参数，结构如下：

     ```json
     {
       page:'',          //Enum，跳转页面名称，具体指参见下方说明;
       drugOrderId:'',   //String,购药订单ID，当page='drugOrder'时必填。
       redirectPage:'',  //String,支付完成后跳转页面，留空默认跳转至'pages/index/index'
       patient:'',       //String,实际患者的userToken，当page='ehrList'或page='ehrDetail'时必填
       medicRecordId:''  //String,要查看的档案的medicRecordId，当page='ehrDetail'时必填
     }
     ```

      page参数枚举值说明
     ```
     'drugOrder':购药订单详情页; 
     'drugOrderList':购药订单列表页; 
     'personalPage':个人主页; 
     'addressList':地址列表;
     'ehrMemberList':档案库首页; 
     'ehrList':指定成员的档案列表; 
     'ehrDetail': 指定的档案详情;
     ```

### 2. hh-im组件

  - **功能** ：联系医助、查看病历档案

  - **入口** ：hhdoctor-wmp-sdk/hh-im/hh-im

  - **参数说明**： 

    - ***`request`*** :Object，请求参数，说明见下方。
    
  - **事件** 

    - ***`login`***:用户登录事件，登录成功后方可与医助沟通，detail数据结构如下：

    ```json
    {
      success:[true:false]  //是否登录成功 
    }
    ```

### 3. hh-trtc组件
  - **功能** ：呼叫视频医生

  - **入口** ：hhdoctor-wmp-sdk/hh-trtc/hh-trtc

  - **参数说明** ：

    - ***`request`*** :Object，请求参数，说明见下方。
      
    
- **事件** 

  - ***`login`***:用户登录事件，登录成功后正式发起呼叫，detail数据结构如下：

    ```json
    {
      success:[true:false]  //是否登录成功 
    }
    ```
  
    

  - ***`hangup`***:用户挂机事件，detail数据结构如下：

    ```json
    {
      initiative:[true:false],  //是否主动挂机
      hangupType:['HANGUP','CANCEL','TIMEOUT'],  //挂机类型，依次为：正常挂断、取消挂断、超时挂断
      videoDur:Integer  //视频持续时长,单位：秒。
    }
    ```

---

## request参数说明

| 属性         | 类型    | 组件 | 默认值 | 必填 | 说明                                                         |
| ------------ | ------- | ---- | ------ | ---- | ------------------------------------------------------------ |
| profileName  | Enum    | 公共|test   | 是   | **`test`**:测试环境<br />**`prod`**:生产环境                 |
| subDomain  | String    | 公共|无     | 否   | 绑定的业务域名中的二级域名，请填写'mp'。如有疑问请联系开发人员。                             |
| sdkProductId | Integer | 公共|无     | 是   | 和缓分配的sdkProductId                                       |
| userToken    | String  | 公共|无     | 是   | 调用服务器接口注册用户成功后，服务器返回的userToken          |
| openId       | String  | 公共|无     | 是   | 当前用户的微信openId，获取方法参见微信小程序文档：https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/login.html |
| callPage  | String | hh-im | 无 | 否 | 呼叫视频医生页面相对当前页面的位置，例如“/pages/call/call”，点击页面顶部的呼叫医生按纽，可跳转到上述页面进行呼叫。不设置该属性，或该属性值为空字符串，则隐藏最上方的呼叫按钮区域。 |
| personalPage  | String | hh-im | 无 | 否 | 点击左上角图标跳转页面，例如“/pages/my/my”，不设置该属性，或该属性值为空字符串，则点击图标跳转到默认的个人页面。 |
| personalIconVisible  | Boolen | hh-im | true | 否 | 是否显示左上角图标。 |
| dept  | Enum | hh-trtc | 无 | 否 | **`600002`**：呼叫医生咨询成人问题<br />**`600000`**：呼叫医生咨询儿童问题 |
| realPatientUserToken  | String | hh-trtc | 无 | 否 | 实际患者的userToken |
| style | Object | hh-trtc | 无 | 否 | 界面样式，详见下方“style参数说明” |
| cameraTimeoutSeconds       | Integer | hh-trtc | 10 | 否 | 启动摄像头超时(单位：秒)，当因某些原因导致微信无法启动摄像头时，会提示用户，并退出呼叫 |
| cameraTimeoutMessage        | String | hh-trtc | 打开摄像头失败，请重启微信再呼叫 | 否 | 启动摄像头超时后提示用户的信息内容 |
| playTimeoutSeconds        | Integer | hh-trtc | 10 | 否 | 播放医生画面超时(单位：秒)，当因某些原因导致微信无法播放医生画面时，会提示用户，并退出呼叫 |
| playTimeoutMessage        | String | hh-trtc | 播放视频失败，请重启微信再呼叫 | 否 | 播放医生画面超时后提示用户的信息内容 |
| weakNetworkTimeout        | Integer | hh-trtc | 6 | 否 | 弱网监控超时时间(单位：秒)，当小程序与服务器通信往返消息总耗时大于设置的超时时间时，认为当前是弱网环境，会主动终止当前呼叫。 |
| ringtone        | String | hh-trtc | 无 | 否 | 呼叫医生时的振铃音，支持传入文件的url地址，支持mp3格式音频文件，url需在小程序的“downloadFile合法域名”范围内。 该音频文件第一次使用时会下载到小程序本地存储中(key:ringFile)，如更换其他音频文件，需调用wx.clearStorage()或wx.removeStorage()清理缓存后，新的音频文件方可生效  |


## style参数说明
| 属性         | 类型    | 组件 | 默认值 | 必填 | 说明                                                         |
| ------------ | ------- | ---- | ------ | ---- | ------------------------------------------------------------ |
| logoImage  | String    | hh-rtc| 无   | 否   | 与医生对话界面左上角的logo图片url，留空不显示logo。建议图片大小：470 * 120 px，png格式，背景透明 |
| waittingText | String | hh-rtc| 预计接通时间:   | 否   | 在响铃界面倒计时秒数前方显示的文字    |
| navigationBar  | Object    | hh-rtc,hh-im | 无     | 否   | **`bColor`** :标题栏背景色; **`fColor`** :标题栏文字颜色; **`text`** :标题栏文字                             |


