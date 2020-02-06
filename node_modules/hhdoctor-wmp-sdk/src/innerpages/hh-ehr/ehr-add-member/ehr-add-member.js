// components/innerpages/hh-ehr/ehr-add-member/ehr-add-member.js
const app = getApp();
const apis = require("../../../utils/api.js");
Page({

  /**
   * 页面的初始数据
   */
  data: { 
    loginname: '',
    inputVal:'',
    isLoginChecked:false,
    relationList: [],
    gender:["男","女"],
    relationIdx:-1,
    genderIdx:-1,
    date:'',
    isAccount:false
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //上一个页面调用接口返回的数据在这个页面要用 - 传参 编辑模式亦需要将数据传过来
    let relationList = options.relationList ? JSON.parse(options.relationList) : [];
    let relations=[];
    relationList.map((item,index)=>{ relations.push(item.name)})
    let item = options.item ? JSON.parse(options.item) : null;
    this.setData({ 
      relationList, 
      relations, 
      isedit: options.isedit || false, 
      item,
      showAccount: options.showAccount,
      isAccount: item?item.isAccount: false
      })
    if(options.isedit){
      this.getLoadEdit(item);
    }
  },
  //只有编辑 会调用此方法
  getLoadEdit:function(item){
    wx.setNavigationBarTitle({title: '编辑家庭成员'})
    this.data.relations.map((i,index)=>{
      if (i == item.relation){this.data.relationIdx = index}
    })
    let genderIdx = (item.sex == '男') ? 0 : (item.sex == '女') ? 1:-1;
    this.setData({
      inputVal:item.name,
      relationIdx:this.data.relationIdx,
      genderIdx,
      date: this.formatBirth(item.birthday),
      isLoginChecked: item.isAccount,
      loginname: item.isAccount ? item.loginname.split(":")[0]:''
    })
  },
  //生日返回的是时间戳需要转化日期格式
  formatBirth:function(t){
    var date = new Date(t)//一定要记得写这个，不然会报date.getFullYear is not a function
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    month = month < 10 ? '0'+ month : month;
    day = day < 10 ? '0'+ day : day; 
    return year+'-'+month+'-'+day   
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  bindInput: function (e) {
    this.setData({ inputVal: e.detail.value })
  },
  bindBlur: function (e) {
    let val = e.detail.value.replace(/\s+/g, "")
    this.setData({ inputVal: val })
  },
  bindPickerRelation:function(e){
    let genderIdx = this.data.relationList[e.detail.value]['gender'] == '男' ? 0 
                    : this.data.relationList[e.detail.value]['gender']=='女'? 1:-1
    this.setData({ relationIdx: e.detail.value, genderIdx});
  },
  bindPickerGender:function(e){
    this.setData({genderIdx:e.detail.value})
  },
  bindPickerDate:function(e){
    this.setData({date:e.detail.value})
  },
  // 接收子组件是否允许成员独立登录
  bindIsLoginChecked:function(e){
    this.setData({isLoginChecked:e.detail})
  },
  checkPhoneNum: function (phone) {
    return /^1\d{10}$/.test(phone)
  },

  //form-submit
  bindMemberSubmit:function(e){
    const loginname= e.detail.value.loginname;
    let member = {
      name: this.data.inputVal,
      relation: this.data.relations[this.data.relationIdx],
      gender: this.data.gender[this.data.genderIdx],
      birthday: this.data.date
    }
    if (!member.name){
      wx.showToast({
        title: '请输入成员姓名',
        icon:'none'
      })
      return;
    }
    if (!member.relation){
      wx.showToast({
        title: '请选择与成员关系',
        icon: 'none'
      })
      return;
    }
    if (!member.gender){
      wx.showToast({
        title: '请选择性别',
        icon: 'none'
      })
      return;
    }
    if (!member.birthday){
      wx.showToast({
        title: '请选择出生年月',
        icon: 'none'
      })
      return;
    }

    if (this.data.isLoginChecked && !this.data.isedit){
      if(!loginname){
        wx.showToast({
          title: '请输入独立登录手机号',
          icon: 'none'
        })
        return;
      } else if (loginname && !this.checkPhoneNum(loginname)){
         wx.showToast({
           title: '请检查手机号是否正确',
           icon:'none'
         })
         return;
      }
       member['loginname']=loginname;
    }
    
    // if(this.data.isedit){
    //   this.requestUpdateMember(member)
    // }else{
    //   this.requestAddUserMember(member);

    // }
  },
  //更新成员信息
  requestUpdateMember: function(member){
    wx.showLoading({mask:true})
    let memberUuid = this.data.item.uuid;
    apis.requestUpdateMember(member, memberUuid).then(res=>{
      wx.hideLoading();
      if(res.status == 200){
        wx.navigateBack({})
      }else{
        wx.showToast({
          title: res.message,
          icon: 'none',
          duration: 1000
        })
      }

    })
  },
  //添加成员
  requestAddUserMember: function (member){
    wx.showLoading({mask:true});
    apis.requestAddUserMember(member).then(res=>{
      wx.hideLoading();
      if(res.status == 200){
        if (res.data.isAccount){ 
          wx.redirectTo({
            url: '/components/innerpages/hh-ehr/ehr-account/ehr-account'
          })
        }else{
          wx.navigateBack();
        }
      }else{
        wx.showToast({
          title: res.message,
          icon:'none',
          duration:1000
        })
      }
    })
  }
})