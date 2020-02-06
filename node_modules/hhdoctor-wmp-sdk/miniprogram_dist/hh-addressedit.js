var that;
var savePath = '';
Component({

  behaviors: [require('./hhBehaviors.js')],
  /**
   * 组件的属性列表
   */
  properties: {
    address: {
      type: Object,
      value: {},
      observer(newVal, oldVal, changedPath) {
        if (newVal && newVal.name) {
          var sa = this.data.saveAddress;
          sa.address = newVal.name;
          sa.longitude = newVal.location.lng;
          sa.latitude = newVal.location.lat;
          this.setData({
            saveAddress: sa
          })
        }
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    _name: 'hh-addressedit',
    navibarHeight: 1,
    btnEnable: false,
    animation: {},
    saveAddress: {
      name: '',
      phoneNum: '',
      address: '',
      houseNum: '',
      longitude: '',
      latitude: '',
      coordType: 'bd09ll'
    }
  },

  lifetimes: {
    attached() {
      that = this;
    },
    ready() {}
  },
  /**
   * 组件的方法列表
   */
  methods: {
    _requestComplete() {
      console.log(this.data._request.editType);
      if ('update' == this.data._request.editType) {
        this._getAddress();
        savePath = 'updateAddress';
      } else {
        savePath = 'saveAddress';
        this.setData({
          btnEnable: true
        })
      }
    },

    _navbarResize(e) {
      this.setData({
        navibarHeight: e.detail.height + 1
      })
    },
    _selectAddress() {
      this._triggerEvent('selectaddress', {});
    },
    _naviBack() {
      that._triggerEvent('naviback', {});
    },
    _setInputValue(e) {
      var sa = this.data.saveAddress;
      sa[e.currentTarget.dataset.name] = e.detail.value;
      this.setData({
        saveAddress: sa
      })
    },
    _clearInputValue(e) {
      var sa = this.data.saveAddress;
      sa[e.currentTarget.dataset.name] = '';
      this.setData({
        saveAddress: sa
      })
    },
    _checkInputValue() {
      if (!this.data.btnEnable) {
        return;
      }
      this.setData({
        btnEnable: false
      })
      var sa = this.data.saveAddress;

      if (!sa.name || !sa.name.trim()) {
        this._showErrMsg('收件人姓名不能为空');
        return;
      }

      if (20 < sa.name.trim().length) {
        this._showErrMsg('收件人姓名超长');
        return;
      }

      if (!sa.phoneNum) {
        this._showErrMsg('收件人手机号不能为空');
        return;
      }
      if (6 > sa.phoneNum.trim().length || 11 < sa.phoneNum.trim().length) {
        this._showErrMsg('请输入正确的手机号');
        return;
      }

      if (!sa.address) {
        this._showErrMsg('请选择地址');
        return;
      }

      if (sa.houseNum.trim().length > 64) {
        this._showErrMsg('门牌号超长');
        return;
      }
      this._saveAddress();
    },

    _showErrMsg(msg) {
      wx.showModal({
        title: '错误',
        content: msg,
        showCancel: false
      })
      this.setData({
        btnEnable: true
      })
    },
    _getAddress() {
      var url = this._getHost().wmpHost +
        'address/detailP?userToken=' + this.data._request.userToken + '&id=' + this.data._request.addressId;
      wx.request({
        url: url,
        data: {},
        method: 'POST',
        success: function(res) {
          if (res && res.data && 200 == res.data.status) {
            //成功
            that.setData({
              btnEnable: true,
              saveAddress: res.data.data
            })
          } else {
            wx.showModal({
              title: '错误',
              content: '无法编辑地址，请稍后再试',
              showCancel: false
            })
          }
        }
      })
    },
    _saveAddress() {
      var url = this._getHost().wmpHost + 'address/' + savePath + '?userToken=' + this.data._request.userToken;
      var sa = this.data.saveAddress;

      wx.request({
        url: url,
        data: sa,
        method: 'POST',
        success: function(res) {
          that.setData({
            btnEnable: true
          })
          if (res && res.data && 200 == res.data.status) {
            //成功
            that._triggerEvent('saveaddress', {
              success: true
            });
          } else {
            that._triggerEvent('saveaddress', {
              success: false
            });
          }
        }
      })
    }
  }
})