var that;
var reqFinish = false;
Component({
  behaviors: [require('./hhBehaviors.js')],
  /**
   * 组件的属性列表
   */
  properties: {
    parentContainer: {
      type: String,
      value: 'page'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    _name: 'hh-addresslist',
    sysInfo: null,
    addressList: []
  },

  lifetimes: {
    attached() {
      that = this;
      var info = wx.getSystemInfoSync();
      this.setData({
        sysInfo: info
      })
    }
  },
  pageLifetimes: {
    show: function() {
      if (reqFinish) {
        reqFinish = false;
        return;
      }
      this._getAddressList();
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    refresh() {
      this._getAddressList();
    },
    _requestComplete() {
      reqFinish = true;
      this._getAddressList();
    },

    _showDeleteMenu(e) {
      if (!this.data._request.enableDelete) {
        return;
      }
      wx.showActionSheet({
        itemList: ['删除地址'],
        success: function(res) {
          var index = res.tapIndex;
          switch (res.tapIndex) {
            case 0:
              that._deleteAddress(e.currentTarget.dataset.address.id);
              break;
            default:
              return;
          }
        }
      })
    },

    _deleteAddress(id) {
      if (!this.data._request.userToken) {
        return;
      }
      var url = this._getHost().wmpHost +
        'address/deleteAddress?userToken=' + this.data._request.userToken + '&id=' + id;
      wx.request({
        url: url,
        data: {},
        method: 'POST',
        success: function(res) {
          if (res && res.data && 200 == res.data.status) {
            //成功
            that._getAddressList();
          } else {
            wx.showModal({
              title: '错误',
              content: '删除失败，请稍后再试',
              showCancel: false
            })
          }
        }
      })
    },

    _getAddressList() {
      if (!this.data._request.userToken) {
        return;
      }
      var url = this._getHost().wmpHost +
        'address/listP?userToken=' + this.data._request.userToken;
      wx.request({
        url: url,
        data: {},
        method: 'POST',
        success: function(res) {
          if (res && res.data && 200 == res.data.status) {
            //成功
            console.log('getaddress success');
            that.setData({
              addressList: res.data.data
            })
            console.log(res.data.data.length);
          } else {}
        }
      })
    },
    _editAddress(e) {
      that._triggerEvent('editaddress', {
        addressId: e.currentTarget.dataset.id
      });
    },

    _selectAddress(e) {
      that._triggerEvent('selectaddress', {
        address: e.currentTarget.dataset.address
      });
    }
  }
})