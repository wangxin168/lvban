// pages/kai_xiang/kai_xiang.js
// var WxParse = require('../../wxParse/wxParse.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    zj_id:'',
    shouci: false,
    my_uid: '',
    indicatorDots: true,
    autoplay: true,
    interval: 2000,
    duration: 1000,
    vertical: true,
    position: 'auto',
    session_key:'',
    jiangli: '',
    article: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    var that = this;
    that.setData({
      zj_id: options.zj_id
    })
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
    if (!wx.getStorageSync('user_img') || !wx.getStorageSync('openid')) {
      console.log(that.data.my_uid)
      // 没授权并且是通过分享进来的
      if (getApp().globalData.isHUdShowed == 0) {
        that.setData({
          shouci: !that.data.shouci,
          position: 'fixed'
        })
      }
      getApp().globalData.isHUdShowed = 1
      console.log(getApp().globalData.isHUdShowed)
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
  shouci: function (e) {
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
                wx.navigateTo({
                  url: '/pages/logs/logs',
                })
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
  get_info: function () {
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
      path: '/pages/home/home?previous_id=' + uid, // 路径，传递参数到指定页面。
      success: function (res) {
        console.log("成功")
      },
      fail: function (err) {
        console.log("失败")
      }
    }
  },
  // 首次进来的授权弹框关闭按钮
  qvxiao: function () {
    var that = this;
    that.setData({
      shouci: false
    })
  },
  fanhui: function () {
    wx.switchTab({
      url: '/pages/home/home',
    })
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
    var that = this;
    
    // 推荐线路
    wx.request({
      url: getApp().globalData.url + '/api/home/already_detail_api',
      data: {
        id: that.data.zj_id
      },
      success: res => {
        console.log(res)
        if (res.data.code == 2) {
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
          setTimeout(function(){
            wx.switchTab({
              url: '/pages/home/home',
            })
          },1000)
        } else {
        that.setData({
          route_info: res.data.data.route_info,
          img_thumb: res.data.data.route_info.img_thumb,
          
        })
        
        // console.log(that.data.route_info)
        // let contents = res.data.data.route_info.details
        // WxParse.wxParse('contents', 'html', contents, that);
          let data = app.towxml.toJson(res.data.data.route_info.details, 'markdown');                //设置文档显示主题，默认'light'
          data.theme = 'dark';                //设置数据
          that.setData({
            article: data
          });
          var nodes = res.data.data.route_info.details;
          if (nodes.indexOf("src") >= 0) {
            //正则匹配所有图片路径
            var imgs = [];
            nodes = nodes.replace(/<img [^>]*src=['"]([^'"]+)[^>]*>/gi, function (match, capture) {
              imgs.push(capture);
              that.setData({
                imgs: imgs
              });
              return '';
            });
            //清除图片后正则匹配清除所有p标签
            nodes = nodes.replace(/<p(([\s\S])*?)<\/p>/g, function (match, capture) {
              return '';
            });
          }
        }
      }
    });
  },
  __bind_tap: function (e) {
    var that = this;
    wx.previewImage({
      current: that.data.imgs[0], // 当前显示图片的http链接  
      urls: that.data.imgs
    })
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

})