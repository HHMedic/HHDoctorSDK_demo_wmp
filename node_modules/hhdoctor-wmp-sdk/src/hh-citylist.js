var that;
var cities;
Component({
  behaviors: [require('./hhBehaviors.js')],
  /**
   * 组件的属性列表
   */
  properties: {
    size: {
      type: Object,
      value: {},
      observer(newVal, oldVal, changedPath) {
        this._resize();
      }
    },
    locationCity: {
      type: String,
      value: ''
    }
  },
  lifetimes: {
    attached() {
      that = this;
    },
    ready() {
      this._getCityList();
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    _name: 'hh-citylist',
    navibarHeight: 0,
    listHeight: 200,
    scopeLocation: true,
    // curCity: '',
    cityList: [],
    hotCityList: []
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _navbarResizeCityList(e) {
      var res = wx.getSystemInfoSync();
      this.setData({
        navibarHeight: e.detail.height,
        listHeight: res.windowHeight - e.detail.height - 97
      })
    },

    // _resize() {
    //   if (this.data.size && this.data.size.height) {
    //     this.setData({
    //       listHeight: this.data.size.height - 97
    //     })
    //   } else {
    //     var res = wx.getSystemInfoSync();
    //     this.setData({
    //       listHeight: res.windowHeight - 97
    //     })
    //   }
    // },

    _getCityList() {
      wx.getSetting({
        success(res) {
          that.setData({
            scopeLocation: res.authSetting['scope.userLocation']
          })
        }
      })

      var url = this._getHost().wmpHost + 'vendor/HH/json/hp_city.json';
      wx.request({
        url: url,
        data: {},
        method: 'GET',
        success: function(res) {
          cities = res.data.list;
          if (cities) {
            that._getHotCities();
            that._filterCities();
          }
        }
      })
    },

    _getHotCities() {
      var hot = [];
      for (var i = 0; i < cities.length; i++) {
        for (var j = 0; j < cities[i].cities.length; j++) {
          if (cities[i].cities[j].isHot) {
            hot.push(cities[i].cities[j]);
          }
        }
      }
      this.setData({
        hotCityList: hot
      })
    },
    _filterCitiesByKw(e) {
      var kw = e.detail.value;
      this._filterCities(kw);
    },

    _filterCities(kw) {
      var city = [];
      for (var i = 0; i < cities.length; i++) {
        for (var j = 0; j < cities[i].cities.length; j++) {
          if (kw) {
            if (cities[i].cities[j].name.indexOf(kw) >= 0) {
              city.push(cities[i].cities[j]);
            }
          } else {
            city.push(cities[i].cities[j]);
          }
        }
      }
      this.setData({
        cityList: city
      })
    },

    _selectCity(e) {
      var city = e.currentTarget.dataset.city;
      this._triggerEvent('citylistselect', city);
    },

    _closeCityList() {
      this._triggerEvent('citylistclose', {});
    },
    _naviBack() {
      that._triggerEvent('naviback', {});
    }
  }
})