// components/innerpages/hh-ehr/ehr-filing-detail/filing-detail-reply/filing-detail-reply.js
const myaudio = wx.createInnerAudioContext({});
let voicePlaying = false;
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    summaryTalkList:{
      type:Array,
      value:[]
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    src:'https://upload-images.jianshu.io/upload_images/5869240-3b7222682a352ec4.jpg',
    audio:'http://m10.music.126.net/20191108175142/1bc9822408de3a704d92b1dc8d06b534/ymusic/5847/20c3/6894/8443e9f00b796c046e122520976835ad.mp3'
  },
  pageLifetimes: {
    // 组件所在页面的生命周期函数
    hide: function () { 
        wx.hideLoading();
        myaudio.offEnded()
        myaudio.offPlay()
        myaudio.stop()
        voicePlaying = false;
    },
  },
    lifetimes: {
       
        detached() {
            wx.hideLoading();
            myaudio.offEnded()
            myaudio.offPlay()
            myaudio.stop()
            voicePlaying = false;
        }
    },

  /**
   * 组件的方法列表
   */
  methods: {
    bindPreviewImg:function(e){
      let url = e.currentTarget.dataset.src;
      wx.previewImage({
        current: url, // 当前显示图片的http链接
        urls: [url] // 需要预览的图片http链接列表
      })
    },
    bindAudio:function(e){
        if (voicePlaying) {
            wx.hideLoading();
            myaudio.stop();
            voicePlaying = false;
            return;
        }
        myaudio.src = e.currentTarget.dataset.audio;
        // myaudio.src  = 'http://music.163.com/song/media/outer/url?id=1407551413.mp3'		
        myaudio.play();
        myaudio.onPlay(() => {
            console.log('开始播放')
            voicePlaying = true;
            wx.showLoading({
                title: '播放中'
            })
        })
        myaudio.onEnded(() => {
            wx.hideLoading()
            voicePlaying = false;
        })
    //   let audio = e.currentTarget.dataset.audio;
    //   myaudio.src = audio;
    //   myaudio.loop = true;
    //   myaudio.play();
      
   
    }
    
  }
})
