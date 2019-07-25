// pages/mian_xiang/mian_xiang.js
// var WxParse = require('../../wxParse/wxParse.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    indicatorDots: true,
    autoplay: true,
    interval: 2000,
    duration: 1000,
    vertical: true,
    route_id: '',
    route_info: [],
    img_thumb: [],
    shouquan: false,
    tz_amount: '',
    total_amount: '',
    jifen_n: false,
    display: false,
    user_score: '',
    zuiduo: '',
    zuixiao: '',
    remain_tz: '',
    chaole: false,
    chou_succ: false,
    shouci: false,
    my_uid: '',
    position: 'auto',
    zuixiao_xiao: '',
    session_key: '',
    route_name: '',
    jiangli: '',
    // 抽奖时显示积分是0
    chou_ji: 0,
    article: {},
    id: '',
    yiman: false,
    zuisheng:'',
    zhezhao:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options.user_score)
    wx.removeStorage({
      key: 'tz_amount',
      success: function(res) {
        console.log(res)
      },
    })
    var that = this;
    that.setData({
      route_id: options.route_id,
      user_score: options.user_score,
      id: options.id,
      // total_amount: options.total_amount
    })
    if (options.zuiduo) {
      that.setData({
        zuiduo: options.zuiduo
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
    if(that.data.my_uid){
      var that=this;
      if (!wx.getStorageSync('user_img') || !wx.getStorageSync('openid')) {
        // that.huocode();
        console.log(that.data.my_uid)
        // 没授权并且是通过分享进来的
        if (getApp().globalData.isHUdShowed == 0) {
          that.setData({
            shouci: !that.data.shouci,
            position: 'fixed'
          })
        }
        getApp().globalData.isHUdShowed = 1
        // console.log(getApp().globalData.isHUdShowed)
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
                  that.xianlu_dea()
                } else {
                  console.log("失败了")
                }
              }
            })
          }
        })
      }else{
        that.xianlu_dea()
      }
    }else{
      that.xianlu_dea()
    }
  },
  huocode:function(){
    var that=this;
    wx.login({
      success: res => {
        console.log(res)
        that.setData({
          code: res.code
        })
        wx.request({
          url: getApp().globalData.url + '/api/api/get_phonenum_api',
          data: {
            code: that.data.code
          },
          success: res => {
            console.log(res)

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
            if(that.data.my_uid){
              
              that.get_info();
            }else{
              var isphone = wx.getStorageSync('isphone');
              if (isphone == "") {
                that.setData({
                  shouquan: !that.data.shouquan
                })
                return;
              } else if (that.data.user_score < that.data.tz_amount) {
                that.setData({
                  jifen_n: !that.data.jifen_n
                })
                return;
              } else {
                that.setData({
                  display: !that.data.display
                })
                that.get_info();
              }
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
  mianfei: function() {
    wx.switchTab({
      url: '/pages/mianfei/mianfei'
    })
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
  onShareAppMessage: function() {
    var that = this;
    var uid = wx.getStorageSync('uid');
    return {
      title: '我参加了' + that.data.route_name + '线路抽奖，快来获取免费线路吧。',
      // desc: '分享页面的内容',
      path: '/pages/mian_xiang/mian_xiang?previous_id=' + uid + "&route_id=" + that.data.route_id + '&user_score=' + that.data.user_score + '&zuiduo=' + that.data.zuiduo+'&id=' + that.data.id, // 路径，传递参数到指定页面。
      success: function(res) {
        console.log("成功")
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
  huo_jifen: function() {
    wx.navigateTo({
      url: '/pages/holvban/holvban',
    })
    var that = this;
    that.setData({
      jifen_n: false
    })
  },
  // 授权手机号显示隐藏
  choujiang: function() {
    var that = this;
    var isphone = wx.getStorageSync('isphone');
    console.log(isphone)
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
      var isphone = wx.getStorageSync('isphone');
      if (isphone == "") {
        that.setData({
          shouquan: !that.data.shouquan
        })
        return;
      } else if (that.data.user_score < that.data.tz_amount) {
        that.setData({
          jifen_n: !that.data.jifen_n
        })
        return;
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
      jifen_n: false,
      chaole: false,
      chou_succ: false
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
          that.setData({
            modalstatus: true
          });
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
              console.log("解密成功~~~~~~~将解密的号码保存到本地~~~~~~~~");
              if (res.data.code == 1) {
                console.log('成功')
                wx.setStorageSync('isphone', res.data.data.mobile)
                that.setData({
                  shouquan: !that.data.shouquan,
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

        console.log("session_key 已经失效，需要重新执行登录流程");

        that.wxlogin(); //重新登录

      }

    });
  },
  yincang: function() {
    var that = this;
    that.setData({
      display: false
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },
  xianlu_dea:function(){
    var that=this
    var isphone = wx.getStorageSync('isphone');
    console.log(wx.getStorageSync('uid'))
    wx.request({
      url: getApp().globalData.url + '/api/home/free_line_detail_api',
      data: {
        route_id: that.data.route_id,
        id: that.data.id,
        uid: wx.getStorageSync('uid')
      },
      success: res => {
        console.log(res)
        if (res.data.code == 2) {
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
          setTimeout(function () {
            wx.switchTab({
              url: '/pages/home/home',
            })
          }, 1000)
        } else {
          that.setData({
            route_info: res.data.data.route_info,
            route_name: res.data.data.route_info.route_name,
            img_thumb: res.data.data.route_info.img_thumb,
            // 最小
            tz_amount: res.data.data.route_info.tz_amount,
            // 现在的减去最小的  判断是否超出了
            zuixiao_xiao: res.data.data.route_info.tz_amount,
            // 总数
            total_amount: res.data.data.route_info.total_amount,
            // 剩余投注
            remain_tz: res.data.data.route_info.remain_tz,
            user_score: res.data.data.route_info.user_score
          })
          wx.setStorageSync('zuixiao', res.data.data.route_info.tz_amount)
          that.setData({
            zuixiao: wx.getStorageSync('zuixiao')
          })
          // 判断积分和总数大小
          if (that.data.user_score > res.data.data.route_info.remain_tz) {
            that.setData({
              zuiduo: res.data.data.route_info.remain_tz
            })
          } else {
            that.setData({
              zuiduo: that.data.user_score
            })
          }
          // console.log(that.data.route_info)
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
          if (wx.getStorageSync('tz_amount')) {
            that.setData({
              tz_amount: wx.getStorageSync('tz_amount')
            })
          }
        }
      }
    });
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this;
    // that.xianlu_dea();
  },
  __bind_tap: function(e) {
    var that = this;
    wx.previewImage({
      current: that.data.imgs[0], // 当前显示图片的http链接  
      urls: that.data.imgs
    })
  },
  // +
  erjia: function() {
    var that = this;
    that.setData({
      chou_ji: that.data.chou_ji + 1
    })
    console.log(that.data.chou_ji)
    if (that.data.chou_ji > 1) {
      var zuixiao = wx.getStorageSync('zuixiao')
      console.log(that.data.tz_amount)
      console.log(that.data.zuiduo)
      if (that.data.tz_amount > that.data.zuiduo - that.data.zuixiao_xiao) {
        wx.showToast({
          title: '已达到免费线路最大可投注额，请点击抽奖按钮，进行抽奖',
          icon: 'none'
        })
      } else {
        that.setData({
          tz_amount: that.data.tz_amount + zuixiao
        })
        console.log(that.data.tz_amount)
        wx.setStorageSync('tz_amount', that.data.tz_amount)
      }
    }

  },
  //-
  erjian: function() {
    var that = this;
    var zuixiao = wx.getStorageSync('zuixiao')
    that.setData({
      tz_amount: that.data.tz_amount - zuixiao
    })
    console.log(that.data.tz_amount)
    if (that.data.tz_amount <= 0) {
      that.setData({
        tz_amount: 0
      })
    }
  },
  submit: function() {
    var that = this;
    that.setData({
      zhezhao:true
    })
    if (that.data.chou_ji == 0) {
      that.setData({
        zhezhao: false
      })
      wx.showToast({
        title: '投注金额错误',
        icon: 'none'
      })
      return;
    }
    if (that.data.remain_tz < that.data.tz_amount) {
      console.log('超了')
      that.setData({
        chaole: !that.data.chaole
      })
      that.setData({
        zhezhao: false
      })
    } else {
      wx.request({
        url: getApp().globalData.url + '/api/home/add_bet_before',
        data: {
          route_id: that.data.route_id,
          uid: wx.getStorageSync('uid'),
          total: that.data.tz_amount,
          id: that.data.id
        },
        success: res => {
          console.log(res)
          that.setData({
            zhezhao: false
          })
          console.log('点了提交')
          if (res.data.code == 1) {
            that.setData({
              zuisheng: res.data.data
            })
            if (that.data.tz_amount>res.data.data){
              that.setData({
                chaole: true
              })
            }else{
              wx.request({
                url: getApp().globalData.url + '/api/home/add_bet_api',
                data: {
                  route_id: that.data.route_id,
                  uid: wx.getStorageSync('uid'),
                  total: that.data.tz_amount,
                  id: that.data.id
                },
                success: res => {
                  console.log(res)
                  console.log('点了提交')
                  if (res.data.code == 1) {
                    that.setData({
                      // chaole: true,
                      chou_succ: true
                    })
                  } else if (res.data.code == 2) {
                    wx.showToast({
                      title: res.data.msg,
                      icon: 'none'
                    })
                  } else if (res.data.code == 3) {
                    that.setData({
                      yiman: true
                    })
                  }

                }
              });
            }
          } else if (res.data.code == 2) {
            wx.showToast({
              title: res.data.msg,
              icon: 'none'
            })
          } else if (res.data.code == 3) {
            that.setData({
              yiman: true
            })
          }

        }
      });
      
    }

  },
  // 确认抽奖
  que_chou: function() {
    var that = this;
    wx.request({
      url: getApp().globalData.url + '/api/home/add_bet_api',
      data: {
        route_id: that.data.route_id,
        uid: wx.getStorageSync('uid'),
        total: that.data.tz_amount,
        id: that.data.id
      },
      success: res => {
        console.log(res)
        if (res.data.code == 1) {
          that.setData({
            chaole: false,
            chou_succ: true
          })
        }
      }
    });
  },
  // 跳转抽奖记录
  queren: function() {
    var that = this;
    that.setData({
      chou_succ: false,
      display: false
    })
    wx.redirectTo({
      url: '/pages/jilu/jilu?previous_id='+that.data.my_uid
    })
  },
  // 跳转免费线路
  xianlu: function() {
    var that = this;
    that.setData({
      chou_succ: false,
      display: false
    })
    wx.switchTab({
      url: '/pages/mianfei/mianfei'
    })
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