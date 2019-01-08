# 和缓视频医生微信小程序SDK使用指南

和缓视频医生微信小程序SDK（**本SDK**）为小程序自定义组件形式，使用npm方式发布。本文引导开发者从零开始，一步一步搭建起和缓视频医生基本功能框架。如果开发者是在现有项目中集成本SDK，可直接从第2步开始阅读。

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

  - 初始化成功后，执行命令加载SDK：`npm i hhdoctor-wmp-sdk --production`

    ![](https://imgs.hh-medic.com/icon/wmp/sdk/WX20190107-182251.png)

### 4. npm构建

  - 点击IDE菜单中的“工具”-“构建 npm”，如果构建成功，会提示"完成构建“。

### 5. 使用SDK创建页面

  - 使用小程序IDE创建新的页面(以pages/index/index为例)，编辑index.json文件，声明要使用的SDK组件。

    ![](https://imgs.hh-medic.com/icon/wmp/sdk/WX20190107-181921.png)  
  
  - 编辑index.wxml文件，插入SDK组件标签。

    ![](https://imgs.hh-medic.com/icon/wmp/sdk/WX20190107-184046.png)  
  
  - 编辑index.js文件，通过setData()给相应的变量赋值。

## 小程序后台配置

### 1.登录微信小程序管理后台：https://mp.weixin.qq.com

### 2.点击【开发】-【开发设置】

### 3.在”服务器域名“中增加如下配置：

  - request合法域名:https://wmp.hh-medic.com
  - socket合法域名:wss://wmp.hh-medic.com
  - uploadFile合法域名:https://wmp.hh-medic.com
  - downloadFile合法域名:
    - https://wmp.hh-medic.com
    - https://imgfamily.hh-medic.com
    - https://imgs.hh-medic.com

### 4.在"业务域名”下增加如下配置：

  - https://wmp.hh-medic.com
  - https://e.hh-medic.com
  - https://dicom.hh-medic.com

## SDK说明

### 1.公共参数说明

  - **说明** ：以下参数为公共参数(必填)，用于用户登录和身份验证，**hh-im和hh-call组件均需设置**。

  - ***`sdk-product-id`*** :Integer,和缓分配的sdkProductId。

  - ***`user-uuid`*** :Long，通过和缓服务端API/SDK注册用户成功后获取到的用户uuid。

  - ***`user-token`*** :String，md5(sdkProductId+appSecret+uuid)，全小写。

  - ***`open-id`*** :String，当前用户的微信openId，获取方法参见微信小程序文档：https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/login.html

### 2.hh-im组件

  - **功能** ：联系医助、查看健康档案

  - **入口** ：hhdoctor-wmp-sdk/hh-im

  - **参数说明**： 

    - ***`call-page`*** :String，呼叫视频医生页面相对当前页面的位置，例如“../../call/call”，点击页面顶部的呼叫医生按纽，可跳转到上述页面进行呼叫。

    - ***`view-target`*** :Enum枚举，可设置为如下值：
      - **`im`** :显示联系医助界面。
      - **`ehr`** :显示健康档案界面（默认显示家庭成员列表）。

### 3.hh-call组件
  - **功能** ：呼叫视频医生

  - **入口** ：hhdoctor-wmp-sdk/hh-call

  - **参数说明** ：

    - ***`dept`*** :Enum枚举，可设置为如下值：
      - **`600002`** ：呼叫医生咨询成人问题。
      - **`600000`** ：呼叫医生咨询儿童问题。

    - ***`waitting-text`*** :String，呼叫等待界面显示的提示语，默认为：`预计接通时间:`

    - ***`logo-image`*** :String，与医生对话界面左上角的logo图片url，留空显示默认logo。建议图片大小：470 * 120 px，png格式，背景透明。

    
