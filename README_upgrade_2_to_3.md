# 和缓视频医生微信小程序SDK升级指南（2->3）


## 和缓视频医生微信小程序SDK v3.* 主要升级点：

1.升级腾讯TRTC组件到最新版本,提高视频时的进房速度、稳定性和流畅性；

2.使用hh-trtc组件替换hh-rtc组件；

3.修改各组件引用路径；

4.呼叫医生时可以选择实际患者;

5.修改了健康档案相关功能的调用方式;

## 如何升级：
1. **npm更新**

* 打开命令提示符或终端工具，进入项目目录，执行`npm i hhdoctor-wmp-sdk@latest --production`命令更新SDK；
* 使用小程序IDE的“工具”-“构建npm”，重新执行构建；

2. **在相关页面的json配置中修改hhdoctor-wmp-sdk组件的引用路径**

* 打开相关页面的json配置文件，替换组件地址，如下：
```
"hhCall": "hhdoctor-wmp-sdk/hh-trtc/hh-trtc"
"hhIm": "hhdoctor-wmp-sdk/hh-im/hh-im"
"hhSdkContext": "hhdoctor-wmp-sdk/hh-sdkcontext/hh-sdkcontext"
"hhEhr": "已删除，替代用法请参考下方说明"
```

3. **修改健康档案相关功能的调用方式**

* 在页面中以标签形式引入hhSdkContext组件，并request变量

```
<hhSdk id='hhSdk' request='{{hhRequest}}'></hhSdk>
```

* 页面js中定义hhSdk变量

```
let hhSdk = this.selectComponent('#hhSdk');
```

* 使用hhSdk的相应方法调用健康档案的功能（也可参见demo工程的[custom.js](https://github.com/HHMedic/HHDoctorSDK_demo_wmp/blob/master/pages/index/custom.js#L93)）

```
  /** 查看档案库首页 */
  viewEhrList() {
    hhSdk.navigateTo({
      page: 'ehrMemberList'
    })
  },
  /** 查看指定成员的档案列表 */
  viewMemberEhr() {
    hhSdk.navigateTo({
      page: 'ehrList',
      patient: ''         //实际患者userToken
    })
  },
  /** 查看指定的档案详情 */
  viewEhrDetail() {
    hhSdk.navigateTo({
      page: 'ehrDetail',
      patient: '',        //实际患者userToken
      medicRecordId: ''   //档案id
    })
  }
```

4. **呼叫医生时选择实际患者**

* 在`hhdoctor-wmp-sdk/hh-trtc/hh-trtc`组件的`request`参数中增加`realPatientUserToken`属性，填写实际患者的userToken。（也可参见demo工程的[custom.js](https://github.com/HHMedic/HHDoctorSDK_demo_wmp/blob/master/pages/index/custom.js#L46)

5. **将基础库最低版本设置修改为2.10.0**

* 进入微信公众号后台，依次点击【设置】-【基本设置】，找到“基础库最低版本设置”，修改为2.10.0


[<<<返回SDK文档](https://github.com/HHMedic/HHDoctorSDK_demo_wmp)
