const validate = require("../../utils/validate.js")
const host = require("../../utils/hostUtil")
const apis = require('../../utils/api.js')
const customApis = require('../../utils/customApi.js')
const throttle = require('../../utils/commonUtil').throttle
const dateUtil = require("../../utils/dateUtil.js")
const hhDoctor = require('../../hhDoctor.js')
const { naviToMed, navigateToMiniOrderList } = require('../../utils/medicUtil')
const app = getApp()
let currHost;
let patHost
let self;
let data = null
let isShow = false
let REALCODE = {
    PRICECOUNT: 0,//药品未到起送价格
    UNREALNAME: 1,//未实名 默认>=7 可以购买处方 小于7 可购OTC-需监护人（大于等于18） 不可购买RX 联动
    REALNAME: 2,//已实名 确认就诊信息
    CREATERX: 3, //处方或授权
    PAYFAIL: 4, //支付失败或未支付
    WAITING: 5,//过渡页
}
Page({
    /**
     * 页面的初始数据
     */
    data: {
        nickname: '',
        username: '',
        useridcard: '',
        userphone: '',
        errorText: '身份证号码输入有误请重新输入',
        status: -1,//0 实名认证 1 生成处方  2 支付失败 3过渡页
        isShowAuth: false,
        isAuth: false,//是否已实名认证
        hasRx: false,//是否有处方
        informationId: '',
        memberUserToken: '',
        medicRecordId: '',
        isConnect: true,
        buttonName: '',
        diagnosis: [],
        chooseImg: '',
        isPhoto: true
    },

    onLoad: function (options) {
        isShow = false
        wx.hideShareMenu()
        self = this;
        console.log('options====>', options)
        patHost = host.getHost(app.globalData.profile, app.globalData.subDomain).patHost
        currHost = host.getHost(app.globalData.profile, app.globalData.subDomain).wmpHost
        Object.getOwnPropertyNames(options).forEach((key) => {
            if (options[key] === 'true') {
                options[key] = true
            }
            if (options[key] === 'false') {
                options[key] = false
            }
            if (options[key] === 'undefined') {
                options[key] = undefined
            }
        })
        let data = JSON.parse(decodeURIComponent(options.data))
        console.log(data)
        this.setData({
            data:data,
            basePath: options.basePath,
            redirectPage: options.redirectPage || '',
            openId: options.openId,
            userToken: options.userToken,
            sdkProductId: options.sdkProductId,
            drugCount: options.drugCount || '',
            orderId: data.orderId,
            drugId: data.drugId,
            nickname: options.name || '',
            userphone: options.phoneNum || '',
            isAuth: options.isAuth,
            hasRx: options.hasRx,
            informationId: data.id,
            memberUserToken: options.memberUserToken,
            status: self.data.status,
            medicRecordId: data.medicRecordId,
            buttonName: options.buttonName,
            source: data.source,
            pageUrl: options.pageUrl || '',
            token: options.token || '',//xiaoyaoyao
            carturl: data.carturl,
            medicationList: options.medicationList ? JSON.parse(decodeURIComponent(options.medicationList)) : []
        })
        console.log(this.data.medicationList)
        self.getDiagnosis()
        if (self.data.drugCount && self.data.drugCount > 1) {
            self.setData({
                status: REALCODE.PRICECOUNT
            })
            wx.setNavigationBarTitle({
                title: '购药提示'
            })
            return;
        }
        self.getMedicInit();

    },
    onShow: function () {
        console.log(getApp().globalData.globalOptions.scene, self.data.status)
        if ((getApp().globalData.globalOptions.scene == 1038 || self.data.status == REALCODE.PRICECOUNT) && isShow ) {
            wx.navigateBack()
        }
        isShow = true
        /*if (getApp().globalData.globalOptions.scene == 1038 && self.data.status == REALCODE.CREATERX) {
            wx.showLoading()
            apis.requestGetCardInfo(self.data.informationId).then(res => {
                wx.hideLoading();
                if (res.status == 200) {
                    //从另一个小程序返回
                    if (res.data.card.isSuccess) {
                        wx.navigateBack()
                    } else {
                        // 支付失败
                        self.setData({ status: REALCODE.PAYFAIL })
                        wx.setNavigationBarTitle({
                            title: '购药失败'
                        })
                    }
                }
            }).catch(err => {
                wx.hideLoading()
                wx.navigateBack()
            })


        }*/
        // wx.hideLoading();
    },
    //是否达到起送价格 是否是处方药
    getMedicInit() {
        self.setData({
            status: self.data.isAuth ? REALCODE.REALNAME : REALCODE.UNREALNAME
        })
        let title = self.data.status == REALCODE.UNREALNAME ? '实名认证'
            : self.data.status == REALCODE.REALNAME ? '复诊信息'
                : self.data.status == REALCODE.CREATERX ? '处方'
                    : self.data.status == REALCODE.PAYFAIL ? '支付失败'
                        : ''
        wx.setNavigationBarTitle({
            title
        })
    },
    //获取用户诊断信息
    getDiagnosis() {
        wx.showLoading({ mask: true })
        customApis.REQUESTPOSTCUS(currHost, customApis.APIURLS.getDiagnosis, self.data.drugId).then(res => {
            let diagnosis = []
            diagnosis.push({ text: res.data.diagnosis, isCheck: true })
            diagnosis.push({ text: '确认服用过该药且无禁忌症及不良反应', isCheck: true })
            console.log(diagnosis)
            this.setData({ diagnosis })
            wx.hideLoading()
        })
    },
    bindUpdateDrugCount() {
        if (this.throttle('updateDrugCount')) return;
        wx.showLoading({
            mask: true
        })
        apis.requestUpdateDrugCount(self.data.informationId, self.data.drugId, self.data.drugCount).then(res => {
            wx.hideLoading();
            if (res.status == 200) {
                self.setData({
                    medicationList: res.data.medicationList
                }, () => {
                    self.bindAuthAgree()
                })
            }
        }).catch(err => {
            wx.hideLoading();
            wx.showModal({
                title: '',
                showCancel: false,
                confirmText: '返回首页',
                confirmColor: '#0592F5',
                content: '购药失败，请稍后再试',
                success(res) {
                    if (res.confirm) {
                        wx.navigateBack();
                    }
                }
            })
        })
    },
    bindPhoto() {
        wx.chooseImage({
            count: 1,
            sizeType: ['original', 'compressed'],
            success(res) {
                self.setData({
                    chooseImg: res.tempFilePaths[0],
                    isPhoto: false
                })
            }
        })
    },
    bindDelPhoto() {
        self.setData({
            chooseImg: '',
            isPhoto: true
        })
    },
    bindIsUpPhoto() {
        self.setData({
            isPhoto: !self.data.isPhoto
        })
    },


    //实名认证确认提交
    bindSubmit() {
        if (this.throttle('bind-realname')) return;
        data = self.data.isAuth ? '' : this.selectComponent('#realname').submitValidate()
        //完全验证通过后会返回实名数据
        if (!self.data.isAuth && !data) return
        //检查是否勾选确诊疾病
        if (!self.data.diagnosis[0]['isCheck']) {
            wx.showToast({
                title: '请确认确诊疾病',
                icon: 'none'
            })
            return
        }
        if (!self.data.diagnosis[1]['isCheck']) {
            wx.showModal({
                title: '',
                showCancel: false,
                confirmText: '我知道了',
                confirmColor: '#0592F5',
                content: '请确认服用过该药且无禁忌症及不良反应'
            })
            return
        }

        //检查是否勾选上传病例图片
        if (self.data.chooseImg && self.data.isPhoto) {
            wx.showModal({
                title: '',
                showCancel: false,
                confirmText: '我知道了',
                confirmColor: '#0592F5',
                content: '您有待上传病例图片，请确认是否上传病例'
            })
            return
        }
        if (!self.data.chooseImg && !self.data.isPhoto) {
            wx.showModal({
                title: '',
                showCancel: false,
                confirmText: '我知道了',
                confirmColor: '#0592F5',
                content: '请确认是否上传病例'
            })
            return
        }
        // let uploadImg = self.uploadFile(self.data.chooseImg)
        if (self.data.isAuth) {
            self.uploadFile(self.data.chooseImg).then(res => {
                self.getCreateRx(self.data.drugId, self.data.medicRecordId)
            })
            return
        }
        self.getSaveIdCard(data).then(res => {
            self.getCreateRx(self.data.drugId, self.data.medicRecordId)
        })
    },
    //保存实名信息
    getSaveIdCard(data) {
        return new Promise((resolve, reject) => {
            if (!data) {
                resolve()
                return
            }
            wx.showLoading()
            let result = [data['username'], data['idcard'], data['phone'] || data['guardian_phone'], data['guardian_username'] || '', data['guardian_idcard'] || '', self.data.memberUserToken, self.data.informationId, 'ID_CARD', 'ID_CARD']
            customApis.REQUESTPOSTCUS(currHost, customApis.APIURLS.saveIdCard, ...result).then(res => {
                self.uploadFile(self.data.chooseImg).then(res => {
                    wx.hideLoading()
                    resolve()
                })
            }).catch(err => {
                wx.hideLoading()
                wx.showToast({
                    title: err.message || '服务异常',
                    icon: 'none'
                })
                reject(err)
            })
        })
    },

    uploadFile(chooseImg) {
        return new Promise((resolve, reject) => {
            if (!chooseImg) {
                resolve()
                return
            }
            wx.showLoading()
            wx.uploadFile({
                url: `${currHost}proxy/familyapp/drug/order/visit/resource?drugOrderId=${self.data.drugId}&visitPicUrl=${self.data.chooseImg}`,
                filePath: self.data.chooseImg,
                name: 'uploadFile',
                success: function (res) {
                    wx.hideLoading()
                    resolve()
                    // JSON.parse(res.data)
                }
            })
        })

    },

    //生成处方
    getCreateRx(orderid, medicRecordId) {
        self.setData({ status: REALCODE.CREATERX })
        wx.setNavigationBarTitle({
            title: '正在生成处方'
        })
        apis.requestCreateRx(orderid, medicRecordId).then(res => {
            if (res.status == 200) {
                self.setData({
                    isShowAuth: true
                })
                wx.setNavigationBarTitle({
                    title: '个人信息授权'
                })
            } else {
                wx.showModal({
                    title: '',
                    showCancel: false,
                    confirmText: '返回首页',
                    confirmColor: '#0592F5',
                    content: '处方获取失败，请稍后再试',
                    success(res) {
                        if (res.confirm) {
                            wx.navigateBack();
                        }
                    }
                })
            }
        }).catch(err => {
            wx.showModal({
                title: '',
                showCancel: false,
                confirmText: '返回首页',
                confirmColor: '#0592F5',
                content: '处方获取失败，请稍后再试',
                success(res) {
                    if (res.confirm) {
                        wx.navigateBack();
                    }
                }
            })
        })

    },
    //返回首页
    bindBackIndex() {
        wx.reLaunch({
            url: '/pages/newIndex/newIndex',
        })
    },

    //同意授权 ==> 跳转购药页
    bindAuthAgree() {
        if (this.throttle('auth-third-medic')) return;
        switch (self.data.source) {
            case 'eleme':
            case 'elemeB2C':
                if(self.data.data.isEleJumpHh){
                    self.jumpBuyMedicH5();
                    return
                }
                self.jumpEleme()
                break
            case 'yishu':
                self.jumpYiShu()
                break
            case 'xiaoyaoyao':
                self.jumpXiaoYaoYao()
                break
            case 'miao':
                self.jumpMedicMiaoH5(self.data.carturl)
                break
            //renhe ddky ddkyB2C hehuan
            default:
                self.jumpBuyMedicH5();
                break
        }
    },
    jumpBuyMedicH5() {
        getApp().globalData._hhSdkOptions.drugOrderId = self.data.drugId;
        getApp().globalData._hhSdkOptions.redirectPage = self.data.redirectPage;
        let url = `${patHost}drug/order.html?` +
            `drugOrderId=${self.data.drugId}` +
            `&sdkProductId=${self.data.sdkProductId}` +
            `&openId=${self.data.openId}` +
            `&userToken=${self.data.userToken}` +
            `&payPage=${encodeURIComponent(self.data.basePath + 'innerpages/pay/pay')}` +
            `&redirectPage=${self.data.redirectPage}` +
            `&source=wmpSdk` +
            `&_=${new Date().getTime()}`
        let page = this.data.basePath + 'innerpages/view/view?url=' + encodeURIComponent(url)
        console.log(page)
        wx.navigateTo({ url: page })
    },

    jumpMedicMiaoH5(cartUrl) {
        let url = `${self.data.basePath}innerpages/view/view?url=${encodeURIComponent(cartUrl + '&thirdId=' + self.data.openId)}`
        wx.navigateTo({ url })
    },
    //跳转饿了么
    jumpEleme() {
        let test = encodeURIComponent(`https://h5.alta.elenet.me/newretail/feat-test1/hehuan/?drug=${self.getParams()}`)
        let prod = encodeURIComponent(`https://h5.ele.me/newretail/p/hehuan/?drug=${self.getParams()}`)
        let path = `/pages/container/index?href=${prod}`;
        navigateToMiniOrderList('eleme', path)
        // wx.navigateToMiniProgram({
        //     appId: 'wxece3a9a4c82f58c9',
        //     path: path,
        //     envVersion: 'release',//trial 体验版  release 正式版
        //     success() {
        //     }
        // })
        //hhDoctor.navigateToMiniProgram('eleme', path)

    },
    jumpYiShu() {
        //壹树-跳转壹安康小程序
        let path = `pages/webview/hh/index?orderId=${self.data.orderId}`;
        navigateToMiniOrderList('yiShu', path, 'trial')
        //hhDoctor.navigateToMiniProgram('yiShu', path, 'trial')
        // wx.navigateToMiniProgram({
        //     appId: 'wx56923640462b4e69',//'wxd4e5d6c3d86f9760',wx56923640462b4e69,
        //     path,
        //     envVersion: 'trial',//trial 体验版  release 正式版
        //     success() {
        //     }
        // })
    },
    jumpXiaoYaoYao() {
        //荷叶健康-跳转小程序
        let path = `pages/channelDocking/channelDocking`
        path += `?token=${self.data.memberUserToken}&orderId=${self.data.drugId}&tel=${self.data.userphone}&source=hehuan&status=0`
        console.log(path)
        navigateToMiniOrderList('xiaoYaoYao', path)
        // wx.navigateToMiniProgram({
        //     appId: 'wx776afedbfae3a228',//'',
        //     path,
        //     envVersion: 'trial',//trial 体验版  release 正式版
        //     success() {
        //     }
        // })
        //hhDoctor.navigateToMiniProgram('xiaoYaoYao', path)
    },

    //饿了么传入参数
    getParams() {
        let drug = {}
        let drugList = [];
        drug['outId'] = 100001 + '_' + self.data.drugId;
        drug['storeId'] = self.data.medicationList[0].storeId;
        drug['partnerId'] = 100001;
        self.data.medicationList.map((item, index) => {
            drugList.push([item.drugThirdId, item.count])
        })
        drug['drugList'] = drugList;
        return encodeURIComponent(JSON.stringify(drug))

    },


    //线下已确诊
    bindDiagnosis(e) {
        console.log(e)
        let index = e.currentTarget.dataset.index
        this.data.diagnosis.map((item, idx) => {
            if (index == idx) {
                item['isCheck'] = !item['isCheck']
            }
        })
        this.setData({ diagnosis: this.data.diagnosis })
    },

    throttle(btn, wait) {
        return throttle(btn, wait)
    }
})