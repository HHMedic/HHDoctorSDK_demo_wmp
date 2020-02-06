var that;
Component({
  behaviors: [require('./hhBehaviors.js')],
  /**
   * 组件的属性列表
   */
  properties: {
    currentCity: {
      type: String,
      value: '定位中',
      observer(newVal, oldVal, changedPath) {
        //console.log('>>>>currentCity change,', newVal, oldVal);
        if ('定位中' == oldVal) {
          this._getLocation();
        } else if (oldVal && newVal != oldVal) {
          this.setData({
            resultList: []
          })
        }
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    _name: 'hh-addresssearch',
    showCityList: false,
    navibarHeight: 0,
    listHeight: 200,
    cityListSize: {
      height: 300
    },
    resultList: [],
    sysInfo: null
  },
  lifetimes: {
    attached() {
      that = this;
      this._getLocation();
    },
    ready() {
      this._resize();
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    getLocation() {
      this._getLocation();
    },

    _requestComplete() {
      console.log('address search');
    },
    _navbarResize(e) {
      this.setData({
        navibarHeight: e.detail.height
      })
    },
    _resize() {
      var res = wx.getSystemInfoSync();
      var size = {
        height: res.windowHeight - this.data.navibarHeight - 50
      }
      this.setData({
        listHeight: res.windowHeight - this.data.navibarHeight - 150,
        cityListSize: size,
        sysInfo: res
      })
    },
    _getLocation() {
      wx.getLocation({
        success: function(res) {
          that._getLocationByLngLat(res);
        },
        fail: function() {}
      })
    },
    _getLocationByLngLat(e) {
      var url = this._getHost().wmpHost + 'address/searchByCoord?type=1&lng=' + e.longitude + '&lat=' + e.latitude;
      wx.request({
        url: url,
        data: {},
        method: 'POST',
        success: function(res) {
          if (res && res.data && 200 == res.data.status) {
            //成功
            that.setData({
              resultList: res.data.data.list,
              currentCity: res.data.data.geoInfo.city.replace('市', '')
            })
            that._triggerEvent('locatecity', {
              city: that.data.currentCity
            });
          } else {
            console.log('_getLocationByLngLat fail');
          }
        }
      })
    },
    _searchByKeyword(e) {
      this.setData({
        resultList: []
      })
      var url = this._getHost().wmpHost + 'address/searchByKeyword' +
        '?region=' + encodeURIComponent(this.data.currentCity) +
        '&kw=' + encodeURIComponent(e.detail.value);
      wx.request({
        url: url,
        data: {},
        method: 'POST',
        success: function(res) {
          if (res && res.data && 200 == res.data.status) {
            //成功
            that.setData({
              resultList: res.data.data.list
            })
          } else {
            console.log('_getLocationByLngLat fail');
          }
        }
      })
    },
    _selectAddress(e) {
      that._triggerEvent('selectAddress', e.currentTarget.dataset.address);
    },

    _showCityList() {
      that._triggerEvent('showcitylist', {});
    },
    _naviBack() {
      that._triggerEvent('naviback', {});
    }
  }
})