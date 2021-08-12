//房间内成员状态枚举
const roomStatusEnum = {
  LEAVE: -1,    //离开房间
  WAIT: 0,      //等待进房
  IN: 1         //在房间中
}
//房间内成员角色枚举
const roomRoleEnum = {
  DOCTOR: 1,    //医生
  PATIENT: 2    //患者
}

module.exports = Behavior({
  behaviors: [],
  properties: {
    myBehaviorProperty: {
      type: String
    }
  },
  data: {
    roomers: {},      //房间内所有成员
  },
  attached: function () { },
  methods: {
    /** 患者等待进房 */
    patientWait(userId) {
      let id = 'uuid_' + userId
      this.data.roomers[id] = {
        userId,
        status: roomStatusEnum.WAIT,
        role: roomRoleEnum.PATIENT
      }
    },
    /** 医生等待进房 */
    doctorWait(userId) {
      let id = 'uuid_' + userId
      this.data.roomers[id] = {
        userId,
        status: roomStatusEnum.WAIT,
        role: roomRoleEnum.DOCTOR
      }
    },
    /** 进房 */
    roomerJoin(userId) {
      let id = 'uuid_' + userId
      if (!this.data.roomers[id]) return
      this.data.roomers[id].status = roomStatusEnum.IN
    },
    /** 退房，返回房间是否活跃 */
    roomerLeave(userId) {
      let id = 'uuid_' + userId
      if (!this.data.roomers[id]) return
      this.data.roomers[id].status = roomStatusEnum.LEAVE
      return this.roomDismissed()
    },
    /** 获取房间中用户数量 */
    roomerCount(role, status) {
      return this.roomerList(role, status).length
    },
    /** 获取房间中的用户 */
    roomerList(role, status) {
      let list = Object.keys(this.data.roomers).filter(id => {
        let match = true
        if (role) match = match && this.data.roomers[id].role == role
        if (status) match = match && this.data.roomers[id].status == status
        return match
      })
      return list
    },
    /** 房间是否已解散（医生或患者数量为0） */
    roomDismissed() {
      let doctors = this.roomerCount(roomRoleEnum.DOCTOR, roomStatusEnum.IN),
        patients = this.roomerCount(roomRoleEnum.PATIENT, roomStatusEnum.IN)
      console.log(`>>> doctors:${doctors},patients:${patients},dismissed:${doctors == 0 || patients == 0}`)
      return doctors == 0 || patients == 0
    },
    /** 主动解散房间 */
    dismissRoom() {
      this.setData({ roomers: {} })
    }
  }
})