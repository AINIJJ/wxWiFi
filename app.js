App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据  
    // var logs = wx.getStorageSync('logs') || []  
    // logs.unshift(Date.now())  
    // wx.setStorageSync('logs', logs)  
  },
  getUserInfo: function (cb) {
    var that = this;
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口  
      wx.login({
        success: function (res) {
          
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo;
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
    /*
          wx.request({
            url: 'https://api.weixin.qq.com/sns/jscode2session',
            data: {
              appid: 'wxee05e9c02da66028',
              secret: 'fddaa4fe8f571bbb542f2a8ff4d12644',
              js_code: res.code,
              grant_type: 'authorization_code'
            },
            method: 'GET', 
            success:function(res){
              that.globalData.openId = res.data.openid;
            }
          })
    */
        }
      });
    }
  },
  globalData: {
    userInfo: null
  }
})  