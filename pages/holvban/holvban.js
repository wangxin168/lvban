// pages/holvban/holvban.js
Page({
  data: {
    yq_count:'',
    integral:'',
    yq_score:'',
    shouci: false,
    position: 'auto',
    my_uid:'',
    session_key:'',
    jiangli: ''
  },
  onLoad: function (options) {
    var that = this;
    if (options.previous_id) {
      that.setData({
        my_uid: options.previous_id
      })
    }
    if (options.scene) {
      that.setData({
        my_uid: options.scene
      })
    }
    that.get_login()
    if (!wx.getStorageSync('user_img') || !wx.getStorageSync('openid')) {
      console.log(that.data.my_uid)
      // 没授权并且是通过分享进来的
      if (getApp().globalData.isHUdShowed == 1) {
        that.setData({
          shouci: true,
          position: 'fixed'
        })
      }
      getApp().globalData.isHUdShowed = 1
      console.log(getApp().globalData.isHUdShowed)
      that.get_login()
    } else {
      that.get_login()
    }
  },
  get_login: function () {
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
              } else {
                that.get_data_info()
              }
            } else {
              console.log("失败了")
            }
          }
        })
      }
    })
  },
  get_data_info(){
    var that = this;
    wx.request({
      url: getApp().globalData.url + '/api/home/my_partner_api',
      data: {
        uid: wx.getStorageSync('uid')
      },
      success: res => {
        that.setData({
          yq_count: res.data.data.infos.yq_count,
          integral: res.data.data.infos.integral,
          yq_score: res.data.data.infos.yq_score
        })
      }
    });
  },
  get_lv_list:function(){
    wx.navigateTo({
      url: '/pages/lvban/lvban',
    })
  },
  get_prize_list:function(){
    wx.navigateTo({
      url: '/pages/prize/prize',
    })
  },
  fanhui: function () {
    wx.switchTab({
      url: '/pages/home/home',
    })
  },
  //获取用户信息接口
  shouci: function (e) {
    console.log(e)
    var that = this;
    if (e.detail.userInfo) {
      var that = this;
      wx.setStorageSync('user_img', e.detail.userInfo.avatarUrl)
      wx.setStorageSync('user_nickname', e.detail.userInfo.nickName)
      wx.login({
        success: res => {
          console.log(res)
          if(res.code){

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
          console.log(res)
          
          if (res.data.code == 1) {
            // console.log(res)
            that.setData({
              shouci: false,
              position: 'auto'
            })
            // that.get_info();
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

            // wx.switchTab({
            //   url: '/pages/mianfei/mianfei'
            // })
          }
        }
      })
    } else {
      var that = this;
      that.setData({
        shouci: false,
        position: 'auto'
      })
      wx.showToast({
        title: '进行微信授权可体验更多精彩服务',
        icon: 'none'
      })
    }
  },
  // 首次进来的授权弹框关闭按钮
  qvxiao: function () {
    var that = this;
    that.setData({
      shouci: false
    })
  },
  onShareAppMessage: function () {
    var uid = wx.getStorageSync('uid');
    return {
      // title: '免费线路等你来拿',
      desc: '免费线路等你来拿',
      imageUrl: 'https://www.lvbantongxing.cn/upload/banner/免费线路banner_640_320.png',
      path: '/pages/home/home?previous_id=' + uid, // 路径，传递参数到指定页面。
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
    that.get_data_info()
  }
})