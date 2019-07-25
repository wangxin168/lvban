// pages/wode/wode.js
Page({
  data: {
    my_info:'',
    shouci: false,
    my_uid:'',
    position:'auto',
    session_key: '',
    jiangli: ''
  },
  onLoad: function (options) {
    var that = this;
    console.log('onload');
    if (options.previous_id){
      that.setData({
        my_uid:options.previous_id
      })
    }
    if (options.scene) {
      that.setData({
        my_uid: options.scene
      })
    }
  },
  get_login:function(){
    var that = this;
    wx.login({
      success: res => {
        wx.request({
          url: getApp().globalData.url + "/api/api/get_openid_api",
          data: {
            code: res.code
          },
          header: {
            'content-type': 'application/json'
          },
          success: function (res) {
            console.log(res)
            if (res.data.code == 1) {
              if (!wx.getStorageSync('user_img') || !wx.getStorageSync('openid')) {
                wx.setStorageSync('uid', res.data.data.user_info.uid)
                wx.setStorageSync('openid', res.data.data.user_info.openid)
                wx.setStorageSync('user_img', res.data.data.img)
                wx.setStorageSync('user_nickname', res.data.data.nickname)
                wx.setStorageSync('isphone', res.data.data.user_info.mobile)
                that.setData({
                  session_key: res.data.data.user_info.session_key,
                  jiangli: res.data.data.user_info.jiangli
                })
              }else{
                that.get_info()
              }
            } else {
              console.log("失败了")
            }
          }
        })
      }
    })
  },
  //获取用户信息接口
  shouci: function (e) {
    var that = this;
    console.log(e)
    wx.setStorageSync('user_img', e.detail.userInfo.avatarUrl)
    wx.setStorageSync('user_nickname', e.detail.userInfo.nickName)
    wx.login({
      success: res => {
        console.log(res)
        if (res.code) {
          wx.request({
            url: getApp().globalData.url + "/api/api/get_unionid_api",
            data: {
              uid: wx.getStorageSync('uid'),
              code: res.code,
              encryptedData: e.detail.encryptedData,
              iv: e.detail.iv
            },
            header: {
              'content-type': 'application/json'
            },
            success: function (res) {
              console.log(res)
              that.setData({
                shouci:false,
                position:'auto'
              })
              // wx.navigateTo({
              //   url: '/pages/logs/logs',
              // })
            }
          })
        }

      }
    })
    wx.request({
      url: getApp().globalData.url + "/api/api/save_info",
      data: {
        uid: wx.getStorageSync('uid'),
        nickname: e.detail.userInfo.nickName,
        avatar: e.detail.userInfo.avatarUrl,
        previous_id: that.data.my_uid
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {

        if (res.data.code == 1) {
          // console.log(res)
          that.setData({
            shouci: false,
            position: 'auto'
          })
          that.get_info();
          if (that.data.session_key == "") {
            wx.showToast({
              title: '老朋友，欢迎您回家',
              icon: 'none'
            })
          } else {
            wx.showToast({
              title: '您已授权成功，获得' + that.data.jiangli + '积分新用户奖励',
              icon: 'none'
            })
          }
        }
      }
    })
  },
  // 首次进来的授权弹框关闭按钮
  qvxiao: function () {
    var that = this;
    that.setData({
      shouci: false,
      position:'auto'
    })
  },
  get_info:function () {
    console.log("获取信息开始");
    var that = this;
    wx.request({
      url: getApp().globalData.url + '/api/home/personal_api',
      data:{
        uid:wx.getStorageSync('uid')
      },
      success: res => {
        console.log("获取信息");
        console.log(res.data.data.user_info)
        that.setData({
          my_info: res.data.data.user_info
        })
      }
    });
  },
  onShareAppMessage: function () {
    var uid = wx.getStorageSync('uid');
    return {
      // title: '免费线路等你来拿',
      desc: '免费线路等你来拿',
      imageUrl: 'https://www.lvbantongxing.cn/upload/banner/免费线路banner_640_320.png',
      path: '/pages/home/home?previous_id='+uid, // 路径，传递参数到指定页面。
      success: function (res) {
        console.log("成功")
      },
      fail: function (err) {
        console.log("失败")
      }
    }
  },
  onShow:function(){
    var that=this;
    that.get_info();
    if (!wx.getStorageSync('user_img') || !wx.getStorageSync('openid')) {
      that.setData({
        shouci: true,
        position:'fixed'
      })
      that.get_login()
    } else {
      that.get_login()
      that.setData({
        shouci: false,
        position:'auto'
      })
    }
  },
  jilu: function (e) {
    wx.navigateTo({
      url: '/pages/jilu/jilu'
    })
  },
  dingdan:function(){
    wx.switchTab({
      url: '/pages/dingdan/dingdan'
    })
  },
  liushui:function(){
    wx.navigateTo({
      url: '/pages/liushui/liushui'
    })
  },
  lvban:function(){
    wx.navigateTo({
      url: '/pages/holvban/holvban'
    })
  },
  erwei_code:function(){
    wx.navigateTo({
      url: '/pages/erwei_code/erwei_code'
    })
  }
})