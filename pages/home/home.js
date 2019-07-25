// pages/home/home.js
// require('../fuyong/fuyong.js');
// <template is="odd" />
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrls: [],
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    xianlu: [],
    shouci: false,
    my_uid: '',
    uid_uid: '',
    url: '',
    user_img: "",
    position: 'auto',
    session_key: '',
    scene:'',
    jiangli:''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
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
    var open_id = wx.getStorageSync('openid')
    if (!wx.getStorageSync('user_img') || !wx.getStorageSync('openid')) {
      // 没授权并且是通过分享进来的
      // if (getApp().globalData.isHUdShowed == 0) {
        that.setData({
          shouci: !that.data.shouci,
          position: 'fixed'
        })
      // }
      getApp().globalData.isHUdShowed = 1
      console.log(getApp().globalData.isHUdShowed)
      wx.login({
        success: res => {
          console.log(res)
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
                  wx.setStorageSync('isphone', res.data.data.user_info.mobile)
                  
                  that.setData({
                    session_key: res.data.data.user_info.session_key,
                    jiangli: res.data.data.user_info.jiangli
                  })
                  console.log(that.data.jiangli)
                } else {
                  that.get_info()
                }
              } else {
                console.log("失败了")
              }
            }
          })
        }
      })
    }

  },
  //获取用户信息接口
  shouci: function(e) {
    console.log(e)
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
                that.setData({
                  shouci: false,
                  position: 'auto'
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
        success: function(res) {
          console.log(res)
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
                title: '您已授权成功，获得' + that.data.jiangli+'积分新用户奖励',
                icon: 'none'
              })
            }
          }
        }
      })
    } else {
      var that=this;
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
  get_info: function() {
    console.log("获取信息开始");
    var that = this;
    wx.request({
      url: getApp().globalData.url + '/api/home/personal_api',
      data: {
        uid: wx.getStorageSync('uid')
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
  // 首次进来的授权弹框关闭按钮
  qvxiao: function() {
    var that = this;
    that.setData({
      shouci: false
    })
  },
  mianfei: function() {
    wx.switchTab({
      url: '/pages/mianfei/mianfei'
    })
  },
  lvban: function() {
    wx.navigateTo({
      url: '/pages/holvban/holvban'
    })
  },
  tiaozhuan: function(e) {
    console.log(e)
    var that = this;
    if (e.currentTarget.dataset.type == 1) {
      wx.navigateTo({
        url: '/pages/mian_xiang/mian_xiang?route_id=' + e.currentTarget.dataset.route_id + '&id='+e.currentTarget.dataset.id
      })
    } else if (e.currentTarget.dataset.type == 2) {
      wx.navigateTo({
        url: '/pages/luxian/luxian?route_id=' + e.currentTarget.dataset.route_id
      })
    } else if (e.currentTarget.dataset.type == 3) {
      wx.navigateTo({
        url: '/pages/holvban/holvban'
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this;
    var open_id = wx.getStorageSync('openid')
    that.setData({
      uid_uid: wx.getStorageSync('uid')
    })
    // console.log(that.data.uid_uid)
    // 首页轮播图
    wx.request({
      url: getApp().globalData.url + '/api/home/carousel_api',
      success: res => {
        console.log(res)
        that.setData({
          imgUrls: res.data.data.crousel
        })
      }
    });
    // 推荐线路
    wx.request({
      url: getApp().globalData.url + '/api/home/recommend_api',
      success: res => {
        // console.log(res)
        that.setData({
          xianlu: res.data.data.recommend_route
        })
        console.log(that.data.xianlu)
      }
    });
    
  },

  lvyou: function(e) {
    console.log(e)
    wx.navigateTo({
      url: '/pages/lvyou/lvyou?class_id=' + e.currentTarget.dataset.class_id + '&name=' + e.currentTarget.dataset.name
    })
  },
  luxian: function(e) {
    // console.log(e)
    wx.navigateTo({
      url: '/pages/luxian/luxian?route_id=' + e.currentTarget.dataset.route_id
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    var that = this;
    that.setData({
      shouci: false,
      position: 'auto'
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },


})