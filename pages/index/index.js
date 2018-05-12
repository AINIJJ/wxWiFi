var app = getApp();
var Bmob = require('../../utils/bmob.js');
Bmob.initialize("7ed45c5048966c70772b8b3bb8e7c725", "6bb8c7cfac2d591f95ae289b3e4ab38e");


Page({

  /**
   * 页面的初始数据
   */
  data: {
    background:' rgba(0, 0, 0, 0)',
    background2: ' rgba(0, 0, 0, 0)',
    color:'#009944',
    color2:'#a61849',
    userInfo:{},//用户信息
    network:'',//网络信息
    wiText:'您已连接到工作区域',
    mangerShow:'none',//管理员入口
    shack:true,
    bg:'../../img/背景.png',
    meters:0,//测量距离
    userId:'',//用户id
    nowState:'',//用户当前状态是已经签过到还是没签到
    leaveState:true
  },
  arriveclick:function(){
    console.log(11)
    var that = this;
    var newData = new Date();
    var arriveTime = newData.getHours() + ':' + newData.getMinutes();

   

    if(this.data.nowState == '0' && this.data.network=="易班学生工作站"){
      var myData = new Date();
      var myWeek = "星期" + myData.getDay();

      var Diary = Bmob.Object.extend("diary");
      var diary = new Diary();
      diary.set("title", this.data.userInfo.nickName);
      diary.set("arrive", arriveTime);
      diary.set("week", myWeek);
      diary.save(null, {
        success: function (result) {
          //新建成功=签到成功-->背景色变换
          that.setData({
            background: '#009944',
            color: '#fff',
            userId: result.id,
            nowState:'1'
          })
          wx.showToast({
            title: '签到成功',
            icon: 'success',
            duration: 2000
          })
        },
        error: function (result, error) {
          // 添加失败
          console.log('创建日记失败');

        }
      });
    } else if (this.data.nowState == '1'){
      wx.showToast({
        title: '已签到',
        icon: 'success',
        duration: 2000
      })
    }else{
      wx.showToast({
        title: '获取wifi失败请稍后重试',
        icon: 'success',
        duration: 2000
      })
    }



  },
  leaveclick:function(e){
    var that = this;
    var getUserId = e.currentTarget.dataset.userid;
    var newData = new Date();
    var leaveTime = newData.getHours() + ':' + newData.getMinutes();
    var Diary = Bmob.Object.extend("diary");
    var query = new Bmob.Query(Diary);
    console.log(getUserId)
    
    if(this.data.leaveState==false){
      wx.showToast({
        title: '已经签离',
        icon: 'success',
        duration: 2000
      })
    }else if(this.data.nowState=='1'&&this.data.network=="易班学生工作站"){
        //检测是否有签到过如果有可以签里，如果没有提示先签到才能签离
      query.get(getUserId, {
        success: function (result) {
          result.set('leave', leaveTime);
          result.save();
          that.setData({
            background2: '#a61849',
            color2: '#fff',
            shack: false,
            leaveState:false
          })
          wx.showToast({
            title: '签离成功',
            icon: 'success',
            duration: 2000
          })

          num = 1;
          // The object was retrieved successfully.
        },
        error: function (object, error) {
             console.log('00')
        }
      });
    }else{
      wx.showToast({
        title: '请先签到',
        icon: 'success',
        duration: 2000
      })
    }

   
  },
  /**
   * 生命周期函数--监听页面加载
   */
    onLoad: function () {
    var that = this
    app.getUserInfo(function (userInfo) {
      //用户信息
      that.setData({
        userInfo: userInfo
      })
      //是否显示管理员入口
      if(that.data.userInfo.nickName=="AINI"){
        that.setData({
          mangerShow:"inline-block"
        })
      }
    //查询数据库中本日签到情况
      var myData = new Date();
      var getMouth = (myData.getMonth() + 1) < 10 ? '0' + (myData.getMonth() + 1) : '' + (myData.getMonth() + 1);
      var getDate = myData.getDate() < 10 ? '0' + myData.getDate() : '' + myData.getDate();
      var nowDay = myData.getFullYear() + '-' + getMouth + '-' + getDate;
      var Diary = Bmob.Object.extend("diary");
      const query =new Bmob.Query(Diary);
      var userName = that.data.userInfo.nickName
      console.log(that.data.userInfo.nickName)
      query.equalTo("title", userName);
      query.equalTo("$and", [{ "createdAt": { "$gte": { "__type": "Date", "iso": nowDay + " 00:00:00" } } }, { "createdAt": { "$lte": { "__type": "Date", "iso": nowDay+" 23:59:59" } } }]);
      query.find().then(res => {
        if(res.length>0){
            that.setData({
              background: '#009944',
              color: '#fff',
              nowState: '1',
              userId:res[0].id
            })
           }else{
          that.setData({
            nowState: '0'
          })
        }
        
      });
    })
    var wifiSelect = '';
    wx.getSystemInfo({
      success: function (res) {
        var system = res.system.toUpperCase();
        for(var i = 0;i<system.length;i++){
          var a = system.charAt(i);
          if (a.charCodeAt() >= 65 && a.charCodeAt() <= 90){
            wifiSelect += system.charAt(i)
          }
        }
      }
    })
    
    if (wifiSelect=="ANDROID"){
      wx.startWifi({
        fail:function(){
          wx.showToast({
            title: '获取wifi失败',
            icon: 'success',
            duration: 2000
          })
        }
      })
      wx.onWifiConnected(function (res) {
        that.setData({
          network: res.wifi.SSID
        })
      })
    }
    
    if (wifiSelect == "IOS"){
      wx.startWifi()
      wx.getConnectedWifi({
        success:function (res) {
          that.setData({
            network: res.wifi.SSID
          })
        
        }
      })
    }
   
  } 
   ,

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
    
  }
})