// components/hh-top/hh-top.js
const hhDoctor = require('../hhDoctor.js');
const apis = require("../utils/api.js");
const md5 = require('../utils/md5.min.js');
const { sendLog } = require('../utils/HH_WMP_SDK.js');
var calling = false;
let that;
let apiUtil ;
let liveListInterval = null;
Component({
    behaviors: [require('../hhBehaviors.js')],
    properties: {
        msgPanelTop:Number,//顶部高度
        navigationBar:Object,
        wxMbb:Object,
        navStyle:String,
        customStyle:Object,
        disConnected:Boolean,
        sysInfo:Object,
        demoStatusInit:{
          type:Number,
          value:-1,
          observer(val){
            this.setData({
              demoStatus:val
            })
          }
        }

    },
    data: {
        _name:'hh-top',
        memberCallTop: -1200,
        isAgreeExplain: true,//呼叫协议,
        callBtnsVisible:false,
        animationMemberData: null,
        liveList: [],
        livePanelHeight:0,
        isLoading: false,
        memberList:[],
        patient:null,
        parent:null,
        demoStatus:-1,
        modalMsgData: { source: 'member', content: '请补充该成员的年龄等信息，才可呼叫医生', confirmText: '立即补充' },//disclaimer member 目前只有补充成员信息和免责声明用到该组件
        deleteCount: 0,//删除成员的个数 
        isShowModal: false,//补全信息的弹窗开关
        sceneNum:'',
        isEnterFace:false,//是否打开人脸识别
        callPageUrl:'',
        showAddBtn:false,
        dept:'600002',
        isInvite:0,//1 邀请成员（多人视频模式）0单人视频（默认值）
        manyVideo:false,//是否显示多人视频入口 根据渠道动态配置
        isOpenAccount:false,
        authList:null,
        isShowAuthTip:false

    },
    lifetimes: {
        attached() {
          that = this;
        },
        detached() {
          that._clearIntervalHandler(liveListInterval);

        }

    },
    pageLifetimes: {
       show(){
        that.getMember();
       },
       hide() {
        that._clearIntervalHandler(liveListInterval);
       }
    },
    methods: {
        _requestComplete() {
          console.log(this.data._request)
          that._getLiveListCycle();
          apiUtil = require('../utils/apiUtil.js');
          that.getMember();
          that._checkSceneNum();
        },
        _naviToApp() {
          //从小程序跳转过来的      
          if (this.data.sceneNum == 1037) {
            wx.navigateBackMiniProgram();
          }
          //从上一个页面进来的
          wx.navigateBack();
        },
        //个人中心
        _viewPers() {
          var pageUrl = this.data._request.personalPage ? this.data._request.personalPage : this.data.basePath + 'innerpages/user/user';
          pageUrl += '?' + this._getPublicRequestParams();
          if (!this.data._request.personalPage) {
            pageUrl += '&addressPage=' + this.data._request.addressPage + '&payPage=' + this.data._request.payPage + '&autoAcl=true';
          }
          pageUrl += '&regPage=' + this.data._request.regPage;

          wx.navigateTo({
            url: pageUrl
          })

      
        },
        // 获取家庭成员
        getMember () {
          this.setData({ sceneNum: wx.getLaunchOptionsSync().scene })
          if (this.data._request.userToken == 'unreg') {
            return;
          }
          wx.showLoading();
          this.setData({
            userCnt: hhDoctor.getProduct() ? hhDoctor.getProduct().userCnt : 0,
            explainUrl:getApp().globalData._hhSdkOptions? encodeURIComponent(getApp().globalData._hhSdkOptions._host.wmpHost + 'wmp/license?type=2000'):'',         
            manyVideo:getApp().globalData.loginUser?getApp().globalData.loginUser.loadcfg.manyVideo:''
          })
          apis.requestGetMember().then(res => {
            wx.hideLoading();
            if (res.status == 200) {
              let memberList = res.data.memberList;
              let patient = res.data.patient;
              wx.setStorageSync('patient', patient)
              memberList.unshift(patient)
              this.setData({
                memberList,
                showAddBtn: res.data.showAddBtn,
                showAccount: res.data.showAccount,
                relationList: JSON.stringify(res.data.relationList),
                deleteCount: res.data.deleteCount, 
                isLoading: true ,
                patient:res.data.patient,
                parent:res.data.parent?res.data.parent:null
              })
              if (hhDoctor && hhDoctor.getUserId()) {
                  hhDoctor.getUserInfo()
                      .then(() => {
                          this.setData({
                              userCnt: hhDoctor.getProduct() ? hhDoctor.getProduct().userCnt : 0
                          })
                      })
              }
              //首次是否弹出信息不全提示
                let integrityCheck =getApp().globalData.loginUser.loadcfg||getApp().globalData.loginUser.loadcfg.integrityCheck;
                if (!this.checkMemberMessage(patient.name, patient.sex, patient.birthday) && integrityCheck){
                    this.setData({
                        modalMsgData: { source: 'member', content: '检测到您的信息不全，请补充您的年龄信息，才可呼叫医生', confirmText: '立即补充' },
                        isShowModal: true,
                        memberUuid: this.data.memberList[0].uuid
                    })
                }
              
            } else {
              wx.showToast({
                title: res.data.message,
                icon: 'none',
                duration: 1000
              })
            }
          }).catch(err=>{
              wx.hideLoading();
          })
        },
      /** 点击呼叫医生 */
      _callDoctor(e) {
        // this._hideBtn();
        if (!this.data._request.callPage || !this.data._request.callBtnVisible) {
          return;
        }
        if (calling) {
          return;
        }
        calling = true;
        wx.showLoading({
          title: '连接中...',
        })
        let uuid = e.currentTarget.dataset.uuid;
        let isAccount = e.currentTarget.dataset.isaccount;
        var callTimeout = 0;

        var callInterval = setInterval(function () {
          if (callTimeout >= 5000) {
            //超时，显示提示信息
            wx.hideLoading();
            calling = false;
            clearInterval(callInterval);
            wx.showModal({
              title: '网络不给力',
              content: '建议切换网络或稍后呼叫医生',
              showCancel: false,
              confirmText:'我知道了',
              confirmColor:'#0592f5',
              success: function () {
                that.triggerEvent('onWsClose')
              }
            })
            return;
          }
          if (!that.data.disConnected && getApp().globalData._hhim && getApp().globalData._hhim.loginStatus()) {
            //登录成功，可以呼叫
            wx.hideLoading();
            clearInterval(callInterval);
            //检查是否是黑名单
            that._checkBlackList()
              .then(() => {
                //用户是否同意视频医生协议
                if (!that.data.isAgreeExplain) {
                  wx.showModal({
                    title: '提示',
                    content: '同意《服务说明》后可发起咨询',
                    showCancel: false,
                    confirmColor: '#0592F5',
                    confirmText: '我知道了',
                    success() {
                      calling = false;
                    }
                  })
                  return;
                }
                //检查信息是否补全
                if (!that.checkMemberMessage(e.currentTarget.dataset.name, e.currentTarget.dataset.sex, e.currentTarget.dataset.birthday)) {
                  that.setData({
                    modalMsgData: { source: 'member', content: '请补充该成员的年龄等信息，才可呼叫医生', confirmText: '立即补充'},
                    isShowModal: true,
                    memberUuid: e.currentTarget.dataset.uuid
                  })
                  calling = false;
                  return;
                }         
                  //节流
                if(that._getThrottle())return;
                //正式呼叫 如果是选择成员 就传成员id 否则就传自己的 以供评价使用
                let pageUrl = that.data._request.callPage + '?' + that._getPublicRequestParams() + '&dept=' + e.currentTarget.dataset.dept + '&uuid=' + uuid;
                if(that.data.isInvite==1){
                  if(!isAccount){
                    //成员未开通独立登录功能
                    wx.showModal({
                      title: '提示',
                      content: '该成员需要开通独立登录的功能才能一起视频',
                      confirmColor: '#0592F5',
                      cancelColor:'#969696',	
                      confirmText: '去开通',
                      cancelText:'取消',
                      success(res) {
                        if (res.confirm) {
                          let item = JSON.stringify(e.currentTarget.dataset.item);
                          let params = `?relationList=${that.data.relationList}&showAccount=${that.data.showAccount}&item=${item}&isedit=true&isOpenAccount=true&pageUrl=${that.data._request.callPage}`;
                          wx.navigateTo({
                              url: `${that.data.basePath}innerpages/ehr-addmember/ehr-addmember${params}`
                          });
                        }
                          calling = false;
                      }
                    });
                    return;  
                  }
                  pageUrl+='&orderType=many_video&isInvite='+that.data.isInvite
                  console.log('pageurl',pageUrl)
                }
                if(that.data._request.sdkProductId==10182){
                  that.setData({
                    isEnterFace:true,
                    callPageUrl:pageUrl
                  })
                  calling = false;
                  return;
                }
                wx.navigateTo({
                  url: pageUrl
                })
                calling = false;
                that._hideBtn();
              }).catch(() => {
                //进入演示模式
                // that._callDemo(e.currentTarget.dataset.dept, 5, uuid);
                calling = false;
              })

            return;
          }
          callTimeout += 100;
        }, 100)
      },
      _getThrottle(){
        let timestamp = Date.parse(new Date());
        let preTimeStamp = wx.getStorageSync('preTimeStamp') || 0;
        let seconds = parseInt((timestamp - preTimeStamp) / 1000)
        if (seconds < 8) {
            wx.showToast({
                title: '操作太频繁啦，稍后再试',
                icon: 'none',
                mask: true,
                duration: 3000
            })
            calling = false;
            return true;
        }
        wx.setStorageSync('preTimeStamp', timestamp)
      },
      _inviteMemberCall(){
        if(!this.data.isAgreeExplain){
          wx.showModal({
            title: '提示',
            content: '同意《服务说明》后可邀请成员',
            showCancel: false,
            confirmColor: '#0592F5',
            confirmText: '我知道了',
            success() {}

        });
        return;
      }
     

        // this._hideBtn()
        // this._showBtn(false);
        this.setData({isInvite:1})
        // setTimeout(()=>{
        //   this._showBtn(true);
        // },250)
        
       
      },
      _inviteMemberCancel(){
        // this._showBtn(false);
        this.setData({isInvite:0})
        // setTimeout(()=>{
        //   this._showBtn(true);
        // },250)
      },
      // 点击呼叫医生按钮 弹出动画 
      _showHideBtn() {
        this._showBtn(!this.data.callBtnsVisible);
        this.setData({isInvite:0})
      },
      //点击呼叫医生按钮 先检查是否授权
      _bindCheckAuthList(){
        let authArr = ['scope.userLocation','scope.record','scope.camera']
        wx.getSetting({
          success(res) {
            console.log('getsetting',res.authSetting,that.data.isShowAuthTip)
            // 如果列表里有一个授权没有 就进行授权前提示 几连弹
            for(var i=0;i<authArr.length;i++){
              console.log(res.authSetting.hasOwnProperty(authArr[i]))
              if(!res.authSetting.hasOwnProperty(authArr[i])){
                //提示用户去授权
                that.setData({
                  authList:null,
                  isShowAuthTip:!that.data.isShowAuthTip
                })
                return;
              }
            }
            // 反之 提示未授权项 进入授权列表手动授权
            that.data.authList={};
            that.data.authList['userLocation']=res.authSetting['scope.userLocation'];
            that.data.authList['record'] = res.authSetting['scope.record'];
            that.data.authList['camera'] = res.authSetting['scope.camera']
            let isEveryAuth = Object.values(that.data.authList).every(that.getIsAuthAll);
            that.setData({
              authList:that.data.authList,
              isShowAuthTip:!isEveryAuth
            })
            if(isEveryAuth){
              that._showHideBtn();
            }
          }})
      },
      //检查是否全部授权
      getIsAuthAll(item){
        return item==true 
      },
      //暂不授权
      bindNoAuth(e){
        that.setData({isShowAuthTip:e.detail})
        if(that.data.authList.record&&that.data.authList.camera){
          this._showHideBtn();
        }
      },
      //hh-auth 子组件返回是否显示授权弹窗
      bindIsShowAuthTip(e){
        that.setData({isShowAuthTip:e.detail})
      },
  
      //隐藏呼叫医生弹出层 
      _hideBtn() {
        this._showBtn(false);
        // this._showUtils(false);
      },
          
      _showBtn(visible) {
        if (visible == this.data.callBtnsVisible) {
          return;
        }
        var animation = wx.createAnimation({
          duration: 250,
          timingFunction: 'ease-in-out',
        })
        // 选择成员列表弹出动画
        this.data.memberCallTop = this.data.msgPanelTop;
        var topPx = visible ? this.data.memberCallTop : -(this.data.memberList.length * 98 + 178);
        animation.top(topPx).step();
        this.setData({
          callBtnsVisible: visible,
          animationMemberData: animation.export(),
        })
      },
      //检查是否为黑名单
      _checkBlackList() {
        return new Promise((resolve, reject) => {
          let url = this._getHost().wmpHost +
            'wmp/isInBlack' +
            '?sdkProductId=' + this.data._request.sdkProductId +
            '&userToken=' + this.data._request.userToken;
          wx.request({
            url: url,
            data: {},
            method: 'POST',
            success: function (res) {
              if (res && res.data &&
                200 == res.data.status &&
                !res.data.data) {
                resolve();
              } else {
                reject();
              }
            },
            fail: function () {
              reject();
            }
          })
        })
      },
      //检查成员信息是否补全
      checkMemberMessage(name,sex,birthday) {
        let obj = {}
        obj['birthday'] = birthday;
        obj['name'] = name;
        obj['sex'] = sex;
        this.setData({storeMsg:obj})
        for (var key in obj) {
            if (obj[key] == '' || !obj[key] || obj[key] == '请完善信息以发起呼叫') {
            return false;
          }
        }
        return true;
      },
      // 进入演示模式
      _callDemo() {
        if (!that.data.isAgreeExplain) {
          wx.showModal({
              title: '提示',
              content: '同意《服务说明》后可进入演示模式',
              showCancel: false,
              confirmColor: '#0592F5',
              confirmText: '我知道了',
              success() {}

          });
          return;
      }
        var pageUrl = that.data._request.demoPage + '?' + that._getPublicRequestParams() + '&dept=' + that.data.dept + '&openType=4' + '&uuid=' + that.data.patient.uuid;
        wx.navigateTo({
          url: pageUrl
        })
        this._hideBtn();
        calling = false;
      },
      //是否同意呼叫协议点击
      _bindIsAgreeExplain() {
        that.setData({
          isAgreeExplain: !that.data.isAgreeExplain
        })
      },
      _bindExplainBook(){
        wx.navigateTo({
          url: that.data.basePath+`innerpages/view/view?url=${that.data.explainUrl}`,
        })
      },
   
      //loadConfig
      _checkSceneNum(){
          let self = this;
          let forbiddenScene = getApp().globalData.loginUser?getApp().globalData.loginUser.loadcfg.forbiddenScene:'';
          if (!forbiddenScene && !forbiddenScene.length){
              return;
          }
          for (var i = 0; i < forbiddenScene.length; i++) {
              if (forbiddenScene[i].scene == self.data.sceneNum) {
                  wx.reLaunch({
                      url: '/pages/error/error?msg=' + forbiddenScene[i].msg
                  })
                  return;
              }
          }
      },
      //添加家庭成员
      bindAddFimily: function () { 
        //检查自己信息是否补全
        if (!that.checkMemberMessage(that.data.memberList[0].name, that.data.memberList[0].sex, that.data.memberList[0].birthday)) {
          that.setData({
            modalMsgData: {
              source: 'member',
              content: '请补充自己的年龄等信息，才可添加成员',
              confirmText: '立即补充'
            },
            isShowModal:true,
            memberUuid: that.data.memberList[0].uuid
          })
          calling = false;
          return;
        } 
          if (!that.data.isAgreeExplain) {
              wx.showModal({
                  title: '提示',
                  content: '同意《服务说明》后可添加成员',
                  showCancel: false,
                  confirmColor: '#0592F5',
                  confirmText: '我知道了',
                  success() {
                      calling = false;
                  }
  
              });
              return;
          }
        if (this.data.userCnt == -1) {
          this.navigateAddMember();
          return;
        }
        let userNum = this.data.userCnt - (this.data.memberList.length - 1) - this.data.deleteCount
        let modalCon = this.data.deleteCount > 0 ? `还可添加${userNum}成员（删除已添加成员后仍占用名额，已删除${this.data.deleteCount}成员），确定添加吗？` : `还可添加${userNum}成员（删除已添加成员后仍占用名额），确定添加吗？`
        this.setData({
          isShowModal: true,
          modalMsgData: { source: 'addmember', content: modalCon, confirmText: '确定添加' }
        })
      },
      //跳转添加成员 
      navigateAddMember() { 
        let params = `?relationList=${this.data.relationList}&showAccount=${this.data.showAccount}&isIndex=true&pageUrl=${this.data._request.callPage}`;
        wx.navigateTo({
          url: `${this.data.basePath}innerpages/ehr-addmember/ehr-addmember${params}`
        })
      },
      //弹窗确定
      _bindMyConfirm(e) {
        that.setData({
          isShowModal: false
        })
        switch (e.currentTarget.dataset.type) {
          case 'member':
                let params = '?isUpdate=' + true + '&pageUrl=' + that.data._request.callPage + '&memberUuid=' + that.data.memberUuid + '&item=' + JSON.stringify(that.data.storeMsg);
            wx.navigateTo({
              url: `${that.data.basePath}innerpages/ehr-addmember/ehr-addmember${params}`
            })
            break;
         case 'addmember':that.navigateAddMember(); 
        break; 
           case 'disclaimer':
            that._viewMedixcine(that.data.modalMsgData.params.drugid, that.data.modalMsgData.params.redirectPage)
            break;
        }
      },
      //进入直播
      _tapLive(e) {
        let live = e.currentTarget.dataset.live;
        if (live.id < 0) return;
        switch (live.liveStatus) {
          case 0:
            wx.showToast({
              title: live.message ? live.message : '请查看开播时间，记得按时观看哦',
              icon: 'none',
              duration: 2500
            })
            break;
          case 1:
            let pageUrl = that.data.basePath + 'innerpages/video/video?' +
              that._getPublicRequestParams() +
              '&liveSource=WMP_BANNER_LIVE' +
              '&enableLiveShare=' + that.data._request.enableLiveShare +
              '&filterType=live' +
              '&videoType=live' +
              '&basePath=' + encodeURIComponent(that.data.basePath) +
              '&videoId=' + live.id;
            wx.navigateTo({
              url: pageUrl,
            })
            break;
          default:
            break;
        }
  
        //上报日志
        apiUtil.reportTrace(live.id, 'live', 'WMP_BANNER_CLICK');
      },

    _getLiveListCycle() {
      that._clearIntervalHandler(liveListInterval);
      that._getLiveList();
      liveListInterval = setInterval(function () {
        that._getLiveList();
      }, 30000)
    },
    /** 获取直播列表 */
    _getLiveList() {
      if ('unreg' == that.data._request.userToken ||
        !that.data._request.callPage || !that.data._request.callBtnVisible) {
        that.setData({
          livePanelHeight: 0
        })
        that.triggerEvent('livePanelHeight',{livePanelHeight:that.data.livePanelHeight})
        return;
      }
      let url = this._getHost().wmpHost +
        'video/bannerList?' + this._getPublicRequestParams();
      wx.request({
        url: url,
        data: {},
        method: 'POST',
        success: function (res) {
          wx.hideLoading();
          if (res && res.data) {
            that._filterLiveList(res.data.list)
          }

        },
        fail: function () {
          that.setData({
            livePanelHeight: 0
          })
          that.triggerEvent('livePanelHeight',{livePanelHeight:that.data.livePanelHeight})

        }
      })
    },
    _filterLiveList(list) {
      let liveList = [];
      for (var i = 0; i < list.length; i++) {
        if (0 == list[i].liveStatus || 1 == list[i].liveStatus) {
          liveList.push(list[i]);
        }
        if (2 == liveList.length) {
          break;
        }
      }
      that.setData({
        liveList: liveList
      })
      that.setData({
        livePanelHeight: that.data.liveList.length > 0 ? 130 : 0
      })
      that.triggerEvent('livePanelHeight',{livePanelHeight:that.data.livePanelHeight})

    },
    bindContinue(){
      that.setData({
        isEnterFace:false     
      })
      wx.navigateTo({
        url: that.data.callPageUrl
      })
    },
    bindBeginFaceVerify(e){
      let self = this;
      self.setData({
        isEnterFace:false
      })
      wx.startFacialRecognitionVerify({
        name:e.detail.username,
        idCardNumber: e.detail.cardid,
        checkAliveType: 2,
        success(res) {
          console.log('success',res)
          wx.navigateTo({
            url: self.data.callPageUrl
          })
        },
        fail(err) {
          console.log('fail',err)
          //如果是被投保人刷脸失败 => 显示让投保人协助认证
          //如果是投保人协助认证刷脸失败 =>显示为被投保人自己刷脸 err.errCode==90100
          if(self.data.parent.uuid!=self.data.patient.uuid){
           let content = (e.detail.username==self.data.parent.name)?'可让被保人'+self.getStarName(self.data.patient.name)+'刷脸认证':'可让投保人'+self.getStarName(self.data.parent.name)+'刷脸帮助认证';
            wx.showModal({
              content: '若刷脸认证失败，'+content,
              confirmText:'我知道了',
              confirmColor:'#0592f5',
              cancelColor:'#666',
              showCancel:false,
              success(){
                
              }
            })
          }
        },
        complete(){
         

        }
  
      })
    },
    getStarName(str){
      return '*'+str.substring(1,str.length)
    },
    //关闭人脸认证界面
    bindCloseFaceVerify(){
      this.setData({isEnterFace:false})
    },
    }
})
