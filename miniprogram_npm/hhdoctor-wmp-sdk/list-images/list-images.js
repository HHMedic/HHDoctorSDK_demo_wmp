// components/innerpages/hh-ehr/ehr-filing-list/list-images/list-images.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    imgUrls:{
      type:Array,
      value:''
    },
    name: String,
    medicRecordId: String,
    memberUuid: String
  },
  behaviors: [require("../hhBehaviors.js")],

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    //预览图片
    bindFilingImg: function (e) {
        console.log(this.data.name)
        if (this.data.name == 'DICOM') {
            let dicomId = this.data.imgUrls[0].dicomId;
            let url = `https://mp.hh-medic.com/ehrweb/view/?module=fileList&mrid=${this.data.medicRecordId}&patientUuid=${this.data.memberUuid}&userToken=${getApp().globalData.loginUser.userToken}&type=DICOM%E4%BF%A1%E6%81%AF&appId=${getApp().globalData.appId}`
            this._viewUrl(url)
        }
        if (this.data.name == '病理信息') {
            let url = `https://dicom.hh-medic.com/pathology/viewer?hospital=${this.data.imgUrls[0].hospitalId}&name=${this.data.imgUrls[0].fileName}`
            this._viewUrl(url)
        }
        if (this.data.name == '病例') {
            let current = this.data.imgUrls[0];
            let urls = this.data.imgUrls;
            wx.previewImage({
                current: current,
                urls: urls
            });
        }    
    }

  }
})
