// pages/dingque/dingque.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    adult_num:'',
    child_num:'',
    mary:'',
    route_id:'',
    departure_time:'',
    shouci: false,
    succ: false,
    song_jf:'',
    position: 'auto',
    session_key:'',
    jiangli:'',
    my_uid: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    var that=this;
    that.setData({
      adult_num: options.adult_num,
      child_num: options.child_num,
      mary: options.mary,
      route_id: options.route_id,
      departure_time: options.departure_time
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
                wx.setStorageSync('uid', res.data.data.user_info.uid)
                wx.setStorageSync('openid', res.data.data.user_info.openid)
                wx.setStorageSync('user_img', res.data.data.img)
                wx.setStorageSync('user_nickname', res.data.data.nickname)
                wx.setStorageSync('isphone', res.data.data.user_info.mobile)
                that.setData({
                  session_key: res.data.data.user_info.session_key,
                  jiangli: res.data.data.user_info.jiangli
                })
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
  // 关闭授权弹框
  close: function () {
    var that = this;
    that.setData({
      succ: false
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
    // 线路详情
    wx.request({
      url: getApp().globalData.url + '/api/home/route_detail_api',
      data: {
        route_id: that.data.route_id
      },
      success: res => {
        console.log(res)
        that.setData({
          xianlucon: res.data.data.route_info
        })
        console.log(that.data.xianlucon)
        var a = that.data.xianlucon.adult_integral;
        var b = that.data.xianlucon.children_integral;
        var c = a.toString().length;
        var d = b.toString().length;
        console.log(c)
        var e = ''
        if (c > d) {
          e = c;
        } else if (d >= c) {
          e = d;
        }
        console.log(e)
        if (e == 2) {
          that.setData({
            kuan: 56
          })
        } else if (e == 3) {
          that.setData({
            kuan: 62
          })
        } else if (e == 4) {
          that.setData({
            kuan: 76
          })
        } else if (e == 5) {
          that.setData({
            kuan: 78
          })
        }
        var jia_a = that.data.xianlucon.adult_price;
        var jia_b = that.data.xianlucon.children_price;
        var jia_c = jia_a.toString().length;
        var jia_d = jia_b.toString().length;
        var jia_e = ''
        if (jia_c > jia_d) {
          jia_e = jia_c;
        } else if (jia_d >= jia_c) {
          jia_e = jia_d;
        }
        if (jia_e == 2) {
          that.setData({
            jia_kuan: 86
          })
        } else if (jia_e == 3) {
          that.setData({
            jia_kuan: 92
          })
        } else if (jia_e == 4) {
          that.setData({
            jia_kuan: 110
          })
        } else if (jia_e == 5) {
          that.setData({
            jia_kuan: 116
          })
        }
      }
    });
  },
  zhifu:function(){
    var uid = wx.getStorageSync('uid');
    var that=this;
    wx.request({
      url: getApp().globalData.url + '/api/home/add_order_api',
      data: {
        route_id: that.data.route_id,
        uid:uid,
        adult_num: that.data.adult_num,
        child_num: that.data.child_num,
        departure_time: that.data.departure_time,
        money:that.data.mary
      },
      success: res => {
        console.log(res)
        var appId = res.data.data.appId;
        var nonceStr = res.data.data.nonceStr;
        var package1 = res.data.data.package;
        var paySign = res.data.data.paySign;
        var signType = res.data.data.signType;
        var timeStamp = res.data.data.timeStamp;
        var song_jf = res.data.data.song_jf
        wx.requestPayment({
          'nonceStr': nonceStr,
          'package': package1,
          'signType': signType,
          'timeStamp': timeStamp,
          'paySign': paySign,
          'success': function (res) {
            console.log(res)
            that.setData({
              succ:true,
              song_jf: song_jf
            })
            
          },
          'fail': function (res) {
            wx.showToast({
              title: '支付失败',
              icon: 'loading',
              duration: 2000
            });
          }
        })
      }
    });
  },
  shouye:function(){
    wx.switchTab({
      url: '/pages/home/home',
    })
  },
  dingdan:function(){
    wx.switchTab({
      url: '/pages/dingdan/dingdan',
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
})