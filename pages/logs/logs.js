var app = getApp();
var Bmob = require('../../utils/Bmob-1.0.1.min.js');
Bmob.initialize("7ed45c5048966c70772b8b3bb8e7c725", "6bb8c7cfac2d591f95ae289b3e4ab38e");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShow:'none',
    recordBg:'#68a0f4',
    recordBg2: '#cfd0d0',
    ifshow:true,
    userName:'',
    dayTable:true,//按钮切换
    weekTable:false,
    index2:0,
    weekTime: ['周一', '周二', '周三', '周四', '周五', '周六', '周天',],
    th:['姓名','签到','签离','签到总时长'],
    th2: ['姓名', '签到时间段', '签到总时长'],
    tabledata2:[],//本日数据
    tabledata:[],//本周数据
    alldata: ['姓名', '周一', '周二', '周三', '周四', '周五', '周六', '周天', '总时长']
  },
  recordSelect:function(){
      this.setData({
        recordBg:'#68a0f4',
        recordBg2:'#cfd0d0',
        dayTable: true,
        weekTable: false
      })
  },
  recordSelect2: function () {
    this.setData({
      recordBg2: '#68a0f4',
      recordBg: '#cfd0d0',
      weekTable: true,
      dayTable: false
    })
    //查找一周内数据
     var myData = new Date;
     var nowWeek = myData.getDay();
     var getMouth = (myData.getMonth() + 1) < 10 ? '0' + (myData.getMonth() + 1) : '' + (myData.getMonth() + 1);
     var getDate = (myData.getDate() - nowWeek) < 10 ? '0' + (myData.getDate() - nowWeek) : '' + (myData.getDate() - nowWeek);
     var getDate2 = myData.getDate() < 10 ? '0' + myData.getDate() : '' + myData.getDate();
     var that = this;
     var nowDay = myData.getFullYear() + '-' + getMouth + '-' + getDate;
     var oldDay = myData.getFullYear() + '-' + getMouth + '-' + getDate2;
     console.log(getMouth)
     const query = Bmob.Query("diary");
     query.equalTo("createdAt", ">", nowDay + " 00:00:00");
     query.equalTo("createdAt", "<", oldDay + " 23:59:59");
     query.find().then(res => {
       console.log(res)
       var weekDatas = [];//总数据
       var tabletime = {};//总数据里的每条记录内容
       var timerList = [];//一周内某个员工从周一到周天每天签到时长的数组
       var weekAllTime = 0;//一周内某个员工签到的总时长
      //先得到签的所有员工得昵称
       for (var i = 0; i < res.length; i++) {
             tabletime["name"] = res[i].title;
             weekDatas.push(tabletime);
             tabletime = {};
             
       }
       //去掉姓名重复得name
       for (var i = 0; i < weekDatas.length; i++) {
         for (var j = i+1; j < weekDatas.length;j++){
           if (weekDatas[i].name == weekDatas[j].name){
             weekDatas.splice(j, 1);
              j--;
           }
         }
       }

      //统计一周内每天得数据并将数据匹配到相应的人名
       for(var i = 0;i<weekDatas.length;i++){
         for(var j = 0;j<res.length;j++){
           if(weekDatas[i].name==res[j].title){
             var b;
             var a = res[j].arrive.split(':');
             if (res[j].leave) {
               b = res[j].leave.split(':');

             } else {
               res[j].leave = res[i].arrive;
               b = res[j].leave.split(':');
             }
             var time1 = parseInt(a[0] * 3600) + parseInt(a[1] * 60)
             var time2 = parseInt(b[0] * 3600) + parseInt(b[1] * 60)
            //每周所有签到时间段相加
             weekAllTime += (time2 - time1)
             //每天签到时间
             var alltime = parseInt((time2 - time1) / 3600) + ':' + parseFloat((time2 - time1) % 3600 / 60)
             timerList.push(res[j].week + ':'+ alltime)
           }
         }
         weekDatas[i]["timer"] = timerList;
         weekDatas[i]["alltime"] = parseInt(weekAllTime / 3600) + ':' + parseFloat(weekAllTime%3600/60)
         timerList = [];
         weekAllTime = 0;
       }
      //根据昵称在数据库中查询真实姓名
       const user = Bmob.Query("_User");
       user.find().then(res => {

         for (var i = 0; i < weekDatas.length; i++) {
           for (var j = 0; j < res.length; j++) {
             if (weekDatas[i].name == res[j].username) {
               weekDatas[i].name = res[j].name;
             }
           }
         }
         that.setData({
           tabledata: weekDatas
         })

       });
     })
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   //获取用户名
    this.setData({
      userName: options.user
    }) 
   
    var myData = new Date();
    var getMouth = (myData.getMonth() + 1) < 10 ? '0' + (myData.getMonth() + 1) : ''+(myData.getMonth() + 1);
    var getDate = myData.getDate() < 10 ? '0' + myData.getDate() : ''+myData.getDate();
    var dayData=[];
    var that = this;
    var nowDay = myData.getFullYear() + '-' +getMouth + '-' +getDate;
    
    //查询本日数据
    const query = Bmob.Query("diary");
    query.equalTo("createdAt", ">", nowDay+ " 00:00:00");
    query.equalTo("createdAt", "<", nowDay+ " 23:59:59");
    query.find().then(res => {
    
      var alltime;
      var data=[];
      data = res;
      for(var i = 0;i<res.length;i++){
        var b;
        var a = res[i].arrive.split(':');
        if(res[i].leave){
          b = res[i].leave.split(':');
         
        }else{
          res[i].leave = res[i].arrive;
          b = res[i].leave.split(':');
        }
      
        var time1 = parseInt(a[0]) * 3600 + parseInt(a[1] * 60)
        var time2 = parseInt(b[0]) * 3600 + parseInt(b[1] * 60)
        alltime = parseInt((time2 - time1) / 3600) + ':' + parseFloat((time2 - time1) %3600 / 60)
        data[i]["latime"] = ''+alltime;
       
      }
      const user = Bmob.Query("_User");
      user.find().then(res => {

        for (var i = 0; i < data.length; i++) {
          for (var j = 0; j < res.length; j++) {
            if (data[i].title == res[j].username) {
              data[i].title = res[j].name;
            }
          }
        }
        that.setData({
          tabledata2: data
        })

      });
      
    });
   
  },


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