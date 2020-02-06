const hhBehaviors = require('./hhBehaviors.js');

var that;

Component({
  behaviors: [hhBehaviors],
  /**
   * 组件的属性列表
   */
  properties: {},

  /**
   * 组件的初始数据
   */
  data: {
    _name: 'hh-ehr',
    url: ''
  },

  lifetimes: {
    attached() {
      that = this;
    },
    ready() {},
    detached() {}
  },
  /**
   * 组件的方法列表
   */
  methods: {

    _requestComplete() {
      this._logInfo('初始化参数完成');
      that._viewEhr();
    },

    _viewEhr() {
      var vParam = 'module=' + this.data._request.viewModule +
        '&appId=' + this.data._request.sdkProductId +
        '&userToken=' + this.data._request.userToken +
        '&openId=' + this.data._request.openId;
      if (this.data._request.appointedOrderId) {
        vParam += ('&orderId=' + this.data._request.appointedOrderId);
      }
      if (this.data._request.appointedDoctorId) {
        vParam += ('&doctorId=' + this.data._request.appointedDoctorId);
      }
      if ('false' == this.data.addMember) {
        vParam += '&hideAddBtn=true';
      }

      if (this.data._request.patient) {
        var p = Number(this.data._request.patient);
        if (isNaN(p)) {
          vParam += '&patientUserToken=';
        } else {
          vParam += '&patient=';
        }
        vParam += this.data._request.patient;
      }
      if (this.data._request.medicRecordId) {
        vParam += '&mrid=' + this.data._request.medicRecordId;
      }
      vParam + '&source=wmpSdk&version=' + this.data._sdkVersion;
      var s = this.data._host.ehrHost + 'view/?' + vParam;
      console.log(s);
      this.setData({
        url: s
      })
    }
  }
})