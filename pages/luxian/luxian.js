// pages/luxian/luxian.js
// var WxParse = require('../../wxParse/wxParse.js');
// const Towxml = require('../../towxml/main');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrls: [
      '../img/home/banner.png',
      '../img/home/banner.png',
      '../img/home/banner.png'
    ],
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    route_id: '',
    xianlucon: '',
    code: "",
    phone: "",
    display: false,
    chengren: 0,
    ertong: 0,
    departure_time: [],
    shouquan: false,
    shouci: false,
    message: '',
    kuan: '',
    my_uid: '',
    class_id: '',
    position: 'auto',
    name: '',
    session_key: '',
    route_name: '',
    jiangli: '',
    details: '',
    article: {},
    imgs: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;

    // console.log(options.route_id)

    that.setData({
      route_id: options.route_id
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
    that.huocode();
    if (that.data.my_uid) {
      if (!wx.getStorageSync('user_img') || !wx.getStorageSync('openid')) {
        // 没授权并且是通过分享进来的
        // 从外部进来等于零  因为首页弹框会是1
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
              success: function(res) {
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
                  that.xuanran()
                } else {
                  // console.log("失败了")
                }
              }
            })
          }
        })
      }else{
        that.xuanran();
      }
    }else{
      that.xuanran();
    }
    
  },
  huocode: function() {
    var that = this;
    wx.login({
      success: res => {
        // console.log(res)
        that.setData({
          code: res.code
        })
        wx.request({
          url: getApp().globalData.url + '/api/api/get_phonenum_api',
          data: {
            code: that.data.code
          },
          success: res => {
            // console.log(res)

          }
        });
      }
    })
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
              success: function(res) {
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
            if (that.data.my_uid) {

              that.get_info();
            } else {
              var isphone = wx.getStorageSync('isphone');
              console.log(isphone)
              if (isphone == "") {
                that.setData({
                  shouquan: !that.data.shouquan
                })
              } else {
                that.setData({
                  display: !that.data.display
                })
              }
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
  get_info: function() {
    // console.log("获取信息开始");
    var that = this;
    wx.request({
      url: getApp().globalData.url + '/api/home/personal_api',
      data: {
        uid: wx.getStorageSync('uid')
      },
      success: res => {
        console.log(res)
        // console.log("获取信息");
        // console.log(res.data.data.user_info)
        that.setData({
          my_info: res.data.data.user_info
        })
      }
    });
  },
  onShareAppMessage: function(res) {
    var that = this;
    var uid = wx.getStorageSync('uid');
    // if (res.from === 'button') {
    //   console.log("来自页面内转发按钮");
    //   console.log(res);
    // } else {
    //   console.log("来自右上角转发菜单")
    //   console.log(res);
    // }
    return {
      title: '我参加了' + that.data.route_name + '线路，快来参加吧。',
      // desc: '分享页面的内容',
      path: '/pages/luxian/luxian?previous_id=' + uid + "&route_id=" + that.data.route_id + "&class_id=" + that.data.class_id + "&name=" + that.data.name, // 路径，传递参数到指定页面。
      success: function(res) {
        console.log("成功" + that.data.route_id)
      },
      fail: function(err) {
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
  fanhui: function() {
    wx.switchTab({
      url: '/pages/home/home',
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },
  xuanran: function() {
    var that = this;
    // console.log(that.data.message)

    // 线路详情
    wx.request({
      url: getApp().globalData.url + '/api/home/route_detail_api',
      data: {
        route_id: that.data.route_id
      },
      success: res => {
        // console.log(res)
        if (res.data.code == 2) {
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
          setTimeout(function() {
            wx.switchTab({
              url: '/pages/home/home',
            })
          }, 1000)
        } else {
          that.setData({
            xianlucon: res.data.data.route_info,
            departure_time: res.data.data.route_info.departure_time,
            route_name: res.data.data.route_info.route_name,
            details: res.data.data.route_info.details
          })
          // console.log(that.data.route_name)
          var a = that.data.xianlucon.adult_integral;
          var b = that.data.xianlucon.children_integral;
          var c = a.toString().length;
          var d = b.toString().length;
          // console.log(c)
          var e = ''
          if (c > d) {
            e = c;
          } else if (d >= c) {
            e = d;
          }
          // console.log(e)
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
              kuan: 80
            })
          } else if (e == 5) {
            that.setData({
              kuan: 86
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
              jia_kuan: 118
            })
          }
          // let contents = res.data.data.route_info.details
          // WxParse.wxParse('contents', 'html', contents, that);
          let data = app.towxml.toJson(res.data.data.route_info.details, 'markdown'); //设置文档显示主题，默认'light'
          data.theme = 'dark'; //设置数据
          that.setData({
            article: data
          });
          var nodes = res.data.data.route_info.details;
          if (nodes.indexOf("src") >= 0) {
            //正则匹配所有图片路径
            var imgs = [];
            nodes = nodes.replace(/<img [^>]*src=['"]([^'"]+)[^>]*>/gi, function(match, capture) {
              imgs.push(capture);
              that.setData({
                imgs: imgs
              });
              return '';
            });
            //清除图片后正则匹配清除所有p标签
            nodes = nodes.replace(/<p(([\s\S])*?)<\/p>/g, function(match, capture) {
              return '';
            });
          }
        }

      }
    });
  },
  __bind_tap: function(e) {
    var that = this;
    console.log(that.data.imgs)
    if (that.data.imgs != "") {
      wx.previewImage({
        current: that.data.imgs[0], // 当前显示图片的http链接  
        urls: that.data.imgs
      })
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this;
    // that.xuanran();
    var isphone = wx.getStorageSync('isphone');
  },
  // 成人+
  chengjia: function() {
    var that = this;
    that.setData({
      chengren: that.data.chengren + 1
    })
    // console.log(that.data.chengren)
  },
  // 成人-
  chengjian: function() {
    var that = this;
    that.setData({
      chengren: that.data.chengren - 1
    })
    if (that.data.chengren <= 0) {
      that.setData({
        chengren: 0
      })
    }
    // console.log(that.data.chengren)
  },
  // 儿童+
  erjia: function() {
    var that = this;
    that.setData({
      ertong: that.data.ertong + 1
    })
    // console.log(that.data.ertong)
  },
  // 儿童-
  erjian: function() {
    var that = this;
    that.setData({
      ertong: that.data.ertong - 1
    })
    if (that.data.ertong <= 0) {
      that.setData({
        ertong: 0
      })
    }
    // console.log(that.data.chengren)
  },
  // 提交订单
  submit: function(e) {
    var that = this;
    var route_id = that.data.route_id;
    var adult_num = that.data.chengren;
    var child_num = that.data.ertong;
    var mary = Number(that.data.xianlucon.adult_price * that.data.chengren) + Number(that.data.xianlucon.children_price * that.data.ertong)

    if (mary <= 0) {
      wx.showToast({
        title: '请选择出行人数',
        icon: 'none'
      })
      return;
    } else if (that.data.message == "") {
      wx.showToast({
        title: '请选择出行日期',
        icon: 'none'
      })
      return;
    } else {
      wx.navigateTo({
        url: '/pages/dingque/dingque?adult_num=' + adult_num + '&child_num=' + child_num + '&mary=' + mary + '&route_id=' + route_id + '&departure_time=' + that.data.message
      })
    }

  },
  // 没用的函数  用来防止点击白色的隐藏  不可以删掉
  meiyong: function() {

  },
  yincang: function() {
    var that = this;
    that.setData({
      display: false
    })
  },
  check_date: function() {
    var that = this;
    // wx.navigateTo({
    //   url: '/pages/check_date/check_date?departure_time=' + that.data.departure_time
    // })
    wx.navigateTo({
      url: '/pages/rili/rili?departure_time=' + that.data.departure_time
    })
  },
  // 授权手机号显示隐藏
  pnone_yn: function() {
    var that = this;
    var isphone = wx.getStorageSync('isphone');
    if (!wx.getStorageSync('user_img') || !wx.getStorageSync('openid')) {
      that.setData({
        shouci: !that.data.shouci,
        position: 'fixed'
      })
      wx.login({
        success: res => {
          console.log(res)
          wx.request({
            url: getApp().globalData.url + "/api/api/get_openid_api",
            data: {
              code: res.code,
              previous_id: that.data.my_uid
            },
            header: {
              'content-type': 'application/json'
            },
            success: function(res) {
              console.log(res)
              if (res.data.code == 1) {
                if (!wx.getStorageSync('user_img') || !wx.getStorageSync('openid')) {
                  wx.setStorageSync('uid', res.data.data.user_info.uid)
                  wx.setStorageSync('openid', res.data.data.user_info.openid)
                  wx.setStorageSync('user_img', res.data.data.img)
                  wx.setStorageSync('user_nickname', res.data.data.nickname)

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
    } else {
      // var isphone = wx.getStorageSync('isphone');
      console.log(isphone)
      if (!isphone) {
        that.setData({
          shouquan: !that.data.shouquan,
          position: 'fixed'
        })
      } else {
        that.setData({
          display: !that.data.display
        })
      }
    }

  },
  // 关闭授权弹框
  close: function() {
    var that = this;
    that.setData({
      shouquan: false,
      position: 'auto'
    })
  },
  // 授权手机号
  shouquan: function(e) {
    var that = this;
    that.huocode();
    var uid = wx.getStorageSync('uid');
    wx.checkSession({
      success: function() {
        console.log(e.detail.errMsg)
        console.log(e.detail.iv)
        console.log(e.detail.encryptedData)
        var ency = e.detail.encryptedData;
        var iv = e.detail.iv;
        // var sessionk = that.data.sessionKey;
        if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {

          // that.setData({
          //   modalstatus: true
          // });

        } else { //同意授权
          wx.request({
            method: "GET",
            url: getApp().globalData.url + '/api/api/get_phonenum_api',
            data: {
              uid: uid,
              code: that.data.code,
              encryptedData: ency,
              iv: iv
            },
            header: {
              'content-type': 'application/json' // 默认值
            },

            success: (res) => {
              console.log(res)
              // console.log("解密成功~~~~~~~将解密的号码保存到本地~~~~~~~~");
              if (res.data.code == 1) {
                // console.log('成功')
                wx.setStorageSync('isphone', res.data.data.mobile)
                console.log(res.data.data.mobile)
                that.setData({
                  shouquan: !that.data.shouquan,
                  position: 'fixed',
                  display: true
                })

              }
            },
            fail: function(res) {

              console.log("解密失败~~~~~~~~~~~~~");

              console.log(res);

            }

          });

        }

      },

      fail: function() {

        // console.log("session_key 已经失效，需要重新执行登录流程");

        that.wxlogin(); //重新登录

      }

    });

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

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