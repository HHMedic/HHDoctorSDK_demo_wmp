module.exports = Behavior({
  behaviors: [],
  properties: {},
  data: {},
  attached: function () { },
  methods: {
    getAddressList() {
      return new Promise((resolve, reject) => {
        this.data.apiUtil.getAddressList()
          .then(res => {
            if (200 != res.status || !res.data || 0 == res.data.length) return reject()
            resolve(res.data)
          })
          .catch(err => reject(err))
      })
    },

    saveAddress(seckillId, userPhone, name, phoneNum, address) {
      return new Promise((resolve, reject) => {
        console.log('>>>saveAddress')
        this.data.apiUtil.saveAddress(name, phoneNum, address)
          .then(res => {
            if (200 != res.status) return reject(res)
            this.setAddress(seckillId, userPhone, name, phoneNum, address)
              .then(rres => {
                resolve()
              })
              .catch(eerr => reject(eerr))
          })
          .catch(err => reject(err))
      })
    },

    setAddress(seckillId, userPhone, receiverName, receiverPhone, receiverAddress) {
      return new Promise((resolve, reject) => {
        this.data.apiUtil.setAddress(seckillId, userPhone, receiverName, receiverPhone, receiverAddress)
          .then(res => {
            if (200 != res.status) return reject(res)
            resolve()
          })
          .catch(err => reject(err))
      })

    }
  }
})