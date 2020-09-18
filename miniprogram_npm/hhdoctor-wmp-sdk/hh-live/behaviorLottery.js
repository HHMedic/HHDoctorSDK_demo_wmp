

module.exports = Behavior({
  behaviors: [],
  properties: {},
  data: {},
  attached: function () { },
  methods: {
    getSeckillList(liveId, userPhone) {
      return new Promise((resolve, reject) => {
        if (!liveId) return reject()
        this.data.apiUtil.seckillList(liveId, userPhone)
          .then(res => {
            if (200 != res.status || !res.data) return reject()
            if ('READIED' != res.data.state && 'NOT_APPLY' != res.data.state) return reject()
            resolve(res.data)
          })
          .catch(err => reject(err))
      })

    },
    applySeckill(userPhone) {
      return new Promise((resolve, reject) => {
        let seckillId = this.data.lottery && this.data.lottery.stock && this.data.lottery.stock.seckillId || null
        if (!seckillId || !userPhone) return reject({ status: 400, message: '报名失败' })
        this.data.apiUtil.seckillApply(seckillId, userPhone)
          .then(res => {
            if (200 != res.status) return reject(res)
            resolve(res.data)
          })
          .catch(err => reject(err))
      })
    },
    execSeckill(seckillId, userPhone) {
      return new Promise((resolve, reject) => {
        this.data.apiUtil.seckillSign(seckillId, userPhone)
          .then(res => {
            if (200 != res.status) return reject(res)
            let data = res.data
            if ('IN_PROGRESS' != data.state) return reject(this.getSignResp(data))
            let sign = data.sign
            this.data.apiUtil.seckillExec(seckillId, data.sign, userPhone)
              .then(rres => {
                if (200 != rres.status) return reject(rres)
                if ('SUCCESS' == rres.data.state) return resolve(rres.data)
                reject({ status: 400, message: '很抱歉没有抽中' })
              })
              .catch(eerr => reject(eerr))
          })
          .catch(err => reject(err))
      })
    },
    getSignResp(data) {
      let resp = { status: 400, message: '很抱歉没有抽中' }
      switch (data.state) {
        case 'NOT_STARTED':
          resp.message = '抽奖活动未开始'
          break;
        case 'HAS_ENDED':
          resp.message = '抽奖活动已结束'
          break;
        default:
          break;
      }
      return resp
    }
  }
})