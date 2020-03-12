# 和缓视频医生微信小程序使用指南（APP唤起小程序）

## 调用步骤

### 1.在APP中引用微信相关SDK，可参考：https://open.weixin.qq.com/cgi-bin/showdocument?action=dir_list&t=resource/res_list&verify=1&id=21526646385rK1Bs&token=&lang=zh_CN。

关联和缓小程序APPID：wx15e414719996d59f

### 2.步骤一文档中的参数设置如下：
 - ***`userName`*** :和缓微信小程序ID，`gh_95e7300edf4c`。
 - ***`path`*** :填写`pages/newIndex/newIndex?sdkProductId={SDKPRODUCTID}&userToken={USERTOKEN}`，其中sdkProductId参数填写和缓分配的sdkProductId，userToken参数填写服务端注册用户接口返回的userToken。
 - ***`miniProgramType`*** :微信小程序类型，默认是线上版本：
  - iOS：`.release`
  - Android:`WXLaunchMiniProgram.Req.MINIPTOGRAM_TYPE_RELEASE`
