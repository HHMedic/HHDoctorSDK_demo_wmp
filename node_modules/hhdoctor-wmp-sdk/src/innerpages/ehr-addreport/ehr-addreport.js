const uiUtil = require('../../utils/uiUtil')
const dateUtil = require('../../utils/dateUtil')
const app = getApp()
let self, apiUtil, sdkProductId, userToken, uploadedFiles = []
Page({

  /**
   * 页面的初始数据
   */
  data: {
    peName: '',
    peDate: '',
    peDateMax: dateUtil.format(new Date(), 'yyyy-M-d'),
    fileType: '',
    licenseChecked: false,
    pdfList: [],
    imageList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    self = this
    sdkProductId = options && options.sdkProductId || app.globalData._hhSdkOptions._sdkProductId || ''
    userToken = options && options.userToken || app.globalData._hhSdkOptions._userToken || ''
    apiUtil = require('../../utils/apiUtil')
  },
  inputValue(e) {
    this.setData({ [e.currentTarget.dataset.field]: e.detail.value })
  },

  changeFileType(e) {
    this.setData({ fileType: e.currentTarget.dataset.fileType })
  },
  checkLicense() {
    this.setData({ licenseChecked: !this.data.licenseChecked })
  },
  tapFile(e) {
    let ds = e.currentTarget.dataset
    switch (ds.type) {
      case 'pdf':
        wx.openDocument({ filePath: ds.url.path, fileType: 'pdf' })
        break
      case 'image':
        wx.previewImage({ urls: ds.list, current: ds.list.length - 1 })
        break
      case 'add':
        if (!this.data.fileType) return uiUtil.toast('请选择文件格式')
        return this.addFile()
      default: return
    }
  },
  addFile() {
    switch (this.data.fileType) {
      case 'image':
        wx.chooseImage({
          count: 9,
          sizeType: ['original'],
          success: res => {
            if (!res || !res.tempFilePaths || !res.tempFilePaths.length) return
            self.data.imageList.push(...res.tempFilePaths)
            self.setData({ imageList: self.data.imageList })
          }
        })
        return
      case 'pdf':
        wx.chooseMessageFile({
          count: 3,
          type: 'file',
          extension: ['PDF', 'pdf', 'Pdf'],
          success: res => {
            if (!res || !res.tempFiles || !res.tempFiles.length) return
            self.data.pdfList.push(...res.tempFiles)
            self.setData({ pdfList: self.data.pdfList })
          }
        })
        return
      default: return
    }
  },
  commit() {
    uploadedFiles = []
    if (!this.data.peName) return uiUtil.toast('请填写报告名称')
    if (!this.data.peDate) return uiUtil.toast('请选择体检日期')
    if (!this.data.pdfList.length && !this.data.imageList.length) return uiUtil.toast('请上传报告')
    if (!this.data.licenseChecked) return uiUtil.toast('请同意用户隐私协议')
    let list = []
    list.push(...this.data.imageList)
    this.data.pdfList.forEach(pdf => { list.push(pdf.path) })
    uiUtil.loading('上传中...')
    this.doUploadFile(list, 0)
  },
  doUploadFile(list, index) {
    if (index >= list.length) return this.commitHealthData()
    apiUtil.uploadFile(list[index]).then(res => {
      uploadedFiles.push(res)
      this.doUploadFile(list, index + 1)
    }).catch(err => uiUtil.error(err, '系统错误，请稍后再试'))
  },
  commitHealthData() {
    apiUtil.addHealthReport(sdkProductId, userToken, this.data.peDate + ' 00:00:00', uploadedFiles, 20, this.data.peName).then(res => {
      /*uiUtil.modal('', '体检报告上传成功', '我知道了', '', false).then(res => {
        wx.navigateBack({ delta: 1 })
      }).catch(err => uiUtil.error(err, '系统错误，请稍后再试'))*/
      //uiUtil.toast('资料上传成功')
      //setTimeout(() => { wx.navigateBack({ delta: 1 }) }, 1500)
      uiUtil.hideLoading()
      wx.navigateBack({ delta: 1 })
    }).catch(err => uiUtil.error(err, '系统错误，请稍后再试'))
  },
  viewLicense() {
    wx.navigateTo({
      url: `../view/view?url=${encodeURIComponent(app.globalData._hhSdkOptions._host.wmpHost + 'wmp/license?type=10888')}`,
    })
  }
})