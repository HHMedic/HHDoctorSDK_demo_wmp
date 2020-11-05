// components/innerpages/eleme-message/eleme-message.js
const validate = require("../../utils/validate.js");
const apis = require('../../utils/api.js');
const api = require("../../utils/api.js");
const { lastIndexOf } = require("../../hhBehaviors.js");
let self ;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        nickname:'',
        username:'',
        useridcard:'',
        userphone:'',
        errorText:'',
        status:0,//0 实名认证 1 生成处方  2 支付失败 3过渡页
        isShowAuth:false,
        isAuth:false,//是否已实名认证
        hasRx:false,//是否有处方
        informationId:'',
        memberUserToken:'',
        medicRecordId:'',
        isConnect:true,
        buttonName:''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        self = this;
        console.log('options',options)
        Object.getOwnPropertyNames(options).forEach((key) => {
            if (options[key] === 'true') {
              options[key] = true
            }
            if (options[key] === 'false') {
              options[key] = false
            }
            if(options[key]==='undefined'){
                options[key] = undefined
            }
          })
       
        this.setData({
            drugCount:options.drugCount,
            drugId:options.drugId,
            nickname:options.name||'',
            userphone:options.phoneNum||'',
            isAuth:options.isAuth,
            hasRx:options.hasRx,
            informationId:options.informationId,
            memberUserToken:options.memberUserToken,
            status:self.data.status,
            medicRecordId:options.medicRecordId,
            buttonName:options.buttonName,
            medicationList:JSON.parse(decodeURIComponent(options.medicationList))
        })       
        console.log(this.data.medicationList)
        if(self.data.drugCount>1){
            self.setData({
                status:-1
            })
            wx.setNavigationBarTitle({
                title:'购药提示'
            })
            return;
        }
        self.getIsShowStatus();
    },
    onShow: function () {
        if(getApp().globalData.globalOptions.scene==1038&&self.data.status==3){
            wx.showLoading()
            apis.requestGetCardInfo(self.data.informationId).then(res=>{
                wx.hideLoading();
                if(res.status==200){
                     //从另一个小程序返回
                    if(res.data.card.isSuccess){
                        wx.navigateBack()
                    }else{
                        // 支付失败
                        self.setData({status:2})
                    }
                }
            }).catch(err=>{
                wx.hideLoading()
                wx.navigateBack()
            })
           

        }
        wx.hideLoading();
    },
    bindUpdateDrugCount(){
        apis.requestUpdateDrugCount(self.data.informationId, self.data.drugId, self.data.drugCount).then(res=>{
            if(res.status==200){
                self.setData({
                    medicationList:res.data.medicationList
                },()=>{
                    self.getIsShowStatus();
                })
            }
        }).catch(err=>{
            wx.showModal({
                title:'',
                showCancel:false,
                confirmText:'返回首页',
                confirmColor:'#0592F5',
                content:'购药失败，请稍后再试',
                success(res){
                  if(res.confirm){
                     wx.navigateBack();
                  }
                }
          })
        })
    },
    //判定是否实名认证
    getIsShowStatus(){
        //处方药
        if(self.data.hasRx){
            self.setData({
                status : self.data.isAuth ? 1: 0   
            })
        if(self.data.status==1){
            self.getCreateRx(self.data.drugId,self.data.medicRecordId)
        }
        }else{
            self.setData({status:1,isShowAuth:true})
        }
        wx.setNavigationBarTitle({
            title:self.data.status==0?'患者信息':self.data.status==1?'处方':'支付失败'
        })
        self.getParams()
    },

    //获取焦点
    bindBlurMsg(e){
        if(e.detail.value){
            switch(e.currentTarget.dataset.type){
                case 'username':self.setData({ errorText:''})
                    break;
                case 'useridcard':
                    if(!validate.checkIdCardNum(self.data.useridcard)){
                        self.setData({
                            errorText:'患者身份证号输入有误，请重新输入'
                        })
                    }else{
                        self.setData({
                            errorText:''
                        })
                    }
                    break;
                case 'userphone':
                    if(validate.checkPhoneNum(self.data.userphone)){
                        self.setData({
                            errorText:''
                        })
                    }else{
                        self.setData({
                            errorText:'联系人电话有误，请检查后输入'
                        })
                    }
                    break;
            }
        }   
    },
    
    // input close
    bindCloseInput(e){    
        console.log('bindclose',e.currentTarget.dataset.type)    
        setTimeout(()=>{
            switch(e.currentTarget.dataset.type){
                        case 'username':self.setData({username:''})
                        break;
                        case 'useridcard':self.setData({useridcard:''})
                        break;
                        case 'userphone':self.setData({userphone:''})
                        break;
                    }
        },50)
      
        console.log(self.data)
    },
    // 键盘输入时-患者姓名
    bindInputMsgName(e){
        this.setData({
            username:e.detail.value
        })
    },
    // 键盘输入时-患者身份证号
    bindInputMsgIdCard(e){
        this.setData({
            useridcard:e.detail.value
        })
    },
    // 键盘输入时 - 联系人电话
    bindInputMsgPhone(e){
        this.setData({
            userphone:e.detail.value
        })
    },
    //实名认证确认提交
    bindSubmit(){
        if(!self.data.username){
            self.setData({
                errorText:'患者真实姓名不能为空'
            })
            return;
        }
        if(!self.data.useridcard){
            self.setData({
                errorText:'患者真实身份证号码不能为空'
            })
            return;
            
        }
        if(!validate.checkIdCardNum(self.data.useridcard)){
            self.setData({
                errorText:'患者身份证号输入有误，请重新输入'
            })
            return;
        }
        if(!validate.checkPhoneNum(self.data.userphone)){
            self.setData({
                errorText:'联系人电话输入有误，请检查后输入'
            })
            return;
        }
        //保存实名信息
        // memberUserToken, name, idCard, phoneNum
        wx.showLoading({mask:true})
        api.requestSaveIdCard(self.data.memberUserToken,self.data.username,self.data.useridcard,self.data.informationId,self.data.userphone).then(res=>{
            wx.hideLoading()
            if(res.status==200){
                //是否够7岁
                if(self.getCurrentAge(self.data.useridcard)<7){
                    wx.showModal({
                          title:'',
                          showCancel:false,
                          confirmText:'我知道了',
                          confirmColor:'#0592F5',
                          content:'据规定，未满7周岁患者不可开具线上处方，请前往医院购药。',
                          success(res){
                            if(res.confirm){
                               wx.navigateBack()
                            }
                          }
                    })
                    return;
                }
                self.getCreateRx(self.data.drugId,self.data.medicRecordId)
            }else{
                self.setData({
                    errorText:res.message
                })
            }
        }).catch(err=>{
            wx.hideLoading();
            getApp().getCheckNetWork();
        })
    },
    
    //生成处方
    getCreateRx(orderid,medicRecordId){
        self.setData({status:1})
        apis.requestCreateRx(orderid,medicRecordId).then(res=>{
            if(res.status==200){
                //授权
                self.setData({
                    isShowAuth:true
                })
            }else{
                wx.showModal({
                    title:'',
                    showCancel:false,
                    confirmText:'返回首页',
                    confirmColor:'#0592F5',
                    content:'处方获取失败，请稍后再试',
                    success(res){
                      if(res.confirm){
                         wx.navigateBack();
                      }
                    }
              })
            }
        }).catch(err=>{
            wx.showModal({
                title:'',
                showCancel:false,
                confirmText:'返回首页',
                confirmColor:'#0592F5',
                content:'处方获取失败，请稍后再试',
                success(res){
                  if(res.confirm){
                     wx.navigateBack();
                  }
                }
          })
        })

    },
    //返回首页
    bindBackIndex(){
        wx.reLaunch({
          url: '/pages/newIndex/newIndex',
        })
    },
    //获取当前年龄
    getCurrentAge(idcard){
        console.log(idcard)
         let now = new Date();
         var month = now.getMonth() + 1;
         var day = now.getDate();
         var age = now.getFullYear() - idcard.slice(6, 10) - 1;
         if (idcard.substring(10, 12) < month || idcard.substring(10, 12) == month && idcard.substring(12, 14) <= day) {
             age++;
         }
         return age;
    },
    //同意授权 跳转到饿了么
    bindAuthAgree(){
        let test = encodeURIComponent(`https://h5.alta.elenet.me/newretail/feat-test1/hehuan/?drug=${self.getParams()}`)
        let prod = encodeURIComponent(`https://h5.ele.me/newretail/p/hehuan/?drug=${self.getParams()}`)
        let path = `/pages/container/index?href=${prod}`;
        console.log('path',path)
        wx.navigateToMiniProgram({
          appId: 'wxece3a9a4c82f58c9',
          path: path,
          envVersion: 'release',//trial 体验版  release 正式版
          success(){
            self.setData({status:3})
          }
        })
    },
    //饿了么传入参数
    getParams(){
        let drug={}
        let drugList = [];
        drug['outId']=100001+'_'+self.data.drugId;
        drug['storeId']=self.data.medicationList[0].storeId;
        drug['partnerId']=100001;
        self.data.medicationList.map((item,index)=>{
            drugList.push([item.drugThirdId,item.count])
        })
        drug['drugList'] = drugList;
        console.log('drug',encodeURIComponent(JSON.stringify(drug)))
        return encodeURIComponent(JSON.stringify(drug))

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

    }
})