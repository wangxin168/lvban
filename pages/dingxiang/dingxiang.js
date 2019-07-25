// pages/dingxiang/dingxiang.js
// var WxParse = require('../../wxParse/wxParse.js');
const app = getApp()
Page({
  data: {
    imgUrls: [],
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    type:'',
    id:'',
    all_data:{},
    shouci: false,
    my_uid: '',
    position: 'auto',
    no_data:0,
    session_key:'',
    jiangli:'',
    article: {}
  },
  onLoad: function (options) {
    console.log(options)
    var that = this;
    if (options.type){
      that.setData({
        type: options.type,
        id: options.id
      })
    }
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
                if (that.data.type == 1) {
                  that.order_detail();
                } else if (that.data.type == 2) {
                  that.free_order_detail();
                } else {
                  that.setData({
                    no_data: 1
                  })
                }
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
  // 首次进来的授权弹框关闭按钮
  qvxiao: function () {
    var that = this;
    that.setData({
      shouci: false,
      position: 'auto'
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
  fanhui: function () {
    wx.switchTab({
      url: '/pages/home/home',
    })
  },
  order_detail:function(){
    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: getApp().globalData.url + '/api/home/order_detail_api',
      data: {
        order_sn:that.data.id
      },
      success: function (data) {
        wx.hideLoading();
        if (data.data.code == 1) {
          that.setData({
            imgUrls: data.data.data.route_info.img_thumb,
            all_data: data.data.data.route_info
          })
          // let contents = data.data.data.route_info.details
          // WxParse.wxParse('contents', 'html', contents, that);
          let data1 = app.towxml.toJson(data.data.data.route_info.details, 'markdown');                //设置文档显示主题，默认'light'
          data.theme = 'dark';                //设置数据
          that.setData({
            article: data1
          });
          var nodes = data.data.data.route_info.details;
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
        } else {
          wx.showToast({
            title: data.data.error,
            icon: 'loading',
            duration: 1000
          });
        }
      },
      fail: function () {
        wx.hideLoading();
        wx.showToast({
          title: '请求失败',
          icon: 'loading',
          duration: 1000
        })
      }
    })
  },
  __bind_tap: function (e) {
    var that = this;
    wx.previewImage({
      current: that.data.imgs[0], // 当前显示图片的http链接  
      urls: that.data.imgs
    })
  },
  free_order_detail: function () {
    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: getApp().globalData.url + '/api/home/free_order_detail_api',
      data: {
        order_sn: that.data.id
      },
      success: function (data) {
        wx.hideLoading();
        if (data.data.code == 1) {
          that.setData({
            imgUrls: data.data.data.route_info.img_thumb,
            all_data:data.data.data.route_info
          })
          // let contents = data.data.data.route_info.details
          // WxParse.wxParse('contents', 'html', contents, that);
          let data2 = app.towxml.toJson(data.data.data.route_info.details, 'markdown');                //设置文档显示主题，默认'light'
          data.theme = 'dark';                //设置数据
          that.setData({
            article: data2
          });
          var nodes = data.data.data.route_info.details;
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
        } else {
          wx.showToast({
            title: data.data.error,
            icon: 'loading',
            duration: 1000
          });
        }
      },
      fail: function () {
        wx.hideLoading();
        wx.showToast({
          title: '请求失败',
          icon: 'loading',
          duration: 1000
        })
      }
    })
  }
})